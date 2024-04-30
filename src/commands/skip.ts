import { Command } from '../interfaces/Command';

export default {
  name: 'skip',
  aliases: ['sk'],
  description: 'Skip the current track',
  async execute(client, message) {
    try {
      const guildId = message.guildId;
      if (!guildId) throw new GuildNotFoundError();

      const queue = client.queues.get(guildId);
      if (!queue) {
        return message.channel.send('There is no queue.');
      }

      if (queue.isRadio) {
        const radioSessionTracks = queue.radioSession.tracks;

        if (radioSessionTracks.length > 1) {
          const currentPlayingTrack = queue.tracks[0];
          if (!currentPlayingTrack) return;

          // Find the radio session track that is currently playing
          const radioTrack = radioSessionTracks.find(
            (track) =>
              track.spotifyId === currentPlayingTrack.metadata?.spotifyTrackId
          );
          if (!radioTrack) return;

          const filteredTracks = queue.radioSession.tracks.filter((t) => {
            return t.spotifyId !== radioTrack.spotifyId;
          });

          queue.radioSession.tracks = filteredTracks;
          queue.radioSession.skippedTracks.push(radioTrack);
        }
      }

      const messageNeeded = queue.tracks.length > 1;
      queue.player.stop(true);

      if (messageNeeded) {
        return message.channel.send('Track skipped');
      }
    } catch (error) {
      console.log(error);

      message.reply('There was an error executing the command.');
    }
  },
} as Command;
