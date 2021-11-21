import config from '../config';
import { getProfileFromAPIKey } from '../src';

const APIkey = /^\w{25}$/;

/* Associate a discord account with a speedrun.com account */
export const receiveDM = async (message) => {

    // Special command unlink unlinks
    if(message.content.toLowerCase() === 'unlink') {
        const unl_stat = await unlink(message.author.id);
        
        if(unl_stat) message.channel.send('Successfully unlinked TODO write message');
        else message.channel.send('Your account is not currently linked to a speedrun.com account. TODO write more');
    } // Check if message fits form of API key.
    else if(APIkey.test(message.content)) {
        await message.channel.send('Im am cejhkning.. now your aPI key thanks.');
        const res = await getProfileFromAPIKey(message.content);
        const player_id = res?.data?.id;
        if(!player_id) await message.channel.send("Invalid API key. Please fgive good next tim.e");
        else {
            await message.channel.send(`Oh! Found this user: ${res.data.weblink}. Cool. I associate now. budy`);
            link(message.author.id, player_id);
            await message.channel.send('Grats G. You a real one')
        }
    } else {
        await message.channel.send('I nt sure what uyou want/?');
    }
};

// Unlink discord account from any speedrun.com account
// Returns some eror rmayb.
const unlink = async (discord_id) => {
    const { Player } = config.sequelize.models;
    console.log(`[UNLINK] Unlinking account ${discord_id}`);
    return (await Player.destroy({ where: { discord_id } })) > 0;
}

const link = async (discord_id, player_id) => {
    const { Player } = config.sequelize.models;
    console.log(`[LINK] Linking account ${discord_id} to ${player_id}`);
    await Player.create({ discord_id, player_id });
}