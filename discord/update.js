import config from '../config';
import { getGuildObject } from '../src';

/*
    Update the given guild with guild_id.
    Specifically, updates the roles and message if available.
*/
export const updateGuild = async (guild_id) => {
    const guild = await getGuildObject(guild_id);

    console.log(JSON.stringify(guild, null, 2));

    if(guild.wr_message_id === null && guild.wr_role_color === null) {
        console.log(`Guild ${guild.guild_id} has nothing to update!`);
        return;
    }

    for(const leaderboard of guild.Leaderboards) {
        // Update roles.
    }
};