import { joinVoiceChannel } from '@discordjs/voice';
import { EmbedBuilder, TextChannel, VoiceBasedChannel } from 'discord.js';
import { Command } from '../interfaces/Command';
import { Queue } from '../interfaces/Queue';
import { ENV } from '../utils/ENV';
import { getPlaylist } from '../utils/getPlaylist';
import { DEFAULT_COLOR } from '../utils/helpers';

export default {
  name: 'playlist',
  description: 'Play a playlist from youtube or spotify',
  aliases: ['pl'],
  async execute(client, message, args) {
    try {
      if (!args?.length) {
        return message.channel.send('Please provide a playlist link');
      }

      const playlistLink = args[0];

      const voiceChannel =
        message.member?.voice.channel ||
        (client.channels.cache.get(ENV.VOICE_CHANNEL_ID) as VoiceBasedChannel);

      if (!voiceChannel) {
        return message.reply(
          'Please join a voice channel or set a voice channel in the .env file.'
        );
      }

      const guildId = message.guildId;
      if (!guildId) throw new GuildNotFoundError();

      const playlist = await getPlaylist(playlistLink);
      const tracks = playlist.tracks;

      const queue = client.queues.get(guildId);
      if (queue) {
        queue.enqueue(...tracks);
      } else {
        const newQueue = new Queue({
          message,
          textChannel: message.channel as TextChannel,
          connection: joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            selfDeaf: false,
          }),
        });

        client.queues.set(guildId, newQueue);
        newQueue.enqueue(...tracks);
      }

      const playlistEmbed = new EmbedBuilder()
        .setTitle(`${playlist.title}`)
        .setDescription(
          tracks.map((song, idx) => `${idx + 1}. ${song.title}`).join('\n')
        )
        .setURL(playlist.url)
        .setColor(DEFAULT_COLOR);

      if (playlistEmbed.data.description!.length >= 2048) {
        playlistEmbed.setDescription(
          playlistEmbed.data.description!.substring(0, 2007) +
            '\nPlaylist larger than character limit...'
        );
      }

      return message.reply({
        embeds: [playlistEmbed],
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
} as Command;
