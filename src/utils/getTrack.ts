import { Track } from '../interfaces/Queue';
import { isSpotifyURL, isYoutubeURL } from './helpers';
import { getSpotifyTrack } from './spotify/getSpotifyTrack';
import {
  getYoutubeTrackByQuery,
  getYoutubeTrackByURL,
} from './youtube/getYoutubeTrack';

export async function getTrack(query: string): Promise<Track> {
  try {
    const isSpotify = isSpotifyURL(query);
    const isYoutube = isYoutubeURL(query);

    if (isYoutube) {
      return getYoutubeTrackByURL(query);
    }

    if (isSpotify) {
      return getSpotifyTrack(query);
    }

    return getYoutubeTrackByQuery(query);
  } catch (error) {
    console.log(error);

    throw error;
  }
}
