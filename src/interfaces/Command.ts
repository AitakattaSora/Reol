import { Message } from 'discord.js';
import { MyClient } from '..';

export interface Command {
  name: string;
  description: string;
  aliases: string[];
  execute: (
    client: MyClient,
    message: Message<boolean>,
    args?: string[]
  ) => Promise<any>;
}
