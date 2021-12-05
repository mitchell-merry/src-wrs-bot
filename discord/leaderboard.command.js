import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageSelectMenu, MessageActionRow, MessageButton } from "discord.js";
import config from "../config.js"
import lang from "../lang.js"
import { getLeaderboardInformationFromLink, buildLeaderboardName } from "../src/leaderboard.src.js";

// Handle the subcommand 'add'.
const add = async (interaction) => {
    
    // TODO: Permissions.

    // Make sure the link is in valid form.
    const link = interaction.options.getString('link');
    if(!validLink(link)) throw lang.LEADERBOARD_ADD_BAD_LINK;
    
    // Get useful information.
    const leaderboard_info = await getLeaderboardInformationFromLink(link).catch(e => { throw e; });
    const game_subcategories = leaderboard_info.data.variables.data.filter(v => v['is-subcategory']); // Used to generate menus for choosing specific leaderboard.
    const interaction_channel = interaction.member.guild.channels.cache.find(c => c.id === interaction.channelId); // Channel object for the channel that the interaction occured in.

    interaction.editReply(lang.LEADERBOARD_ADD_INFO_FOUND);

    // Receive responses from the user for the value for each subcategory.
    const menus = await game_subcategories.map(async (game_subcategory) => {
        const { choices, values } = game_subcategory.values; // game_subcategory.values.values
        const labels = Object.entries(choices).map(c => ({ label: c[1], value: c[0], }));

        const componentType = labels.length <= 5;

        // Maximum number of buttons in a row is 5. If there are more than 5, use a select menu.
        const comp = componentType ? labels.map(l => buildButton(l.id, l.label)) : buildSelect(game_subcategory.id, labels);

        // Send the message with the component
        const message = await interaction_channel.send({ content: lang.LEADERBOARD_ADD_CHOOSE_VALUE(game_subcategory.name), components: [new MessageActionRow().addComponents(comp)] })

        // Return a collector as a promise
        return message.awaitMessageComponent({ filter: i => i.user.id === interaction.user.id, time: 300000 })
            .then(i => {
                // Grab the selected option
                const val = componentType ? i.customId : i.values[0];
                
                // Update relevant UI
                message.edit({ content: lang.LEADERBOARD_ADD_VALUE_CHOSEN(choices[val]), components: [] });
                
                // Return selected data
                return { id: game_subcategory.id, value: val, label: choices[val], message };
            });
    });

    const responses = await Promise.all(menus).catch(e => { throw e });
    
    // Track the new board

    // Update UI to inform user
    const lb_name = buildLeaderboardName(leaderboard_info.data.game.data.names.international, leaderboard_info.data.category.data.name, responses.map(r => r.label));
    interaction.editReply({ content: lang.LEADERBOARD_ADD_TRACKING(lb_name) + ` [${leaderboard_info.data.game.data.id}]` })
    responses.forEach(r => r.message.delete());

    // Create leaderboard object under guild
    // TODO: Check if exists first to prevent double adding leaderboards
    const { Guild, Leaderboard } = config.sequelize.models;
    const guild = await Guild.findByPk(interaction.guildId);
    const role = interaction.options.getRole('role');

    await guild.createLeaderboard({
        game_id: leaderboard_info.data.game.data.id,
        category_id: leaderboard_info.data.category.data.id,
        lb_name,
        Variables: responses.map(({id, value}) => ({
            variable_id: id,
            value
        })),
        } , { include: [ Leaderboard.Variables ], through: { role_id: role?.id } }
    );

    // Success! Let the user know.
    interaction.editReply(lang.LEADERBOARD_ADD_SUCCESS(lb_name));
}

const remove = async (interaction) => {
    const { Guild, Leaderboard } = config.sequelize.models;
    
    // Present the user with a dropdown of leaderboards
    const guild = await Guild.findByPk(interaction.guildId);
    const leaderboards = await guild.getLeaderboards();

    if(leaderboards.length === 0) throw lang.LEADERBOARD_REMOVE_NO_LEADERBOARDS;

    const options = leaderboards.map(lb => ({
        label: lb.lb_name,
        value: lb.lb_id+'',
    }));
    const select = buildSelect('select', options, 1, options.length);
    
    const message = await interaction.editReply({ content: lang.LEADERBOARD_REMOVE_CHOOSE_VALUE, components: [ await new MessageActionRow().addComponents(select) ] })

    const response = await message.awaitMessageComponent({ filter: i => i.user.id === interaction.user.id, time: 300000 })
        .then(async (i) => {
            // Get the labels for the leaderboards to display to the user:
            const labels = i.values.map(v => options.find(o => o.value === v).label);
            
            // Update relevant UI
            await message.edit({ content: lang.LEADERBOARD_REMOVE_REMOVING(labels), components: [] });
            
            // Remove leaderboards
            i.values.forEach(async (v) => await Leaderboard.destroy({ where: { lb_id: parseInt(v) } }));

            // Return selected data
            return labels;
        });

        console.log('a');

    interaction.editReply({ content: lang.LEADERBOARD_REMOVE_SUCCESS(response), components: [] })
};
const modify = async (interaction) => {};
const list = async (interaction) => {};

const src_link = /^(https:\/\/www.speedrun.com\/|https:\/\/speedrun.com\/|www.speedrun.com\/|speedrun.com\/|)\w+#\w+$/;
const validLink = (link) => src_link.test(link);
const buildButton = (id, label) => new MessageButton().setCustomId(id).setLabel(label).setStyle("PRIMARY");
const buildSelect = (id, values, min=1, max=1) => new MessageSelectMenu().setCustomId(id).setPlaceholder('Nothing selected.').setMinValues(min).setMaxValues(max).addOptions(values)

export default {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Manage the tracked leaderboards for this guild.')
        .addSubcommand(scmd => scmd.setName('add')
            .setDescription('Add a new leaderboard to be tracked by this guild.')
            .addStringOption(o => o.setName('link')
                .setDescription('A link to the game and category base leaderboard to track. The category specifier is required.')
                .setRequired(true)
            )
            .addRoleOption(o => o.setName('role')
                .setDescription('The discord role to give to the WR holders of the leaderboard. Can be left blank.')
            )
        )
        .addSubcommand(scmd => scmd.setName('remove')
            .setDescription('Remove a currently tracked leaderboard.')
        )
        .addSubcommand(scmd => scmd.setName('modify')
            .setDescription('Modify the settings of a tracked leaderboard.')
        )
        .addSubcommand(scmd => scmd.setName('list')
            .setDescription('Lists all currently tracked leaderboards.')
        ),
    execute: async (interaction) => {
        const subCommands = { add, remove, modify, list };
        
        try {
            const e = await subCommands[interaction.options.getSubcommand()](interaction).catch(e => e);
            if(e) throw e;
        } catch (e) {
            // Let the error bubble up if we did not throw it
            if(typeof e !== "string" && !(e instanceof String)) throw e;

            // Otherwise show error to user
            interaction.editReply({content: e});
        }

    }
};