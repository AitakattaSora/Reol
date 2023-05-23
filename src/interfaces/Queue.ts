import {
  AudioPlayer,
  AudioPlayerState,
  AudioPlayerStatus,
  AudioResource,
  createAudioPlayer,
  createAudioResource,
  entersState,
  NoSubscriberBehavior,
  VoiceConnection,
  VoiceConnectionDisconnectReason,
  VoiceConnectionState,
  VoiceConnectionStatus,
} from '@discordjs/voice';
import { Message, TextChannel } from 'discord.js';
import { promisify } from 'node:util';
import play from 'play-dl';
import client from '..';
import { ENV } from '../utils/ENV';
import { Track } from './Track';

const wait = promisify(setTimeout);

export interface QueueOptions {
  message: Message;
  textChannel: TextChannel;
  connection: VoiceConnection;
}

export class Queue {
  public readonly message: Message;
  public readonly connection: VoiceConnection;
  public readonly player: AudioPlayer;
  public readonly textChannel: TextChannel;
  public readonly client = client;

  public resource: AudioResource;
  public tracks: Track[] = [];
  public volume = 100;
  public loop = false;
  public muted = false;
  public waitTimeout: NodeJS.Timeout | null;
  private queueLock = false;
  private readyLock = false;
  private stopped = false;

  constructor(options: QueueOptions) {
    this.message = options.message;
    this.connection = options.connection;
    this.textChannel = options.textChannel;

    this.player = createAudioPlayer({
      behaviors: { noSubscriber: NoSubscriberBehavior.Play },
    });
    this.connection.subscribe(this.player);

    const networkStateChangeHandler = (
      oldNetworkState: any,
      newNetworkState: any
    ) => {
      const newUdp = Reflect.get(newNetworkState, 'udp');
      clearInterval(newUdp?.keepAliveInterval);
    };

    this.connection.on(
      'stateChange' as any,
      async (
        oldState: VoiceConnectionState,
        newState: VoiceConnectionState
      ) => {
        Reflect.get(oldState, 'networking')?.off(
          'stateChange',
          networkStateChangeHandler
        );
        Reflect.get(newState, 'networking')?.on(
          'stateChange',
          networkStateChangeHandler
        );

        if (newState.status === VoiceConnectionStatus.Disconnected) {
          if (
            newState.reason ===
              VoiceConnectionDisconnectReason.WebSocketClose &&
            newState.closeCode === 4014
          ) {
            try {
              this.stop();
            } catch (e) {
              console.log(e);
              this.stop();
            }
          } else if (this.connection.rejoinAttempts < 5) {
            await wait((this.connection.rejoinAttempts + 1) * 5_000);
            this.connection.rejoin();
          } else {
            this.connection.destroy();
          }
        } else if (
          !this.readyLock &&
          (newState.status === VoiceConnectionStatus.Connecting ||
            newState.status === VoiceConnectionStatus.Signalling)
        ) {
          this.readyLock = true;
          try {
            await entersState(
              this.connection,
              VoiceConnectionStatus.Ready,
              20_000
            );
          } catch {
            if (
              this.connection.state.status !== VoiceConnectionStatus.Destroyed
            ) {
              try {
                this.connection.destroy();
              } catch {}
            }
          } finally {
            this.readyLock = false;
          }
        }
      }
    );

    this.player.on(
      'stateChange' as any,
      async (oldState: AudioPlayerState, newState: AudioPlayerState) => {
        if (
          oldState.status !== AudioPlayerStatus.Idle &&
          newState.status === AudioPlayerStatus.Idle
        ) {
          if (this.loop && this.tracks.length) {
            this.tracks.push(this.tracks.shift()!);
          } else {
            this.tracks.shift();
            if (!this.tracks.length) return this.stop();
          }

          if (this.tracks.length || this.resource.audioPlayer)
            this.processQueue();
        } else if (
          oldState.status === AudioPlayerStatus.Buffering &&
          newState.status === AudioPlayerStatus.Playing
        ) {
          this.sendPlayingMessage();
        }
      }
    );

    this.player.on('error', (error) => {
      console.error(error);

      if (this.loop && this.tracks.length) {
        this.tracks.push(this.tracks.shift()!);
      } else {
        this.tracks.shift();
      }

      this.processQueue();
    });
  }

  public enqueue(...tracks: Track[]) {
    if (this.waitTimeout !== null) clearTimeout(this.waitTimeout);
    this.waitTimeout = null;
    this.stopped = false;
    this.tracks = this.tracks.concat(tracks);
    this.processQueue();
  }

  public stop() {
    if (this.stopped) return;

    // this.queueLock = false;
    this.stopped = true;
    this.loop = false;
    this.tracks = [];
    this.player.stop();

    this.textChannel.send('Queue ended');

    if (this.waitTimeout !== null) return;

    this.waitTimeout = setTimeout(() => {
      if (this.connection.state.status !== VoiceConnectionStatus.Destroyed) {
        try {
          this.connection.destroy();
        } catch {}
      }
      client.queues.delete(this.message.guild!.id);

      this.textChannel.send('Left voice channel');
    }, ENV.STAY_TIME_IN_SECONDS * 1000);
  }

  public async processQueue(): Promise<void> {
    if (this.queueLock || this.player.state.status !== AudioPlayerStatus.Idle) {
      return;
    }

    if (!this.tracks.length) {
      return this.stop();
    }

    this.queueLock = true;

    const next = this.tracks[0];

    try {
      const stream = await play.stream(next.url);
      const resource = createAudioResource(stream.stream, {
        inputType: stream.type,
      });

      this.resource = resource!;
      this.player.play(this.resource);

      this.resource.volume?.setVolumeLogarithmic(this.volume / 100);
    } catch (error) {
      console.error(error);

      return this.processQueue();
    } finally {
      this.queueLock = false;
    }
  }

  private async sendPlayingMessage() {
    try {
      return this.textChannel.send(`**Now playing**: ${this.tracks[0].url}`);
    } catch (error: any) {
      console.error(error);
      this.textChannel.send(error.message);
      return;
    }
  }

  public shuffle() {
    // we don't want to shuffle the first track
    for (let i = this.tracks.length - 1; i > 1; i--) {
      let j = 1 + Math.floor(Math.random() * i);
      [this.tracks[i], this.tracks[j]] = [this.tracks[j], this.tracks[i]];
    }
  }
}
