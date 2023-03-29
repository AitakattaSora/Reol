import { Track } from '../interfaces/Queue';
import { isSpotifyURL } from './helpers';
import { getSpotifyPlaylist } from './spotify/getSpotifyPlaylist';
import { getYoutubePlaylist } from './youtube/getYoutubePlaylist';

export interface Playlist {
  title: string;
  url: string;
  tracks: Track[];
}

export async function getPlaylist(url: string): Promise<Playlist> {
  const isSpotify = isSpotifyURL(url);
  if (isSpotify) {
    return getSpotifyPlaylist(url);
  }

  return getYoutubePlaylist(url);
}
