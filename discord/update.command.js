import { SlashCommandBuilder } from '@discordjs/builders';
import config from '../config.js';
import { getGuildObject } from '../src.js';

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
            console.log(`[UPDATE-GUILD:${guild_id}] "${leaderboard.lb_name}": Role doesn't exist, creating...`);
            // Create a new role with default settings
            role = await guild.discord.roles.create({
                name: leaderboard.lb_name + ' WR',
                color: guild.role_default_color,
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
        } else {
            // Remove everyone that currently has the role
            console.log(`[UPDATE-GUILD:${guild_id}] "${leaderboard.lb_name}": Role found! Removing all members of the role...`);

            role.members.forEach(async (member) => {
                console.log(`[UPDATE-GUILD:${guild_id}] "${leaderboard.lb_name}": Removing role from ${member.user.username}#${member.user.discriminator}...`);
                await member.roles.remove(role);
            });
        }

        // Assign role to current record holders
        console.log(`[UPDATE-GUILD:${guild_id}] "${leaderboard.lb_name}": Adding record holders to the role...`);

        let player_discord_ids = [] // list of discord ids to assign the role to
        leaderboard.record_runs.forEach(run => {
            player_discord_ids = [...player_discord_ids, ...run.players.filter(p => !!p.discord_id).map(p => p.discord_id)];
        });

        player_discord_ids.forEach(discord_id => {
            guild.discord.members.cache.get(discord_id).roles.add(role);
        });
    }

    console.log(`[UPDATE-GUILD:${guild_id}] Guild has been updated.`);
};

export default {
    data: new SlashCommandBuilder()
        .setName('update')
        .setDescription('Update this guild\'s world record information.'),
    execute: async (interaction) => {
        await updateGuild(message.guild.id);
        await interaction.reply(lang.UPDATE_SUCCESSFUL);
    }
}