import { Client as GeniusClient } from 'genius-lyrics';
import axios from 'axios';

export async function getGeniusLyrics(query: string) {
  const client = new GeniusClient();
  const results = await client.songs.search(query);

  const song = results?.[0];
  if (!song) throw new Error('No lyrics found');

  if (song.instrumental) throw new Error('It is instrumental, no lyrics');

  const lyrics = await song.lyrics();
  if (!lyrics) throw new Error('No lyrics found');

  return {
    title: song.title,
    url: song.url,
    thumbnail: song._raw?.song_art_image_url || song.image,
    lyrics,
  };
}

export interface Lyrics {
  name: string;
  trackName: string;
  artistName: string;
  plainLyrics: string;
  duration: number;
}

export async function getLyrics({
  query,
  title,
}: {
  query: string;
  title?: string;
}): Promise<Lyrics[]> {
  const data = await axios.get('https://lrclib.net/api/search', {
    params: {
      q: query,
      ...(title && {
        track_name: title,
      }),
    },
    headers: {
      'User-Agent': 'Reol discord bot (https://github.com/AitakattaSora/Reol)',
    },
  });

  const lyrics = (data?.data || []).filter((l: any) => l.plainLyrics) as any[];

  return lyrics;
}
