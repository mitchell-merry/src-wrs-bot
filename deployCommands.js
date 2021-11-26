import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { token, guildId, clientId } from './auth.js';
import * as fs from 'fs';

const commands = []

const commandFiles = fs.readdirSync('./discord').filter(file => file.endsWith('.command.js'));

for (const file of commandFiles) {
	const { default: command } = await import(`./discord/${file}`);

	commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(token);

// rest.put(Routes.applicationCommands(clientId), { body: [] })
// 	.then(() => console.log('Successfully registered application commands.'))
// 	.catch(console.error);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);