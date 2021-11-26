import config from '../config.js';
import lang from '../lang.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { getIdFromUsername } from '../src.js';
import { link, unlink } from './associate.command.js';
import { adminId } from '../auth.js';

export default {
    data: new SlashCommandBuilder()
        .setName('remove_association')
        .setDescription('Removes an association.')
        .addStringOption(option => 
            option.setName('discord_id')
                .setDescription('The discord id of the user.')
                .setRequired(true)
        ),
    execute: async (interaction) => {
        if(interaction.user.id !== adminId) interaction.reply({ content: 'This command isn\'t for you!', ephemeral: true });
        await interaction.deferReply();
        
        const unl = await unlink(interaction.options.getString('discord_id'));
        if(!unl) await interaction.editReply({ content: "That account is not currently linked to any speedrun.com account.", ephemeral: true });
        else await interaction.editReply("Unlinked.");
        
    }
};