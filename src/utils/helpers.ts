export const YOUTUBE_REGEX =
  /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w-]+\?v=|embed\/|v\/)?)([\w-]+)(\S+)?$/;
export const SPOTIFY_REGEX =
  /^(https:\/\/open.spotify.com\/|spotify:)([a-zA-Z0-9]+)(.*)$/;
export const SPOTIFY_TRACK_REGEX =
  /^https:\/\/open\.spotify\.com\/track\/([0-9A-Za-z]+)/;
export const SPOTIFY_ARTIST_REGEX =
  /^https:\/\/open\.spotify\.com\/artist\/([0-9A-Za-z]+)/;

export const YOUTUBE_PLAYLIST_REGEX = /^.*(list=)([^#\&\?]*).*/;

export const SPOTIFY_PLAYLIST_REGEX =
  /^https:\/\/open\.spotify\.com\/(playlist|album)\/[a-zA-Z0-9]+(\?si=[a-zA-Z0-9]+)?$/;

export const URL_REGEX =
  /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;

export function isYoutubeURL(url: string): boolean {
  return YOUTUBE_REGEX.test(url);
}

export function isSpotifyURL(url: string): boolean {
  return SPOTIFY_REGEX.test(url);
}

export function isSpotifyTrackURL(url: string): boolean {
  return SPOTIFY_TRACK_REGEX.test(url);
}

export function isPlaylist(url: string): boolean {
  return (
    URL_REGEX.test(url) &&
    (YOUTUBE_PLAYLIST_REGEX.test(url) || SPOTIFY_PLAYLIST_REGEX.test(url))
  );
}

export const DEFAULT_COLOR = '#504A64';
export const DEFAULT_THUMBNAIL = 'https://iili.io/HO91F8Q.jpg';
