import { Message, SendableChannels } from 'discord.js';
import { MyClient } from '..';

export interface Command {
  name: string;
  description: string;
  aliases: string[];
  disabled?: boolean;
  execute: (
    client: MyClient,
    message: Message & { channel: SendableChannels },
    args?: string[]
  ) => Promise<any>;
}
