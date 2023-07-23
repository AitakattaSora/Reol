import { demuxProbe } from '@discordjs/voice';
import ytdl from 'youtube-dl-exec';
import ffmpegStatic from 'ffmpeg-static';
import { createAudioResource } from '@discordjs/voice';

export async function createResource(url: string) {
  const process = ytdl.exec(
    url,
    {
      ffmpegLocation: `"${ffmpegStatic as string}"`,
      format: 'bestaudio[acodec=opus]/bestaudio',
      limitRate: '800K',
      output: '-',
      quiet: true,
    },
    {
      stdio: ['ignore', 'pipe', 'ignore'],
    }
  );

  const stdout = process.stdout;
  if (!stdout) throw new Error('No stream found');

  const { stream, type } = await demuxProbe(stdout);
  const resource = createAudioResource(stream, {
    inputType: type,
  });

  return resource;
}
