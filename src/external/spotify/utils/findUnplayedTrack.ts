import { RadioSessionTrack } from '../../../interfaces/Queue';
import { Track } from '../../../interfaces/Track';
import { getYoutubeTrackByQuery } from '../../../utils/youtube/getYoutubeTrack';
import { getSpotifyTrackTitle } from './getSpotifyTrackTitle';

interface SpotifyTrack {
  id: string;
  title: string;
}

function isTrackPlayed(
  youtubeUrl: string,
  playedTracks: RadioSessionTrack[]
): boolean {
  for (let track of playedTracks) {
    if (track.youtubeUrl === youtubeUrl) {
      return true;
    }
  }
  return false;
}

export async function findUnplayedTrack(
  recommendations: SpotifyTrack[],
  playedTracks: RadioSessionTrack[]
): Promise<Track | null> {
  for (const track of recommendations) {
    const query = getSpotifyTrackTitle(track.id);
    const youtubeTrack = await getYoutubeTrackByQuery(query);

    if (!isTrackPlayed(youtubeTrack.url, playedTracks)) {
      youtubeTrack.metadata = {
        artist: '',
        title: track.title,
        spotifyTrackId: track.id,
      };

      return youtubeTrack;
    }
  }

  return null;
}
