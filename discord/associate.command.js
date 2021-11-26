import config from '../config.js';
import { getProfileFromAPIKey } from '../src.js';
import lang from '../lang.js';
import { SlashCommandBuilder } from '@discordjs/builders';

const APIkey = /^\w{25}$/;

/* Associate a discord account with a speedrun.com account */
export const receiveDM = async (message) => {

    // Special command unlink unlinks
    if(message.content.toLowerCase() === 'unlink') {
        const unl_stat = await unlink(message.author.id);
        
        if(unl_stat) message.channel.send(lang.UNLINK_SUCCESSFUL);
        else message.channel.send(lang.UNLINK_ACC_NOT_LINKED);
    } // Check if message fits form of API key.
    else if(APIkey.test(message.content)) {
        await message.channel.send(lang.LINK_RECEIVED_API_KEY);
        const res = await getProfileFromAPIKey(message.content);
        const player_id = res?.data?.id;
        if(!player_id) await message.channel.send(lang.LINK_INVALID_KEY);
        else {
            const l_stat = await link(message.author.id, player_id);
            
            if(l_stat) await message.channel.send(lang.LINK_SUCCESSFUL(res.data.weblink));
            
            else await message.channel.send(lang.LINK_ACC_EXISTS);
        }
    } else {
        await message.channel.send(lang.LINK_INVALID_KEY);
    }
};

// Unlink discord account from any speedrun.com account
export const unlink = async (discord_id) => {
    const { Player } = config.sequelize.models;
    console.log(`[UNLINK] Unlinking account ${discord_id}`);
    return (await Player.destroy({ where: { discord_id } })) > 0;
}

export const link = async (discord_id, player_id) => {
    const { Player } = config.sequelize.models;
    console.log(`[LINK] Linking account ${discord_id} to ${player_id}`);
    try {
        await Player.create({ discord_id, player_id });
    } catch (err) {
        return false;
    }
    return true;
}

export default {
    data: new SlashCommandBuilder()
        .setName('associate')
        .setDescription('Sends a DM with instructions on how to associate your account.'),
    execute: async (interaction) => {
        await interaction.user.send(lang.LINK_INSTRUCTIONS);
        await interaction.reply({ content: lang.LINK_INSTRUCTIONS_SENT, ephemeral: true })
    }
};