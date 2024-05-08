import { EmbedBuilder } from 'discord.js';
import { Command } from '../interfaces/Command';
import { ENV } from '../utils/ENV';
import { DEFAULT_COLOR } from '../utils/helpers';

export default {
  name: 'session',
  description: 'Show radio session history',
  async execute(client, message, args) {
    try {
      const guildId = message.guildId;
      if (!guildId) throw new GuildNotFoundError();

      const queue = client.queues.get(guildId);
      if (!queue || !queue.tracks.length) {
        return message.channel.send('There is no queue.');
      }

      const radioSessionTracks = queue.radioSession.tracks || [];
      if (!radioSessionTracks.length) {
        return message.channel.send('There is no radio session history.');
      }

      const PAGE_SIZE = 15;
      const pages = Math.ceil(radioSessionTracks.length / PAGE_SIZE);
      const page = args?.[0] ? parseInt(args[0]) : 1;

      if (page > pages) {
        return message.reply(`Page ${page} does not exist.`);
      }

      // find duplicate spotify ids and youtube urls
      const duplicateSpotifyIds = radioSessionTracks
        .map((track) => track.spotifyId)
        .filter((spotifyId, index, self) => self.indexOf(spotifyId) !== index);

      if (duplicateSpotifyIds.length) {
        message.channel.send(
          `WARNING: Duplicate Spotify IDs found: ${[
            ...new Set(duplicateSpotifyIds),
          ].join(', ')}`
        );
      }

      const queueEmbed = new EmbedBuilder();
      queueEmbed
        .setDescription(
          `Radio session history (${radioSessionTracks.length} tracks)`
        )
        .setColor(DEFAULT_COLOR);

      radioSessionTracks
        .slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
        .forEach((track, idx) => {
          const spotifyUrl = `https://open.spotify.com/track/${track.spotifyId}`;

          queueEmbed.addFields({
            name: `${idx + PAGE_SIZE * (page - 1) + 1}. ${track.title}`,
            value: spotifyUrl,
          });
        });

      if (pages > 1) {
        queueEmbed
          .setAuthor({
            name: `Page ${page} of ${pages}`,
          })
          .setFooter({
            text: `${ENV.PREFIX}session <page> to view a specific page`,
          });
      }

      return message.channel.send({ embeds: [queueEmbed] });
    } catch (error) {
      console.log(error);

      message.reply('There was an error executing the command.');
    }
  },
} as Command;
