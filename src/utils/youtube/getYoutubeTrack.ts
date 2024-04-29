import retry from 'async-retry';
import getYouTubeID from 'get-youtube-id';
import { Track } from '../../interfaces/Track';
import ytsr from 'youtube-sr';

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
    // for youtube shorts. youtube-sr doesn't support shorts, but shorts are basically videos
    const id = getYouTubeID(url);
    const youtubeWatchUrl = `https://www.youtube.com/watch?v=${id}`;
    const videoUrl = id ? youtubeWatchUrl : url;

    const video = await ytsr.getVideo(videoUrl);
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
