import { AppDataSource } from '../db';
import { SongRequest } from '../db/entities/SongRequest';
import { getSpotifyTrackByQuery } from '../external/spotify/getSpotifyTrackByQuery';
import stringSimilarity from 'string-similarity';
import pLimit from 'p-limit';
import { cleanYoutubeTitle } from '../utils/youtube/cleanYoutubeTitle';
import { transliterate } from 'transliteration';

function extractTitle(str: string): string {
  const parts = str.split(' - ');
  if (parts.length >= 2) {
    return parts.slice(1).join('-').trim().toLowerCase();
  }
  return str.trim().toLowerCase();
}

function extractArtists(str: string): string[] {
  const parts = str.split(' - ');
  if (parts.length >= 2) {
    return parts[0]
      .toLowerCase()
      .split(/,|&|and/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

function looksLikeOST(artistStr: string): boolean {
  return /(ost|soundtrack|original score)/i.test(artistStr);
}

export function isSimilarEnough(
  youtubeTitle: string,
  spotifyTrackTitle: string,
  artist: string
): boolean {
  const ytRaw = youtubeTitle.toLowerCase();
  const spotifyRaw = `${artist} - ${spotifyTrackTitle}`.toLowerCase();

  const ytTranslit = transliterate(ytRaw);
  const spotifyTranslit = transliterate(spotifyRaw);

  const score1 = stringSimilarity.compareTwoStrings(ytRaw, spotifyRaw);
  const score2 = stringSimilarity.compareTwoStrings(ytTranslit, spotifyRaw);
  const score3 = stringSimilarity.compareTwoStrings(ytRaw, spotifyTranslit);
  const score4 = stringSimilarity.compareTwoStrings(
    ytTranslit,
    spotifyTranslit
  );

  const maxGlobalScore = Math.max(score1, score2, score3, score4);

  const ytTitle = extractTitle(ytRaw);
  const spotifyTitle = extractTitle(spotifyRaw);

  const titleScore = stringSimilarity.compareTwoStrings(ytTitle, spotifyTitle);

  const ytArtists = extractArtists(ytRaw);
  const spotifyArtists = extractArtists(spotifyRaw);

  const ytIsOST = looksLikeOST(ytRaw);
  const spotifyIsOST = looksLikeOST(spotifyRaw);

  const matchingArtists = ytArtists.filter((ytArtist) =>
    spotifyArtists.some((spArtist) => spArtist.includes(ytArtist))
  );

  const artistOverlap = matchingArtists.length > 0;

  if (titleScore > 0.7) {
    return true;
  }

  if (titleScore > 0.5 && artistOverlap) {
    return true;
  }

  if (titleScore > 0.5 && (ytIsOST || spotifyIsOST)) {
    return true;
  }

  if (maxGlobalScore > 0.7) {
    return true;
  }

  return false;
}

export async function normalizeSongRequests() {
  console.time('normalize');
  await AppDataSource.initialize();

  const repo = AppDataSource.getRepository(SongRequest);
  const requests = await repo.find({
    where: {
      name: '',
      artist: '',
    },
  });

  const total = requests.length;
  let done = 0;

  const cache = new Map<
    string,
    Awaited<ReturnType<typeof getSpotifyTrackByQuery>>
  >();
  const limit = pLimit(4); // 5 concurrent lookups

  const tasks = requests.map((r) =>
    limit(async () => {
      const rawTitle = r.title.trim();
      const cleanedTitle = cleanYoutubeTitle(rawTitle);

      if (cache.get(cleanedTitle)) {
        const c = cache.get(cleanedTitle);

        const artistStr = c?.artists.map((a) => a.name).join(', ');
        const trackTitle = c?.name;

        await repo.update(r.id, {
          artist: artistStr,
          name: trackTitle,
        });

        console.log(
          `${r.title} ---------------------------------------> "${artistStr} - ${trackTitle}"`
        );

        return;
      }

      let track = null;
      try {
        track = await getSpotifyTrackByQuery(cleanedTitle);
        cache.set(cleanedTitle, track);
      } catch (err: any) {
        console.log(err);
        return;
      }

      if (!track) return;

      const artistStr = track.artists.map((a) => a.name).join(', ');
      const trackTitle = track.name;

      if (!isSimilarEnough(cleanedTitle, trackTitle, artistStr)) {
        console.log(`Skipped: ${r.title}`);
        await repo.update(r.id, { name: '' });
        return;
      }

      await repo.update(r.id, {
        artist: artistStr,
        name: trackTitle,
      });

      done++;
      console.log(
        `${r.title} ---------------------------------------> "${artistStr} - ${trackTitle}"`
      );

      if (done % 100 === 0) {
        console.log(
          '\n================================================================================'
        );
        console.log(`Done ${done}, left ${total - done}`);
        console.log(
          '================================================================================\n'
        );
      }
    })
  );

  await Promise.all(tasks);

  console.log(`All done. Total: ${total}`);
  console.timeEnd('normalize');
}

normalizeSongRequests();
