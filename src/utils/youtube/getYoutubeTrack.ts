import retry from 'async-retry';
import { Track, TrackMetadata } from '../../interfaces/Track';
import ytsr from 'youtube-sr';

export async function getYoutubeTrackByQuery(
  query: string,
  metadata?: TrackMetadata
): Promise<Track> {
  return retry(
    async () => {
      try {
        const video = await ytsr.searchOne(query, 'video', false);
        if (!video) throw new Error('No video found');

        return {
          url: video.url,
          title: video.title || 'No title',
          durationFormatted: video.durationFormatted,
          durationSec: video.duration / 1000,
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
    const video = await ytsr.getVideo(url);
    if (!video) throw new Error('No video found');

    return {
      url: video.url,
      title: video.title || 'No title',
      durationFormatted: video.durationFormatted,
      durationSec: video.duration / 1000,
    };
  } catch (error: any) {
    throw error;
  }
}
