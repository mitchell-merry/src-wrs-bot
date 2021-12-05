import { SlashCommandBuilder } from '@discordjs/builders';
import Guild from '../db/models/Guild.model.js';
import lang from '../lang.js';
import { fetchBoardInformation, formatLeaderboardObjects } from '../src/leaderboard.src.js'; 
import config from '../config.js';
import discLimiter from './discLimiter.js';

/*
    Update the given guild with guild_id.
    Specifically, updates the roles and message if available.
*/
export const update = async (interaction) => {
    const { Leaderboard } = config.sequelize.models;
    const guild = await Guild.getWithLeaderboards(interaction.guild.id);

    // If no message or roles exist, nothing to update.
    if(!guild.wr_message_id && !guild.role_default_color) throw lang.UPDATE_NOTHING_TO_UPDATE;

    guild.discord = interaction.guild;
    const interactionChannel = guild.discord.channels.cache.get(interaction.channelId);

    // Per leaderboard - fetch information, find the role, and update the holders of that role.
    // Todo - segment (verb)
    const leaderboardPromises = guild.Leaderboards.map(lb => 
        // Fetch info for board
        fetchBoardInformation(lb)
            /* Check to see if subcategories changed or if category / game don't exist anymore */
            .then(async (res) => {
                console.log(`[${lb.lb_id}] updating ${lb.lb_name}`)
                
                if(res.status === 404 || !compareVariables(lb.Variables, res.data.variables.data.filter(v => v['is-subcategory']))) return Promise.reject(404); 

                const leaderboard = await formatLeaderboardObjects(lb, res);
                
                // Update the lb_name in the database
                Leaderboard.update({ lb_name: leaderboard.lb_name }, { where: { lb_id: leaderboard.lb_id } });

                // Then, create/find the role
                leaderboard.role = leaderboard.role_id ? guild.discord.roles.cache.get(leaderboard.role_id) : null;
                if(!leaderboard.role) leaderboard.role = await createRoleAndAttach(leaderboard, guild);

                /*
                    Update role members
                */
                // Discord ids that need to have the role
                let playerDiscordIds = leaderboard.record_runs.map(run => run.players.filter(p => !!p.discord_id).map(p => p.discord_id)).flat();

                // Remove role from people that shouldn't have it
                leaderboard.role.members.forEach(async (member) => {
                    if(playerDiscordIds.some(p => p === member.user.id)) playerDiscordIds = playerDiscordIds.filter(p => p !== member.user.id);
                    else discLimiter.schedule(() => member.roles.remove(leaderboard.role));
                });

                // Add roles to people that need it
                playerDiscordIds.forEach(discordId => discLimiter.schedule(() => guild.discord.members.cache.get(discordId).roles.add(leaderboard.role)));

                return leaderboard;
            })
            .then(leaderboard => console.log(`[${leaderboard.lb_id}] updated ${leaderboard.lb_name}`))
            .catch(async (e) => {
                if(e === 404) {
                    interactionChannel.send(lang.UPDATE_LEADERBOARD_NOT_FOUND(lb.lb_id, lb.lb_name));
                    console.log(lang.UPDATE_LEADERBOARD_NOT_FOUND(lb.lb_id, lb.lb_name));
                    
                    Leaderboard.destroy({ where: { lb_id: lb.lb_id } });
                } else {
                    console.error(e);
                    throw e;
                }
            })
    );

    await Promise.all(leaderboardPromises);
    
    interaction.editReply({ content: lang.UPDATE_SUCCESSFUL });
};

// TODO search for role by name if cant be found
const createRoleAndAttach = async (leaderboard, guild) => {
    
    const role = await discLimiter.schedule(() => guild.discord.roles.create({
        name: leaderboard.lb_name + ' WR',
        color: guild.role_default_color,
        hoist: true,
        position: 1, // TODO role hoisting
        mentionable: false,
        permissions: [] // TODO ensure that these roles cant @everyone (and anything else - check default perms)
    }));

    await config.sequelize.models.TrackedLeaderboard.update({ role_id: role.id }, {
        where: {
            lb_id: leaderboard.lb_id,
            guild_id: guild.discord.id
        }
    });

    return role;
}

const compareVariables = (dbVariables, rawVariables) => {
    
    if(dbVariables.length !== rawVariables.length) return false;

    // Compare each variable - if it cant find a matching variable, reject. If the found variable doesnt have the matching value, reject
    dbVariables.forEach(({ variable_id, value }) => {
        const rawMatch = rawVariables.find(rv => rv.id === variable_id);
        if(!rawMatch || !rawMatch.values.values[value]) return false; // no match! reject
    });

    return true;
}

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