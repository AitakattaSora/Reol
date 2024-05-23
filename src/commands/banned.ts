import { Command } from '../interfaces/Command';
import { getBannedArtists } from '../db/methods/getBannedArtists';
import { getSpotifyArtistsByIds } from '../external/spotify/getSpotifyArtistsByIds';

export default {
  name: 'banned',
  description: 'List banned artist from radio suggestions',
  async execute(_, message) {
    try {
      const guildId = message.guildId;
      if (!guildId) throw new GuildNotFoundError();

      const bannedArtists = await getBannedArtists();

      const artists = await getSpotifyArtistsByIds(
        bannedArtists.map((artist) => artist.spotifyId)
      );

      return message.channel.send(
        artists
          .map(
            (artist) =>
              `- ${artist.name}: <https://open.spotify.com/artist/${artist.id}>`
          )
          .join('\n')
      );
    } catch (error) {
      console.log(error);

      message.reply('There was an error executing the command.');
    }
  },
} as Command;
