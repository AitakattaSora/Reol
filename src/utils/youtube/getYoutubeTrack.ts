import retry from 'async-retry';
import play from 'play-dl';
import { Track, TrackMetadata } from '../../interfaces/Track';

export async function getYoutubeTrackByQuery(
  query: string,
  metadata?: TrackMetadata
): Promise<Track> {
  return retry(
    async () => {
      try {
        const videos = await play.search(query);

        const video = videos?.[0];
        if (!video) throw new Error('No video found');

        return {
          url: videos[0].url,
          title: videos[0].title || 'No title',
          durationRaw: videos[0].durationRaw,
          durationSec: videos[0].durationInSec,
          metadata,
        };
      } catch (error) {
        throw error;
      }
    },
    {
      retries: 1,
    }
  );
}

export async function getYoutubeTrackByURL(url: string): Promise<Track> {
  try {
    const video = await play.video_basic_info(url);
    if (!video) throw new Error('No video found');

    return {
      url: video.video_details.url,
      title: video.video_details.title || 'No title',
      durationRaw: video.video_details.durationRaw,
      durationSec: video.video_details.durationInSec,
    };
  } catch (error: any) {
    throw error;
  }
}
