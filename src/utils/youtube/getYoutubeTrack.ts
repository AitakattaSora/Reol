import retry from 'async-retry';
import { Worker } from 'worker_threads';
import path from 'path';
import ytsr from 'youtube-sr';
import { Track } from '../../interfaces/Track';

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
  return new Promise((resolve, reject) => {
    // worker is needed because youtube-sr block the main thread which causes the bot audio to freeze
    const worker = new Worker(path.resolve(__dirname, './yt-worker.js')); // Use .ts if using ts-node, otherwise .js

    worker.postMessage(url);

    worker.on('message', (message) => {
      if (message.error) {
        reject(new Error(message.error));
      } else {
        resolve(message as Track);
      }
    });

    worker.on('error', reject);

    worker.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });
  });
}
