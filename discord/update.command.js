import { SlashCommandBuilder } from '@discordjs/builders';
import Guild from '../db/models/Guild.model.js';
import lang from '../lang.js';
import { fetchBoardInformation, formatLeaderboardObjects } from '../src/leaderboard.src.js'; 
import Bottleneck from 'bottleneck';
import config from '../config.js';

const discLimiter = new Bottleneck({
    reservoir: 100,
    reservoirRefreshAmount: 100,
    reservoirRefreshInterval: 60*1000,

    maxConcurrent: 5,
    minTime: 100,
});


/*
    Update the given guild with guild_id.
    Specifically, updates the roles and message if available.
*/
export const update = async (interaction) => {
    
    const guild = await Guild.getWithLeaderboards(interaction.guild.id);

    // If no message or roles exist, nothing to update.
    if(!guild.wr_message_id && !guild.role_default_color) throw lang.UPDATE_NOTHING_TO_UPDATE;

    // Per leaderboard - fetch information, find the role, and update the holders of that role.
    // Todo - segment (verb)
    const leaderboardPromises = guild.Leaderboards.map(lb => 
        // Fetch info for board
        fetchBoardInformation(lb).then(res => formatLeaderboardObjects(lb, res))
            // Then, create/find the role
            .then(async (leaderboard) => {
                // TODO search for role by name if cant be found
                leaderboard.role = leaderboard.role_id ? interaction.guild.roles.cache.get(leaderboard.role_id) : null;
                
                if(leaderboard.role) return leaderboard;
                
                leaderboard.role = await discLimiter.schedule(() => interaction.guild.roles.create({
                    name: leaderboard.lb_name + ' WR',
                    color: guild.role_default_color,
                    hoist: true,
                    position: 1, // TODO role hoisting
                    mentionable: false,
                    permissions: [] // TODO ensure that these roles cant @everyone (and anything else - check default perms)
                }));
            
                await config.sequelize.models.TrackedLeaderboard.update({ role_id: leaderboard.role.id }, {
                    where: {
                        lb_id: leaderboard.lb_id,
                        guild_id: interaction.guild.id
                    }
                });

                return leaderboard;
            })
            // Update role members
            .then(leaderboard => {
                // Discord ids that need to have the role
                let playerDiscordIds = leaderboard.record_runs.map(run => run.players.filter(p => !!p.discord_id).map(p => p.discord_id)).flat();
                
                // Remove role from people that shouldn't have it
                leaderboard.role.members.forEach(async (member) => {
                    if(playerDiscordIds.some(p => p === member.user.id)) playerDiscordIds = playerDiscordIds.filter(p => p.id !== member.user.id);
                    else discLimiter.schedule(() => member.roles.remove(leaderboard.role));
                });

                // Add roles to people that need it
                playerDiscordIds.forEach(discordId => discLimiter.schedule(() => interaction.guild.members.cache.get(discordId).roles.add(leaderboard.role)));

                return leaderboard;
            })
            .then(leaderboard => console.log(`updated ${leaderboard.lb_name}`))
    );

    await Promise.all(leaderboardPromises);
    
    interaction.editReply({ content: lang.UPDATE_SUCCESSFUL });
};

export default {
    data: new SlashCommandBuilder()
        .setName('update')
        .setDescription('Update this guild\'s world record information.'),
    execute: async (interaction) => {        
        try {
            const e = await update(interaction).catch(e => e);
            if(e) throw e;
        } catch (e) {
            // Let the error bubble up if we did not throw it
            if(typeof e !== "string" && !(e instanceof String)) throw e;

            // Otherwise show error to user
            interaction.editReply({content: e});
        }

    }
}