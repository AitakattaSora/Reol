import retry from 'async-retry';
import getVideoId from 'get-video-id';
import { Track, TrackMetadata } from '../../interfaces/Track';
import yts from 'yt-search';

export async function getYoutubeTrackByQuery(
  query: string,
  metadata?: TrackMetadata
): Promise<Track> {
  return retry(
    async () => {
      try {
        const result = await yts({ query, category: 'video' });

        const video = result.videos?.[0];
        if (!video) throw new Error('No video found');

        return {
          url: video.url,
          title: video.title,
          durationFormatted: video.duration.timestamp,
          durationSec: video.duration.seconds,
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
    const { id: videoId } = getVideoId(url);
    if (!videoId) throw new Error('Invalid URL');

    const video = await yts({ videoId });
    if (!video) throw new Error('No video found');

    return {
      url: video.url,
      title: video.title,
      durationFormatted: video.duration.timestamp,
      durationSec: video.duration.seconds,
    };
  } catch (error: any) {
    throw error;
  }
}
