import config from '../config';
import { getProfileFromAPIKey } from '../src';

const APIkey = /^\w{25}$/;

/* Associate a discord account with a speedrun.com account */
export const receiveDM = async (message) => {

    // Special command unlink unlinks
    if(message.content.toLowerCase() === 'unlink') {
        const unl_stat = await unlink(message.author.id);
        
        if(unl_stat) message.channel.send('Your account was successfully unlinked. To re-link your account, send your API key in here at any time. You can get your API key from https://www.speedrun.com/api/auth.');
        else message.channel.send('Your account is not currently linked to a speedrun.com account.');
    } // Check if message fits form of API key.
    else if(APIkey.test(message.content)) {
        await message.channel.send('Checking API key...');
        const res = await getProfileFromAPIKey(message.content);
        const player_id = res?.data?.id;
        if(!player_id) await message.channel.send("Invalid API key. Please retrieve your API key from https://www.speedrun.com/api/auth, and do not regenerate your key until the confirmation message is sent.");
        else {
            const l_stat = await link(message.author.id, player_id);
            
            if(l_stat) await message.channel.send(`Success! Your discord account has been associated with ${res.data.weblink}.\n\nIf you are in a discord server which tracks the leaderboard for a WR you have, either ask an admin to update the records or update it yourself with --update.\n\nIf you would like to unlink this account with the speedrun.com account listed above, send "unlink" to this account at any time, and the association will be removed, and future updates to records the speedrun.com has will not be linked to your discord account.\n\nIf you would like to link this account to a different speedrun.com account, send a new API key in these DMs at any time.`);
            
            else await message.channel.send(`A speedrun.com account is already associated with this user. Please unlink your account first with 'unlink' if you wish to associate with a different account.`);
        }
    } else {
        await message.channel.send('Invalid API key. Send \'unlink\' to unlink a currently associated speedrun.com account (if any). Or, send your API key from https://www.speedrun.com/api/auth to link your discord account with your speedrun.com account. If you believe this is in error, please contact diggitydingdong#3084.');
    }
};

// Unlink discord account from any speedrun.com account
const unlink = async (discord_id) => {
    const { Player } = config.sequelize.models;
    console.log(`[UNLINK] Unlinking account ${discord_id}`);
    return (await Player.destroy({ where: { discord_id } })) > 0;
}

const link = async (discord_id, player_id) => {
    const { Player } = config.sequelize.models;
    console.log(`[LINK] Linking account ${discord_id} to ${player_id}`);
    try {
        await Player.create({ discord_id, player_id });
    } catch (err) {
        return false;
    }
    return true;
}