import Bottleneck from 'bottleneck';
import fetch from 'node-fetch';
import config from '../config';

const limiter = new Bottleneck({
    reservoir: 100,
    reservoirRefreshAmount: 100,
    reservoirRefreshInterval: 60*1000,

    maxConcurrent: 5,
    minTime: 100,
});

const srcFetch = limiter.wrap(fetch);

export const fetchBoardInformation = (leaderboard) => {
    let req = `${config.api_prefix}leaderboards/${leaderboard.game_id}/category/${leaderboard.category_id}?embed=game,category,variables,players&top=1&${
        variableListToURLParameters(leaderboard.Variables)
    }`;
    return srcFetch(req).then(res => res.json());
}

export const formatLeaderboardObjects = async (guildLb, rawLb) => {
    const record_runs = await getRunsFromRaw(rawLb);
    const primary_t = getRunTimeFromRaw(rawLb);
    return {
        ...guildLb,
        lb_name: getLeaderboardNameFromRaw(rawLb, guildLb.Variables),
        record_runs,
        primary_t,
        format_t: formatTime(primary_t)
    }
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

const getLeaderboardNameFromRaw = (rawLb, Variables) => {
    const gameName = rawLb.data.game.data.names.international;
    const categoryName = rawLb.data.category.data.name;
    // woo!
    const valueNames = Variables.map(v => rawLb.data.variables.data.find(t => t.id === v.variable_id).values.values[v.value].label);

    return buildLeaderboardName(gameName, categoryName, valueNames);
}

// Forms a leaderboard name
// gameName = string
// categoryName = string
// valueNames = string[]
export const buildLeaderboardName = (gameName, categoryName, valueNames) => {
    let name = `${gameName} - ${categoryName}`;

    if(valueNames && valueNames.length > 0) name += ` (${valueNames.join(', ')})`;

    return name;
}

// Uses raw data to return run information as defined in getLeaderboardInformationAndAttachToGuildObject
const getRunsFromRaw = async (rawLb) => {
    return Promise.all(rawLb.data.runs.map(async (run) => ({
        run_id: run.run.id,
        run_video: run.run.videos.links[0].uri,
        players: await Promise.all(run.run.players.map(async (p) => { 
            let found_player = rawLb.data.players.data.find(p_ => p_.id === p.id);
            
            return config.sequelize.models.Player.findByPk(found_player.id).then(data => ({
                player_id: found_player.id,
                discord_id: data?.dataValues.discord_id,
                player_name: found_player.names.international
            }));
        }
    ))}))); // beauty
}

// Uses raw data to get the primary_t of the top run
const getRunTimeFromRaw = (rawLb) => {
    const runs = rawLb.data.runs;
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

export const getLeaderboardInformationFromLink = (link) => {
    // https://www.speedrun.com/feed_me_billy#Any
    let leaderboard_info = link.split('/');
    leaderboard_info = leaderboard_info[leaderboard_info.length-1].split("#");
    let game = leaderboard_info[0]
    let category = leaderboard_info[1]
    if(!category) return Promise.reject(lang.LEADERBOARD_ADD_NO_CATEGORY_PROVIDED);
    
    return fetch(`${config.api_prefix}leaderboards/${game}/category/${category}?embed=variables,game,category&top=1`)
        .then(res => res.json())
        .then(res => {
            if(res.status) return Promise.reject(res.message);
            else return res;
        });
}
