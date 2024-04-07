import ytsr from 'youtube-sr';
import { Playlist } from '../getPlaylist';

export async function getYoutubePlaylist(url: string): Promise<Playlist> {
  try {
    const playlist = await ytsr.getPlaylist(url);
    if (!playlist) throw new Error('Playlist not found');

    const tracks = playlist.videos.map((video) => ({
      title: video.title || 'No title',
      url: video.url,
      durationFormatted: video.durationFormatted,
      durationSec: video.duration / 1000,
    }));

    return {
      title: playlist.title || 'No title',
      url: playlist.url || url,
      tracks,
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
}
