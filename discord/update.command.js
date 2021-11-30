import { SlashCommandBuilder } from '@discordjs/builders';
import config from '../config.js';
import lang from '../lang.js';
import { getGuildObject } from '../src.js';

/*
    Update the given guild with guild_id.
    Specifically, updates the roles and message if available.
*/
export const update = async (interaction) => {
    
};

export default {
    data: new SlashCommandBuilder()
        .setName('update')
        .setDescription('Update this guild\'s world record information.'),
    execute: async (interaction) => {
        await interaction.deferReply();
        
        try {
            const e = await update(interaction).catch(e => e);
            if(e) throw e;
        } catch (e) {
            // Let the error bubble up if we did not throw it
            if(typeof e !== "string" && !(e instanceof String)) {
                interaction.editReply({ content: lang.UNKNOWN_ERROR });
                console.log(e);
                throw e;
            }

            // Otherwise show error to user
            interaction.editReply({content: e});
        }

    }
}