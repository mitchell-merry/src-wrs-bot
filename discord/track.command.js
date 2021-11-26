import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageActionRow, MessageButton } from "discord.js";
import config from "../config.js"
import lang from "../lang.js"
import { getLeaderboardInformationFromLink, buildLeaderboardName } from "../src.js";

const src_link = /^(https:\/\/www.speedrun.com\/|https:\/\/speedrun.com\/|www.speedrun.com\/|speedrun.com\/|)\w+#\w+$/;

/* handle adding tracked leaderboards for guilds */

export const handleTrack = async (link, interaction) => {
    if(!validLink(link)) { interaction.editReply(lang.TRACK_BAD_LINK); return; }

    const game_information = await getLeaderboardInformationFromLink(link);

    if(game_information.status) {
        interaction.editReply(game_information.message);
        return;
    }

    const game_subcats = game_information.data.variables.data.filter(v => v['is-subcategory']);  
 
    await interaction.editReply(lang.TRACK_INFO_FOUND);

    const buttonCollectorFilter = i => { 
        i.deferReply();
        return i.user.id === interaction.user.id;
    }

    const menus = [];
    const responses = {};

    // for every subcategory, spit out a button menu. once those are all answered, save the results
    for(const subcat of game_subcats) {
        const components = Object.entries(subcat.values.values).map(v => 
            new MessageButton()
                .setCustomId(v[0])
                .setLabel(v[1].label)
                .setStyle("PRIMARY")
        );

        const row = new MessageActionRow().addComponents(...components);

        const message = await interaction.followUp({ content: `Choose value for subcategory ${subcat.name}`, components: [ row ] });
        
        menus.push(message.awaitMessageComponent({ buttonCollectorFilter, componentType: 'BUTTON', time: 300000 })
            .then((i) => {
                const value = subcat.values.values[i.customId];
                message.edit({ content: `Selected ${value.label}!`, components: [] })
                responses[subcat.id] = {
                    id: i.customId,
                    label: subcat.values.values[i.customId].label
                };
            })
            .catch(err => {
                message.edit({ content: 'An error occured.', components: [] });
                console.error(err)
            })
        );
    }

    await Promise.all(menus)
        .then(async () => {
            const lb_name = buildLeaderboardName(game_information.data.game.data.names.international, game_information.data.category.data.name, Object.entries(responses).map(r => r[1].label));
            await interaction.followUp(`Tracking leaderboard "${lb_name} [${game_information.data.game.data.id} - ${game_information.data.category.data.id}]".`)

            const { Guild, Leaderboard, Variable } = config.sequelize.models;
            const G = await Guild.findByPk(interaction.guildId);
            console.log(interaction.guildId);
            const board = await G.createLeaderboard({
                game_id: game_information.data.game.data.id,
                category_id: game_information.data.category.data.id,
                Variables: Object.entries(responses).map(([key, val]) => ({
                    variable_id: key,
                    value: val.id
                }))
            }, { 
                include: [{
                    association: Leaderboard.Variables,
                    model: Variable
                }] 
            });

        })
        .catch(async (err) => {
            console.log(err);
            await interaction.followUp(`An error occurred. Sorry.`)
        });
}

const validLink = (link) => {
    return src_link.test(link);
}

export default {
    data: new SlashCommandBuilder()
        .setName('track')
        .setDescription('Track leaderboard.')
        .addStringOption(option =>
            option.setName('link')
                .setDescription('A link to the game and category base leaderboard to track. The category specifier is required.')
                .setRequired(true)
        ),
    execute: async (interaction) => {
        await interaction.deferReply();
        await handleTrack(interaction.options.getString('link'), interaction);
    }
}