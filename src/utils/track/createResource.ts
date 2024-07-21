import { createAudioResource, demuxProbe } from '@discordjs/voice';
import appRootPath from 'app-root-path';
import { spawn } from 'child_process';

export async function createResource(url: string) {
  try {
    const cookiesPath = `${appRootPath}/cookies.txt`;

    const process = spawn(
      'yt-dlp',
      [
        '--ffmpeg-location',
        '/usr/bin/ffmpeg',
        '--cookies',
        cookiesPath,
        '--format',
        'bestaudio/best',
        '--limit-rate',
        '800K',
        '-o',
        '-',
        '--quiet',
        url,
      ],
      {
        stdio: ['ignore', 'pipe', 'ignore'],
      }
    );

    // Handle process errors
    process.on('error', (error) => {
      console.error(`yt-dlp process error: ${error.message}`);
    });

    const stdout = process.stdout;
    if (!stdout) throw new Error('No stream found');

    const { stream, type } = await demuxProbe(stdout);
    const resource = createAudioResource(stream, {
      inputType: type,
    });

    return resource;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to create resource: ${error.message}`);
    }

    throw new Error('Failed to create resource, unknown reason');
  }
}
