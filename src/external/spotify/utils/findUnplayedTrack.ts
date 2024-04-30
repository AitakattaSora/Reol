import { RadioSession } from '../../../interfaces/Queue';
import { Track } from '../../../interfaces/Track';
import { getYoutubeTrackByQuery } from '../../../utils/youtube/getYoutubeTrack';

interface SpotifyTrack {
  id: string;
  title: string;
}

export async function findUnplayedTrack(
  recommendations: SpotifyTrack[],
  radioSession: RadioSession
): Promise<Track | null> {
  for (const spotifyTrack of recommendations) {
    const youtubeTrack = await getYoutubeTrackByQuery(
      spotifyTrack.title + ' lyrics'
    );

    const isTrackSkipped = radioSession.skippedTracks.some((pt) => {
      return (
        pt.youtubeUrl === youtubeTrack.url ||
        pt.title === spotifyTrack.title ||
        pt.spotifyId === spotifyTrack.id
      );
    });

    if (isTrackSkipped) {
      continue;
    }

    const isTrackPlayed = radioSession.tracks.some((pt) => {
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
