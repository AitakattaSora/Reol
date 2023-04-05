import { Client as GeniusClient } from 'genius-lyrics';

export async function getLyrics(query: string) {
  const client = new GeniusClient();
  const results = await client.songs.search(query);

  const song = results?.[0];
  if (!song) throw new Error('No lyrics found');

  if (song.instrumental) throw new Error('It is instrumental, no lyrics');

  const lyrics = await song.lyrics();
  if (!lyrics) throw new Error('No lyrics found');

  return {
    title: song.title,
    url: song.url,
    thumbnail: song._raw?.song_art_image_url || song.image,
    lyrics,
  };
}
