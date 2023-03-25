import { Client, Collection } from 'discord.js';
import fs from 'fs';
import path from 'path';

export async function loadCommands(
  client: Client & { commands: Collection<string, any> }
) {
  try {
    const files = fs
      .readdirSync(`${__dirname}/../commands/`)
      .filter((file) => file.endsWith('.js'));

    for (const file of files) {
      const commandsPath = path.join(__dirname, '..', 'commands');

      const filePath = path.join(commandsPath, file);
      const command = (await import(filePath)).default;

      if ('name' in command && 'execute' in command) {
        client.commands.set(command.name, command);
      } else {
        console.log(
          `WARNING! The command at ${filePath} is missing a required "name" or "execute" property.`
        );
      }
    }

    console.log(`${files.length} commands loaded`);
  } catch (error) {
    console.log('Error loading commands:', error);
  }
}
