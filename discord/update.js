import config from '../config';
import { getGuildObject } from '../src';

/*
    Update the given guild with guild_id.
    Specifically, updates the roles and message if available.
*/
export const updateGuild = async (guild_id) => {
    const { sequelize, discord_client } = config;
    console.log(`[UPDATE-GUILD:${guild_id}] Updating guild...`);
    const guild = await getGuildObject(guild_id);
    console.log(`[UPDATE-GUILD:${guild_id}] Guild object retrieved...`);

    if(guild.wr_message_id === null && guild.wr_role_color === null) {
        console.log(`[UPDATE-GUILD:${guild_id}] Guild has nothing to update! Exiting...`);
        return;
    }

    guild.discord = discord_client.guilds.cache.get(guild_id);
    for(const leaderboard of guild.Leaderboards) {
        // Update roles.
        let role = leaderboard.role_id === null ? null : guild.discord.roles.cache.get(leaderboard.role_id);

        // if the role doesn't exist or can't be found
        if(!role) {
            console.log(`[UPDATE-GUILD:${guild_id}] Role for "${leaderboard.lb_name}" doesn't exist, creating...`);
            // Create a new role with default settings
            role = await guild.discord.roles.create({
                name: leaderboard.lb_name,
                color: leaderboard.role_default_color,
                hoist: true,
                position: 1, // TODO
                mentionable: false,
            });

            // Save new id to this leaderboard's database
            await sequelize.models.TrackedLeaderboard.update({ role_id: role.id}, {
                where: {
                    lb_id: leaderboard.lb_id,
                    guild_id
                }
            });
            console.log(`[UPDATE-GUILD:${guild_id}] Role for "${leaderboard.lb_name}" created & saved.`);
        } else console.log(`[UPDATE-GUILD:${guild_id}] Role for "${leaderboard.lb_name}" found!`);
    }

    console.log(`[UPDATE-GUILD:${guild_id}] Guild has been updated.`);
};