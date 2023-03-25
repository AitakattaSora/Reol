import retry from 'async-retry';
import fetch from 'isomorphic-unfetch';
const { getPreview } = require('spotify-url-info')(fetch);
import play from 'play-dl';

interface Video {
  url: string;
  title: string;
  durationFormatted: string;
}

export const YOUTUBE_REGEX =
  /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w-]+\?v=|embed\/|v\/)?)([\w-]+)(\S+)?$/;
export const SPOTIFY_REGEX =
  /^(https:\/\/open.spotify.com\/|spotify:)([a-zA-Z0-9]+)(.*)$/;

async function getVideoByURL(url: string): Promise<Video> {
  return retry(
    async () => {
      try {
        const video = await play.video_basic_info(url);

        return {
          url: video.video_details.url,
          title: video.video_details.title || 'No title',
          durationFormatted: video.video_details.durationRaw,
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

async function getVideoByQuery(query: string): Promise<Video> {
  return retry(async () => {
    try {
      const videos = await play.search(query);

      const video = videos?.[0];
      if (!video) {
        throw new Error('No video found');
      }

      return {
        url: videos[0].url,
        title: videos[0].title || 'No title',
        durationFormatted: videos[0].durationRaw,
      };
    } catch (error) {
      throw error;
    }
  });
}

export async function getSpotifyTrackTitle(url: string): Promise<string> {
  return retry(async () => {
    try {
      const data = await getPreview(url);

      const artist = data?.artist || '';
      const title = data?.title || '';

      return artist + ' - ' + title;
    } catch (error) {
      throw error;
    }
  });
}

function isYoutubeURL(url: string): boolean {
  return YOUTUBE_REGEX.test(url);
}

function isSpotifyURL(url: string): boolean {
  return SPOTIFY_REGEX.test(url);
}

export async function getVideo(query: string): Promise<Video> {
  try {
    const isSpotify = isSpotifyURL(query);
    const isYoutube = isYoutubeURL(query);

    if (isYoutube) {
      return getVideoByURL(query);
    }

    if (isSpotify) {
      const title = await getSpotifyTrackTitle(query);
      return getVideoByQuery(title);
    }

    return getVideoByQuery(query);
  } catch (error) {
    console.log(error);

    throw error;
  }
}
