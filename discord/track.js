import { MessageActionRow, MessageButton } from "discord.js";
import config from "../config"
import lang from "../lang"
import { getLeaderboardInformationFromLink } from "../src";

/* handle adding tracked leaderboards for guilds */

export const handleTrack = async (link, channel) => {
    if(!validLink(link)) { channel.send(lang.TRACK_BAD_LINK); return; }

    channel.send(lang.TRACK_GOOD_LINK);
    const game_information = await getLeaderboardInformationFromLink(link);

    const game_subcats = game_information.data.variables.data.filter(v => v['is-subcategory']);  
 
    await channel.send('Found game and category!');
    // for every subcategory, spit out a button menu. once those are all answered, save the results
    for(const subcat of game_subcats) {
        console.log(Object.entries(subcat.values.values));
        const components = Object.entries(subcat.values.values).map(v => 
            new MessageButton()
                .setCustomId(v[0])
                .setLabel(v[1].label)
                .setStyle("PRIMARY")
        );

        const row = new MessageActionRow().addComponents(...components);

        await channel.send({ content: `Choose value for subcategory ${subcat.name}`, components: [ row ] });

    }
}

const validLink = (link) => {
    return true;
}