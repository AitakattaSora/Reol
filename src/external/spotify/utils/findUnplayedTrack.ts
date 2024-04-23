import { RadioSessionTrack } from '../../../interfaces/Queue';
import { Track } from '../../../interfaces/Track';
import { getYoutubeTrackByQuery } from '../../../utils/youtube/getYoutubeTrack';

interface SpotifyTrack {
  id: string;
  title: string;
}

export async function findUnplayedTrack(
  recommendations: SpotifyTrack[],
  playedTracks: RadioSessionTrack[]
): Promise<Track | null> {
  for (const spotifyTrack of recommendations) {
    const youtubeTrack = await getYoutubeTrackByQuery(
      spotifyTrack.title + ' lyrics'
    );

    const isTrackPlayed = playedTracks.some((pt) => {
      return (
        pt.youtubeUrl === youtubeTrack.url ||
        pt.title === spotifyTrack.title ||
        pt.spotifyId === spotifyTrack.id
      );
    });

    if (!isTrackPlayed) {
      youtubeTrack.metadata = {
        artist: '',
        title: spotifyTrack.title,
        spotifyTrackId: spotifyTrack.id,
      };

      return youtubeTrack;
    }
  }

  return null;
}
