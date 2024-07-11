import { createAudioResource, demuxProbe } from '@discordjs/voice';
import { spawn } from 'child_process';
import ffmpegStatic from 'ffmpeg-static';
import { Readable } from 'typeorm/platform/PlatformTools';

export async function createResource(url: string) {
  try {
    const process = spawn(
      'yt-dlp',
      [
        '--ffmpeg-location',
        ffmpegStatic as string,
        '-f',
        'bestaudio[acodec=opus]/bestaudio',
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

    const stderr = process?.stderr as unknown as Readable;
    if (stderr) {
      stderr.on('data', (data) => {
        console.log('yt-dlp error:', data);
        // errorOutput += data.toString();
      });
    }

    // Handle process exit
    process.on('exit', (code) => {
      if (code !== 0) {
        console.error(`yt-dlp process exited with code ${code}`);
      }
    });

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
