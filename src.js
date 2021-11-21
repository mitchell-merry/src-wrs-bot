import fetch from 'node-fetch';
import config from './config';

export const getGuildObject = async (guild_id) => {
    const { Guild, Leaderboard, Variable } = config.sequelize.models;

    const G = await Guild.findByPk(guild_id, {
        include: {
            model: Leaderboard,
            through: { attributes: [ 'role_id' ] },
            include: [{ 
                model: Variable,
                attributes: { exclude: ['lb_id'] }
            }]
        },
    });

    const guild = { ...G.dataValues };
    guild.Leaderboards = guild.Leaderboards.map(lb => {
        const { Variables, TrackedLeaderboard, ...data } = lb.dataValues;
        return { ...data, ...TrackedLeaderboard.dataValues,
            Variables: Variables.map(v => v.dataValues), 
        };
    });

    await getLeaderboardInformationAndAttachToGuildObject(guild);

    return guild;
}

/*
    Guild: {
        guild_id: ...
        wr_message_id: ...
        hoisted_role_id: ...
        wr_role_color: ...
        track_sum: ...
        Leaderboards: [{
            game_id: ...
            category_id: ...
            Variables: [ ... ]
            lb_name: // Added - something like 'Cuphead - All Bosses (Regular, Legacy)'
            // Added - usually this property will be of the form [[ player ]]. This is to support
            // multiple wr runs ( [[ player_1 ], [ player_2 ]]) and co-op runs ( [[ player_1, player_2 ]])
            // at the same time. In the bottom example, the WR is tied between two runs, which each have
            // two players. This is a rare case, but the most extreme.
            // See below for the structure of a player.
            record_runs: [{
                run_id: ...,
                run_video: ...,
                players: [ player_1, player_2, ... ], 
            }, {
                run_id: ...,
                run_video: ...,
                players: [ player_3, player_4, ... ], 
            }],
            primary_t: // Added - primary time stored for the run. 
            formatted_t: // Added - formatted version of primary_t. One of these might be removed later depending on use cases, but I'm not there yet.
            role_id: // Added - the role_id (from TrackedLeaderboard) of this leaderboard on the guild.
        }, ...]
    }

    Player object:
    player_x: {
        player_id: ...,   // used to associate with discord account
        discord_id: ...,  // null if no associated discord account
        player_name: ..., // speedrun.com name
    }
*/
const getLeaderboardInformationAndAttachToGuildObject = async (guild) => {
    for(let i = 0; i < guild.Leaderboards.length; i++) {
        let leaderboard = guild.Leaderboards[i];
        leaderboard.raw = await fetchBoardInformation(leaderboard);
        
        // Convert raw data to usable information
        leaderboard.lb_name = getLeaderboardNameFromRaw(leaderboard);
        leaderboard.record_runs = await getRunsFromRaw(leaderboard);
        leaderboard.primary_t = getRunTimeFromRaw(leaderboard);
        leaderboard.formatted_t = formatTime(leaderboard.primary_t);

        leaderboard.raw = undefined; // Remove the raw data.
    }
}

// Fetch all relevant information from the speedrun.com api
const fetchBoardInformation = (leaderboard) => {
    let req = `${config.api_prefix}leaderboards/${leaderboard.game_id}/category/${leaderboard.category_id}?embed=game,category,variables,players&top=1&${
        variableListToURLParameters(leaderboard.Variables)
    }`;
    return fetch(req).then(res => res.json());
}

/* variables: [{
        variable_id: ...
        value: ...
    }, ...]
    
    Converts a variable object to a suitable GET paramater list.
*/
const variableListToURLParameters = (variables) => {
    return variables.map(variable => `var-${variable.variable_id}=${variable.value}`).join('&');
}

/*
    Get leaderboard name, such as Cuphead - All Bosses (Regular, Legacy)
    from the raw results of the API request.

    leaderboard: {
        game_id: ...
        category_id: ...
        Variables: [{
            variable_id: ...
            value: ...
        }],
        raw: ...
    }
*/
const getLeaderboardNameFromRaw = (leaderboard) => {
    let name = `${leaderboard.raw.data.game.data.names.international} - ${leaderboard.raw.data.category.data.name}`;
    
    // Only add parenthesis if leaderboard has variables
    if(leaderboard.Variables && leaderboard.Variables.length > 0) {
        name += ` (${
            // Just so much fun
            leaderboard.Variables.map(v => {
                return leaderboard.raw.data.variables.data.find(t => t.id === v.variable_id).values.values[v.value].label;
            }).join(', ')
        })`;
    }

    return name;
}

// Uses raw data to return run information as defined in getLeaderboardInformationAndAttachToGuildObject
const getRunsFromRaw = async (leaderboard) => {
    return await Promise.all(leaderboard.raw.data.runs.map(async (run) => ({
        run_id: run.run.id,
        run_video: run.run.videos.links[0].uri,
        players: await Promise.all(run.run.players.map(async (p) => { 
            let found_player = leaderboard.raw.data.players.data.find(p_ => p_.id === p.id);
            
            return config.sequelize.models.Player.findByPk(found_player.id).then(data => ({
                player_id: found_player.id,
                discord_id: data?.dataValues.discord_id,
                player_name: found_player.names.international
            }));
        }
    ))}))); // beauty
}

// Uses raw data to get the primary_t of the top run
const getRunTimeFromRaw = (leaderboard) => {
    const runs = leaderboard.raw.data.runs;
    if (runs.length === 0) return null; // null if there are no runs, no record means no time

    // All runs should have the same primary_t since they are tied, so just grab the first
    return runs[0].run.times.primary_t;
}

// Formats time (in the form of seconds and millseconds, e.g. 1801.784) to HH:MM:SS.mmm (in this case 30:01.784), as speedrun.com displays it.
export const formatTime = (time) => {
    let hours = Math.floor(time/3600);
    let minutes = Math.floor(time / 60) % 60;
    let seconds = Math.floor(time % 60);
    let milli = Math.round((time % 1) * 1000)
    return (hours !== 0 ? `${hours}:${(minutes < 10 ? '0' : '')}` : '') 
    + `${minutes}:${(seconds < 10 ? '0' : '')}${seconds}${milli !== 0 ? '.'+milli : ''}`;
}