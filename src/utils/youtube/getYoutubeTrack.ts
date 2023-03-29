import retry from 'async-retry';
import play from 'play-dl';
import { Track } from '../../interfaces/Queue';

export async function getYoutubeTrackByQuery(query: string): Promise<Track> {
  return retry(async () => {
    try {
      const videos = await play.search(query);

      const video = videos?.[0];
      if (!video) throw new Error('No video found');

      return {
        url: videos[0].url,
        title: videos[0].title || 'No title',
        durationRaw: videos[0].durationRaw,
      };
    } catch (error) {
      throw error;
    }
  });
}

export async function getYoutubeTrackByURL(url: string): Promise<Track> {
  return retry(
    async () => {
      try {
        const video = await play.video_basic_info(url);
        if (!video) throw new Error('No video found');

        return {
          url: video.video_details.url,
          title: video.video_details.title || 'No title',
          durationRaw: video.video_details.durationRaw,
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
