import { parentPort } from 'worker_threads';
import yts from 'yt-search';
import getYouTubeID from 'get-youtube-id';
import { formatDuration } from '../formatDuration';
import { Track } from '../../interfaces/Track';

parentPort?.on('message', async (url: string) => {
  try {
    const id = getYouTubeID(url);
    if (!id) throw new Error('Invalid YouTube URL');

    const video = await yts({ videoId: id });
    if (!video) throw new Error('No video found');

    const track: Track = {
      url: video.url,
      title: video.title || 'No title',
      durationFormatted: formatDuration(video.duration.seconds),
      durationSec: video.duration.seconds,
    };

    parentPort?.postMessage(track);
  } catch (error: any) {
    parentPort?.postMessage({ error: error.message });
  }
});
