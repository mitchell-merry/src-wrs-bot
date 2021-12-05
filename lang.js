export default {
    'UNLINK_SUCCESSFUL': 'Your account was successfully unlinked. To re-link your account, send your API key in here at any time. You can get your API key from https://www.speedrun.com/api/auth.',
    'UNLINK_ACC_NOT_LINKED': 'Your account is not currently linked to a speedrun.com account.',
    'LINK_RECEIVED_API_KEY': 'Checking API key...',
    'LINK_INVALID_KEY': 'Invalid API key. Please retrieve your API key from https://www.speedrun.com/api/auth, and do not regenerate your key until the confirmation message is sent. Or, send "unlink" here to unlink your discord account, if any. If you believe this is in error, please contact diggitydingdong#3084.',
    'LINK_SUCCESSFUL': (data) => `Success! Your discord account has been associated with ${data}.\n\nIf you are in a discord server which tracks the leaderboard for a WR you have, either ask an admin to update the records or update it yourself with --update.\n\nIf you would like to unlink this account with the speedrun.com account listed above, send "unlink" to this account at any time, and the association will be removed, and future updates to records the speedrun.com has will not be linked to your discord account.\n\nIf you would like to link this account to a different speedrun.com account, send a new API key in these DMs at any time.`,
    'LINK_ACC_EXISTS': `A speedrun.com account is already associated with this user. Please unlink your account first with 'unlink' if you wish to associate with a different account.`,
    'LINK_INSTRUCTIONS': `To associate your speedrun.com account with your discord account, you need to provide your src API key. You can access it here: https://www.speedrun.com/api/auth.\n\nWe do not store your API key. This bot is open-source and the code is available at https://github.com/mitchell-merry/src-wrs-bot/blob/main/discord/associate.js, for you to read and see what we do with your API key.\n\nYou will be able to refresh your API key immediately after linking and functionality will remain. To unlink your account, you can type 'unlink' in this DM at any time.\n\nTo link your account, send your API key (and only your API key) in these DMs, here.`,
    'LINK_INSTRUCTIONS_SENT': 'You should\'ve been sent a DM with instructions on how to link your account. Make sure you have DMs open.',

    UPDATE_SUCCESSFUL: 'Guild has been successfully updated!',
    UPDATE_NOTHING_TO_UPDATE: "Guild has nothing to update!",
    UPDATE_FETCH_LEADERBOARD_PROGRESS: (current, max) => `Fetching leaderboard information... (${current}/${max})`,
    UPDATE_LEADERBOARD_NOT_FOUND: (lb_id, lb_name) => `Leaderboard ${lb_name} [${lb_id}] not found. Removing the leaderboard from database... The role for the board will stay, you can choose to either delete this role or specify it when you re-add this leaderboard with the "role" option.`,

    LEADERBOARD_ADD_BAD_LINK: 'Bad link. Your link must be in the form of "<https://www.speedrun.com/GAME#CATEGORY>" ("#CATEGORY" is required, even for games with a single category / for the default category).',
    LEADERBOARD_ADD_GOOD_LINK: 'Fetching information...',
    LEADERBOARD_ADD_INFO_FOUND: 'Found game and category!',
    LEADERBOARD_ADD_NOT_FOUND: (data) => `Game ${data} could not be found.`,
    LEADERBOARD_ADD_NO_CATEGORY_PROVIDED: 'No category provided. Please be sure to include the #CATEGORY at the end of your link, e.g. https://www.speedrun.com/cuphead#All_Bosses. You may need to click on the tab for the category you desire to add to get this appear in your URL bar.',
    LEADERBOARD_ADD_CHOOSE_VALUE: (subcategory_name) => `Choose the value for the subcategory "${subcategory_name}":`,
    LEADERBOARD_ADD_VALUE_CHOSEN: (label) => `Selected ${label}!`,
    LEADERBOARD_ADD_TRACKING: (lb_name) => `Tracking leaderboard "${lb_name}"...`,
    LEADERBOARD_ADD_SUCCESS: (lb_name) => `Successfully added "${lb_name}"!`,

    LEADERBOARD_REMOVE_NO_LEADERBOARDS: `No leaderboards are in this guild!`,
    LEADERBOARD_REMOVE_CHOOSE_VALUE: `Select leaderboard(s) to remove:`,
    LEADERBOARD_REMOVE_REMOVING: (leaderboards) => `Removing the leaderboards ${leaderboards.join(', ')}`,
    LEADERBOARD_REMOVE_SUCCESS: (leaderboards) => `Successfully removed leaderboards ${leaderboards.join(', ')}`,

    UNKNOWN_ERROR: "An unexpected error occured! Sorry. Contact diggitydingdong#3084 please!",
    UNKNOWN_COMMAND: "What command is that? (wtf did you do?)"
};