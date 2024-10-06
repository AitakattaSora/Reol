import retry from 'async-retry';
import getYouTubeID from 'get-youtube-id';
import ytsr from 'youtube-sr';
import { Track } from '../../interfaces/Track';
import { getYtCookiesString } from '../getYtCookiesString';

export async function getYoutubeTrackByQuery(query: string): Promise<Track> {
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
        };
      } catch (error) {
        throw error;
      }
    },
    {
      retries: 2,
    }
  );
}

export async function getYoutubeTrackByURL(url: string): Promise<Track> {
  try {
    const id = getYouTubeID(url);
    if (!id) throw new Error('Invalid YouTube URL');

    const cookies = await getYtCookiesString();
    const video = await ytsr.getVideo(url, {
      headers: {
        cookie: cookies || '',
      },
    });
    if (!video) throw new Error('No video found');

    return {
      url: video.url,
      title: video.title || 'No title',
      durationFormatted: video.durationFormatted,
      durationSec: video.duration,
    };
  } catch (error: any) {
    throw error;
  }
}
