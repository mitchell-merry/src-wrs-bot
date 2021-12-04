import config from '../config.js';
import lang from '../lang.js';
import { SlashCommandBuilder } from '@discordjs/builders';
// import { getIdFromUsername } from '../src.js';
import { link } from './associate.command.js';
import { adminId } from '../auth.js';
import { getIdFromUsername } from '../src.js';

export default {
    data: new SlashCommandBuilder()
        .setName('add_association')
        .setDescription('Adds an association.')
        .addStringOption(option => 
            option.setName('discord_id')
                .setDescription('The discord id of the user.')
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('src_name')
                .setDescription('The speedrun.com name of the user.')
                .setRequired(true)
        ),
    execute: async (interaction) => {
        if(interaction.user.id !== adminId) interaction.editReply({ content: 'This command isn\'t for you!', ephemeral: true });
        const user_id = await getIdFromUsername(interaction.options.getString('src_name'));
        console.log(user_id)
        if(user_id.status) {
            interaction.editReply(user_id.message);
            return;
        }

        await link(interaction.options.getString('discord_id'), user_id);
        await interaction.editReply("Linked.");
        
    }
};