import retry from 'async-retry';
import getYouTubeID from 'get-youtube-id';
import { Track } from '../../interfaces/Track';
import ytsr from 'youtube-sr';
import yts from 'yt-search';
import { formatDuration } from '../formatDuration';

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

    const video = await yts({ videoId: id });
    if (!video) throw new Error('No video found');

    return {
      url: video.url,
      title: video.title || 'No title',
      durationFormatted: formatDuration(video.duration.seconds),
      durationSec: video.duration.seconds,
    };
  } catch (error: any) {
    throw error;
  }
}
