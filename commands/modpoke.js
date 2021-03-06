const logger = require('../logs/logger.js');

// help message
const HELP_MESSAGE = "\n`+modpoke  [nickname] [fieldToChange] [newValue]`\n\nModifies an existing Pokemon in the" +
    " database. \nUse `+modpoke list` to view all available changeable fields.)";
// list of editable fields
const HELP_FIELDS_LIST = "Here's the list of all available fields on a Pokemon that can be manipulated. Fields marked with a ♢ will update other related stats upon being updated.\n" +
    "\n" +
    "**BASIC FEATURES**\n" +
    "> `name` // Nickname (\"Sparky\", \"Blaze\"), cannot include spaces or special characters\n" +
    "> `species♢` // Species (\"Pikachu\", \"Vulpix\")\n" +
    "> `form♢` // Current Form (\"meowth-galarian\", \"aegislash-shield\")\n" +
    "> `level♢` // ChaCha level, ranging from level 1-20. Each ChaCha level is equivalent to 5 in-videogame levels\n" +
    "> `gender` // Gender (*Male, Female, or Genderless*)\n" +
    "> `ability` // Ability (\"Static\", \"Flash Fire\")\n" +
    "> `nature♢` // Nature (\"Quirky\", \"Sassy\")\n" +
    "> `type1` // First (or only) type. *Cannot be empty*!\n" +
    "> `type2` // Second type, if it has one\n" +
    "\n" +
    "**Base Stats, EVs, & IVs**\n" +
    "> `hp` // `hpIV♢` // `hpEV♢` // Hit Points\n" +
    "> `atk` // `atkIV♢` // `atkEV♢` // Attack\n" +
    "> `def` // `defIV♢` // `defEV♢` // Defense\n" +
    "> `spa` // `spaIV♢` // `spaEV♢` // Special Attack\n" +
    "> `spd` // `spdIV♢` // `spdEV♢` // Special Defense\n" +
    "> `spe` // `speIV` // `speEV` // Speed\n" +
    "\n" +
    "**Moves**\n" +
    "> `move1` // `move2` // `move3` //  `move4` // Main 4 moves known\n" +
    "> `move5` // The currently in-progress move\n" +
    "> `moveProgress` // Progress on move learning. Can be 0-5; upon 6th success, move is learned and replaces other move.\n" +
    "> (For move learning DCs, use `+movetutor help`)\n" +
    "\n" +
    "**Other**\n" +
    "> `originalTrainer` // The Pokemon's trainer\n" +
    "> `shiny` // Shiny status (0 = false, 1 = true)\n" +
    "> `private` // Private marker, generated pokemon set to private (1) by default. (0 = false, 1 = true) (*Private" +
    " Pokemon can only be seen by their creator*)";

//message when there are too few arguments
const FEWARGS_MESSAGE = "Too few arguments submitted. Check your submission for errors.";

//message where the field they want to change does not exist
const NONEXISTENT_FIELD_MESSAGE = "That isn't a valid field to change! Please check your spelling and try again."

// array of variables that can go straight to being updated
const STATIC_FIELDS = ["ability", "name", "gender", "hp", "atk", "def", "spa", "spd", "spe", "move1", "move2", "move3", "move4", "move5", "moveProgress", "originalTrainer", "shiny", "private"];
const OTHER_FIELDS = ["species", "form", "level", "nature", "type1", "type2", "hpIV", "hpEV", "atkIV", "atkEV", "defIV", "defEV", "spaIV", "spaEV", "spdIV", "spdEV", "speIV", "speEV"]

// code formatting variables for the embed
const CODE_FORMAT_START = "```diff\n";
const CODE_FORMAT_END = "\n```"

module.exports.run = (client, connection, P, message, args) => {
    let Pokemon = require('../models/pokemon.js');
    try {
        if (args[0].match(/[-\/\\^$*+?.()|[\]{}'"\s]/)) {
            logger.warn("[modpoke] User put special character in pokemon name, sending warning.");
            message.reply("Please do not use special characters when using renaming Pokemon.");
            return;
        }

        // if asking for help, print the help message
        if (args[0].includes('help')) {
            logger.info("[modpoke] Sending help message.");
            message.reply(HELP_MESSAGE);
            return;
        }

        // if looking for the list of arguments, print em
        if (args[0].includes('list')) {
            logger.info("[modpoke] Sending fields list help message.");
            message.reply(HELP_FIELDS_LIST);
            return;
        }

        //Check if enough args
        if (args.length < 3) {
            logger.info("[modpoke] Sending too few args message.");
            message.reply(FEWARGS_MESSAGE);
            return;
        }
        // otherwise, lets find our poke and add those updates!

        // grab the pokemon's name
        let pokeName = args[0];
        //grab the value to be changed
/*
        let valName = args[1];
        let lowerCase_OTHERFIELDS = OTHER_FIELDS.map(field => field.toLowerCase()); //copy of OTHER_FIELDS all lowercase

        // check whether the field they want to change exists
        if (!STATIC_FIELDS.includes(valName) && !OTHER_FIELDS.includes(valName) &&
            !STATIC_FIELDS.includes(valName.toLowerCase()) && !lowerCase_OTHERFIELDS.includes(valName.toLowerCase())) {
            logger.warn("[modpoke] Can't change that field because of spelling or doesn't exist. Sending nonexistent field message.");
            message.reply(NONEXISTENT_FIELD_MESSAGE);
            return;
        }
*/
        //grab the value to be changed
        let valName = args[1];
        let lowerCase_OTHERFIELDS = OTHER_FIELDS.map(field => field.toLowerCase()); //copy of OTHER_FIELDS all lowercase

        // check whether the field they want to change exists
        if (!STATIC_FIELDS.includes(valName) && !OTHER_FIELDS.includes(valName) &&
            !STATIC_FIELDS.includes(valName.toLowerCase()) && !lowerCase_OTHERFIELDS.includes(valName.toLowerCase())) {
            logger.warn("[modpoke] Can't change that field because of spelling or doesn't exist. Sending nonexistent field message.");
            message.reply(NONEXISTENT_FIELD_MESSAGE);
            return;
        }

        // make value all lowercase if it's in the STATIC_FIELDS array and not already matching
        if (!STATIC_FIELDS.includes(valName) && STATIC_FIELDS.includes(valName.toLowerCase())) {
            valName = args[1].toLowerCase();
        }

        // make value the correct case by setting it to matching value in OTHER_FIELDS in order to match the DB schema
        if (!OTHER_FIELDS.includes(valName) && lowerCase_OTHERFIELDS.includes(valName.toLowerCase())) {
            let idx = lowerCase_OTHERFIELDS.indexOf(valName.toLowerCase());
            valName = OTHER_FIELDS[idx];
        }

        // make value all lowercase if it's in the STATIC_FIELDS array and not already matching
        if (!STATIC_FIELDS.includes(valName) && STATIC_FIELDS.includes(valName.toLowerCase())) {
            valName = args[1].toLowerCase();
        }

        // make value the correct case by setting it to matching value in OTHER_FIELDS in order to match the DB schema
        if (!OTHER_FIELDS.includes(valName) && lowerCase_OTHERFIELDS.includes(valName.toLowerCase())) {
            let idx = lowerCase_OTHERFIELDS.indexOf(valName.toLowerCase());
            valName = OTHER_FIELDS[idx];
        }

        //grab the new value to be input, set properly in the following if statement
        let valString;
        if (typeof args[2] == "string") {
            valString = `${args[2]}`;
        } else valString = args[2];

        // ================= SQL statements  =================
        // sql statement to check if the Pokemon exists
        let sqlFindPoke = `SELECT * FROM pokemon WHERE name = '${pokeName}'`;
        logger.info(`[modpoke] SQL find pokemon query: ${sqlFindPoke}`);
        // sql statement to update the Pokemon
        let sqlUpdateString = `UPDATE pokemon SET ${valName} = '${valString}' WHERE name = '${pokeName}'`;
        logger.info(`[modpoke] SQL update string: ${sqlUpdateString}`);
        // not found message
        let notFoundMessage = pokeName + " not found. Please check that you entered the name properly (case-sensitive) and try again.\n\n(Hint: use `+listpoke` to view the Pokemon you can edit.)";

        // try to find the poke in the array first
        connection.query(sqlFindPoke, function (err, rows, fields) {
            // if you're here, the name couldn't be found in the table
            if (err) {
                let cantAccessSQLMessage = "SQL error, please try again later or contact a maintainer if the issue persists.";
                logger.error("[modpoke]" + cantAccessSQLMessage + ` ${err}`)
                message.reply(cantAccessSQLMessage);
                return;
            } else if (rows.length === 0) {
                // the pokemon was not found
                logger.info(`[modpoke] ${pokeName} was not found.`)
                message.reply(notFoundMessage);
                return;
            } else {
                // check if the user is allowed to edit the Pokemon. If a Pokemon is private, the user's discord ID must match the Pokemon's creator ID
                if (rows[0].private > 0 && message.author.id !== rows[0].discordID) {
                    logger.info("[modpoke] Detected user attempting to edit private Pokemon that isn't their own.")
                    // If user found a pokemon that was marked private and belongs to another user, act as if the pokemon doesn't exist in messages
                    message.reply(notFoundMessage);
                } else {
                    logger.info(`[modpoke] ${pokeName} confirmed to be editable by user. Checking for static/dynamic variable.`);
                    // true/false declaring whether or not the variable is static or not
                    let isStaticVal = false;

                    // promise that the static check is taken care of
                    let staticCheck = new Promise((resolve, reject) => {
                        // check if the variable is a "static" one, and go straight to updating if so
                        STATIC_FIELDS.forEach(staticField => {
                            if (staticField === valName) {
                                isStaticVal = true;
                                // go ahead and run the update string right away
                                connection.query(sqlUpdateString, function (err, results) {
                                    if (err) {
                                        let errorMessage = "Unable to update static field " + valName + " of " + pokeName;
                                        logger.error(`[modpoke] ${errorMessage}\n\t${err.toString()}`);
                                        logger.error("[modpoke] " + err);
                                        message.reply(errorMessage);
                                        reject();
                                    } else {
                                        let successMessage = "**" + pokeName + "'s** " + valName + " has been changed to " + valString + "!";
                                        logger.info(`[modpoke] ${successMessage}`)
                                        message.reply(successMessage + "\nNOTE: Any updates to base stats will be overwritten if related variables (such as IVs, EVs, and level) are changed.");
                                        resolve();
                                    }
                                });
                            }
                        });
                        resolve();
                    });

                    // await promise before attempting non-static update
                    staticCheck.then(() => {
                        // if you're here, then the field is not static and needs to get verification before being updated
                        if (!isStaticVal) {// if not a static field, it's one that updates other fields as well...
                            logger.info(pokeName + " found. Attempting to update non-static field " + valName + " to " + valString + "...")
                            /* HP calculation stuff (for later)

                           // === NEW HP CALCULATION(if needed)===
                           // roll 2d10 to get new hp
                           let hpRoll1 = Math.floor(Math.random() * 10) + 1;
                           let hpRoll2 = Math.floor(Math.random() * 10) + 1;
                           // stow away old HP
                           let oldHP = rows[0].hp;

                           // roll through the poke array pre-conversion and adds the new variable
                            */

                            // create a pokemon object with the original data
                            let oldPoke = new Pokemon();

                            // create oldPoke object
                            oldPoke.loadFromSQL(connection, P, rows[0]).then(function (results) {

                                console.log("oldPoke:");
                                console.log(`"${oldPoke.pokemonData.stats[0].stat.name}": "${oldPoke.pokemonData.stats[0].base_stat}"`);
                                console.log(`"${oldPoke.pokemonData.stats[1].stat.name}": "${oldPoke.pokemonData.stats[1].base_stat}"`);
                                console.log(`"${oldPoke.pokemonData.stats[2].stat.name}": "${oldPoke.pokemonData.stats[2].base_stat}"`);
                                console.log(`"${oldPoke.pokemonData.stats[3].stat.name}": "${oldPoke.pokemonData.stats[3].base_stat}"`);
                                console.log(`"${oldPoke.pokemonData.stats[4].stat.name}": "${oldPoke.pokemonData.stats[4].base_stat}"`);
                                console.log(`"${oldPoke.pokemonData.stats[5].stat.name}": "${oldPoke.pokemonData.stats[5].base_stat}"`);
                                // grab the row and stow it
                                let thisPoke = rows[0];

                                // if the valName is species, assign directly, otherwise convert it into a number
                                if (typeof valName === "string") thisPoke[valName] = valString.toLowerCase();
                                else thisPoke[valName] = parseInt(valString);

                                //Make new empty Pokemon object
                                let newPoke = new Pokemon();

                                /* ======== FOR REFERENCE ========
                                // oldPoke - original Pokemon OBJECT, pre-updates
                                // thisPoke - updated Pokemon data ARRAY, post-updates
                                // newPoke - updated Pokemon OBJECT, post-updates & calculated accordingly */

                                //use Pokemon.loadFromSQL to convert SQL object into a complete Pokemon object
                                newPoke.loadFromSQL(connection, P, thisPoke).then(function (results) {

                                    console.log("new Pokemon:");
                                    console.log(`"${newPoke.pokemonData.stats[0].stat.name}": "${newPoke.pokemonData.stats[0].base_stat}"`);
                                    console.log(`"${newPoke.pokemonData.stats[1].stat.name}": "${newPoke.pokemonData.stats[1].base_stat}"`);
                                    console.log(`"${newPoke.pokemonData.stats[2].stat.name}": "${newPoke.pokemonData.stats[2].base_stat}"`);
                                    console.log(`"${newPoke.pokemonData.stats[3].stat.name}": "${newPoke.pokemonData.stats[3].base_stat}"`);
                                    console.log(`"${newPoke.pokemonData.stats[4].stat.name}": "${newPoke.pokemonData.stats[4].base_stat}"`);
                                    console.log(`"${newPoke.pokemonData.stats[5].stat.name}": "${newPoke.pokemonData.stats[5].base_stat}"`);



                                    logger.info("SQL has been converted to a Pokemon Object\nAll values recalculated as necessary\nProviding user with comparison embed & awaiting change confirmation...")

                                    // DEBUG display old and new pokes
                                    //message.channel.send("Old Pokemon Below (debug)");
                                    //message.channel.send(oldPoke.sendSummaryMessage(client));
                                    //message.channel.send("New Pokemon Below (debug)");
                                    //message.channel.send(newPoke.sendSummaryMessage(client));

                                    // ======== FORMATTED VARIABLES & STRINGS & EMBED ========

                                    // capitalize function
                                    let capitalize = function (tempWord) {
                                        return tempWord.charAt(0).toUpperCase() + tempWord.substr(1);
                                    };

                                    // format ability function
                                    let formatAbility = function (ability) {
                                        // if two word ability, break apart and format accordingly
                                        if (~ability.indexOf("-")) {
                                            // yoink both halves
                                            let tempA = ability.slice(0, ability.indexOf("-"));
                                            let tempB = ability.slice(ability.indexOf("-") + 1, ability.length);
                                            // capitalize them both
                                            return capitalize(tempA) + " " + capitalize(tempB);
                                        } else {
                                            // return the given ability, but capitalized properly
                                            return capitalize(ability);
                                        }
                                    };

                                    // formatted species names (old + new) for formatting purposes
                                    let oldSpecies = capitalize(oldPoke.species);
                                    let newSpecies = capitalize(newPoke.species);

                                    /**
                                     * This function compares two values, an original and "updated",
                                     * returning a string displaying the one value if left unchanged, or both if changed.
                                     * If designated as a number, will color green if value increased, and red if decreased
                                     * @param oldVal The original value
                                     * @param newVal The "updated" value to compare
                                     * @param isNum Whether or not the value is a number
                                     * @returns {string|*}
                                     */
                                    let fieldChanged = function (oldVal, newVal, isNum) {
                                        // convert entered values into
                                        let oldString = oldVal.toString();
                                        let newString = newVal.toString();
                                        // if different, return string with both
                                        if (oldString.localeCompare(newString) === 0) {
                                            return "\n--- " + oldVal + "\n\n";
                                        } else {
                                            // the full different field string, to be returned at the end
                                            let diffFieldString = "";
                                            //if the isNum value is false, simply return the string with red text for the "updated" text
                                            if (!isNum) {
                                                diffFieldString = "\n- " + newString + "\n--- OLD: " + oldString + "\n";
                                            } else {
                                                // if it is a number, it's time to compare the two
                                                // to see if the new value is higher or lower than the original

                                                // parse int value from oldVal
                                                let oldNum = parseInt(oldVal, 10);
                                                // parse int val from newVal
                                                let newNum = parseInt(newVal, 10);

                                                // if newNum is higher than old, make it green
                                                if (newNum > oldNum) {
                                                    diffFieldString = "\n+ " + newString + "\n--- OLD: " + oldString + "\n";
                                                } else {
                                                    // you're only here if newNum is lower than old, so make it red
                                                    diffFieldString = "\n- " + newString + "\n--- OLD: " + oldString + "\n";
                                                }
                                            }

                                            // if here, the two are different
                                            return diffFieldString;
                                        }
                                    };

                                    // formatted ability score strings. STR(0) DEX(1) CON(2) INT(3) WIS(4) CHA(5)
                                    let abilityScoreString = [
                                        CODE_FORMAT_START
                                        + "SCORE:" + fieldChanged(oldPoke.statBlock.strBase.toFixed(0), newPoke.statBlock.strBase.toFixed(0), true)
                                        + "MODIFIER:" + fieldChanged(oldPoke.statBlock.strMod, newPoke.statBlock.strMod, true)
                                        + CODE_FORMAT_END,


                                        CODE_FORMAT_START
                                        + "SCORE:" + fieldChanged(oldPoke.statBlock.dexBase.toFixed(0), newPoke.statBlock.dexBase.toFixed(0), true)
                                        + "MODIFIER:" + fieldChanged(oldPoke.statBlock.dexMod, newPoke.statBlock.dexMod, true)
                                        + CODE_FORMAT_END,


                                        CODE_FORMAT_START
                                        + "SCORE:" + fieldChanged(oldPoke.statBlock.conBase.toFixed(0), newPoke.statBlock.conBase.toFixed(0), true)
                                        + "MODIFIER:" + fieldChanged(oldPoke.statBlock.conMod, newPoke.statBlock.conMod, true)
                                        + CODE_FORMAT_END,


                                        CODE_FORMAT_START
                                        + "SCORE:" + fieldChanged(oldPoke.statBlock.intBase.toFixed(0), newPoke.statBlock.intBase.toFixed(0), true)
                                        + "MODIFIER:" + fieldChanged(oldPoke.statBlock.intMod, newPoke.statBlock.intMod, true)
                                        + CODE_FORMAT_END,


                                        CODE_FORMAT_START
                                        + "SCORE:" + fieldChanged(oldPoke.statBlock.wisBase.toFixed(0), newPoke.statBlock.wisBase.toFixed(0), true)
                                        + "MODIFIER:" + fieldChanged(oldPoke.statBlock.wisMod, newPoke.statBlock.wisMod, true)
                                        + CODE_FORMAT_END,


                                        "```\n:3c```"
                                    ];

                                    // TODO update above array with charisma calculator when that's done and ready

                                    // Create embed with old/new updates
                                    let comparisonEmbed = {
                                        embed: {
                                            color: 3447003,
                                            author: {
                                                name: client.user.username,
                                                icon_url: client.user.avatarURL
                                            },
                                            title: `Review & Confirm Changes to ${newPoke.name}`,
                                            thumbnail: {
                                                url: `${newPoke.pokemonData.sprites.front_default}`,
                                            },
                                            description: `Please review the Pokemon's updated stats, highlighted in color below. If the updates are correct, confirm the changes to the Pokemon by reacting to the message beneath this embed.`,
                                            fields: [
                                                {
                                                    name: "Static Fields",
                                                    value: `These should not change via dynamic field updates.\n`
                                                        + `**Name:** ${newPoke.name}\n`
                                                        + `**Ability:** ${formatAbility(newPoke.ability.name)}\n`
                                                        + `**Gender:** ${capitalize(newPoke.gender)}\n`
                                                        + `**Shiny?** ${newPoke.shiny}`,
                                                    inline: true
                                                },
                                                {
                                                    name: "Core Fields",
                                                    value: `${CODE_FORMAT_START}Level${fieldChanged(oldPoke.level, newPoke.level, true)}Species${fieldChanged(oldSpecies, newSpecies, false)}${CODE_FORMAT_END}`,
                                                    inline: true
                                                },
                                                {
                                                    name: "=====",
                                                    value: "**BASE STATS**"
                                                },
                                                {
                                                    name: "Hit Points (HP)",
                                                    value: `${CODE_FORMAT_START}IV: ${fieldChanged(oldPoke.statBlock.ivStats[0], newPoke.statBlock.ivStats[0], true)}EV: ${fieldChanged(oldPoke.statBlock.evStats[0], newPoke.statBlock.evStats[0], true)}FINAL: ${fieldChanged(oldPoke.statBlock.finalStats[0], newPoke.statBlock.finalStats[0], true)}${CODE_FORMAT_END}`,
                                                    inline: true
                                                },
                                                {
                                                    name: "Attack (ATK)",
                                                    value: `${CODE_FORMAT_START}IV: ${fieldChanged(oldPoke.statBlock.ivStats[1], newPoke.statBlock.ivStats[1], true)}EV: ${fieldChanged(oldPoke.statBlock.evStats[1], newPoke.statBlock.evStats[1], true)}FINAL: ${fieldChanged(oldPoke.statBlock.finalStats[1], newPoke.statBlock.finalStats[1], true)}${CODE_FORMAT_END}`,
                                                    inline: true
                                                },
                                                {
                                                    name: "Defense (DEF)",
                                                    value: `${CODE_FORMAT_START}IV: ${fieldChanged(oldPoke.statBlock.ivStats[2], newPoke.statBlock.ivStats[2], true)}EV: ${fieldChanged(oldPoke.statBlock.evStats[2], newPoke.statBlock.evStats[2], true)}FINAL: ${fieldChanged(oldPoke.statBlock.finalStats[2], newPoke.statBlock.finalStats[2], true)}${CODE_FORMAT_END}`,
                                                    inline: true
                                                },
                                                {
                                                    name: "Spec. Attack (SPA)",
                                                    value: `${CODE_FORMAT_START}IV: ${fieldChanged(oldPoke.statBlock.ivStats[3], newPoke.statBlock.ivStats[3], true)}EV: ${fieldChanged(oldPoke.statBlock.evStats[3], newPoke.statBlock.evStats[3], true)}FINAL: ${fieldChanged(oldPoke.statBlock.finalStats[3], newPoke.statBlock.finalStats[3], true)}${CODE_FORMAT_END}`,
                                                    inline: true
                                                },
                                                {
                                                    name: "Spec. Defense (SPD)",
                                                    value: `${CODE_FORMAT_START}IV: ${fieldChanged(oldPoke.statBlock.ivStats[4], newPoke.statBlock.ivStats[4], true)}EV: ${fieldChanged(oldPoke.statBlock.evStats[4], newPoke.statBlock.evStats[4], true)}FINAL: ${fieldChanged(oldPoke.statBlock.finalStats[4], newPoke.statBlock.finalStats[4], true)}${CODE_FORMAT_END}`,
                                                    inline: true
                                                },
                                                {
                                                    name: "Speed (SPE)",
                                                    value: `${CODE_FORMAT_START}IV: ${fieldChanged(oldPoke.statBlock.ivStats[5], newPoke.statBlock.ivStats[5], true)}EV: ${fieldChanged(oldPoke.statBlock.evStats[5], newPoke.statBlock.evStats[5], true)}FINAL: ${fieldChanged(oldPoke.statBlock.finalStats[5], newPoke.statBlock.finalStats[5], true)}${CODE_FORMAT_END}`,
                                                    inline: true
                                                },
                                                {
                                                    name: "=====",
                                                    value: "**ABILITY SCORES**"
                                                },
                                                {
                                                    name: "Strength (STR)",
                                                    value: `${abilityScoreString[0]}`,
                                                    inline: true
                                                },
                                                {
                                                    name: "Dexterity (DEX)",
                                                    value: `${abilityScoreString[1]}`,
                                                    inline: true
                                                },
                                                {
                                                    name: "Constitution (CON)",
                                                    value: `${abilityScoreString[2]}`,
                                                    inline: true
                                                },
                                                {
                                                    name: "Intelligence (INT)",
                                                    value: `${abilityScoreString[3]}`,
                                                    inline: true
                                                },
                                                {
                                                    name: "Wisdom (WIS)",
                                                    value: `${abilityScoreString[4]}`,
                                                    inline: true
                                                },
                                                {
                                                    name: "Charisma (CHA)",
                                                    value: `${abilityScoreString[5]}`,
                                                    inline: true
                                                },
                                                {
                                                    name: "=====",
                                                    value: "**SAVING THROWS**"
                                                },
                                                {
                                                    name: "Fortitude (FORT)\nBased on CON",
                                                    value: `${CODE_FORMAT_START}${fieldChanged(oldPoke.statBlock.fortSave, newPoke.statBlock.fortSave, true)}${CODE_FORMAT_END}`,
                                                    inline: true
                                                },
                                                {
                                                    name: "Reflex (REF)\nBased on DEX",
                                                    value: `${CODE_FORMAT_START}${fieldChanged(oldPoke.statBlock.refSave, newPoke.statBlock.refSave, true)}${CODE_FORMAT_END}`,
                                                    inline: true
                                                },
                                                {
                                                    name: "Will (WILL)\nBased on WIS",
                                                    value: `${CODE_FORMAT_START}${fieldChanged(oldPoke.statBlock.willSave, newPoke.statBlock.willSave, true)}${CODE_FORMAT_END}`,
                                                    inline: true
                                                },
                                                {
                                                    name: "=====",
                                                    value: "**AC & Move Speed**"
                                                },
                                                {
                                                    name: "Armor Class (AC)",
                                                    value: `${CODE_FORMAT_START}${fieldChanged(oldPoke.statBlock.armorClass, newPoke.statBlock.armorClass, true)}${CODE_FORMAT_END}`,
                                                    inline: true
                                                },
                                                {
                                                    name: "Move Speed (measured in feet)",
                                                    value: `${CODE_FORMAT_START}${fieldChanged(oldPoke.statBlock.armorClass, newPoke.statBlock.armorClass, true)}${CODE_FORMAT_END}`,
                                                    inline: true
                                                },
                                            ],
                                            timestamp: new Date(),
                                            footer: {
                                                icon_url: client.user.avatarURL,
                                                text: "Chambers and Charizard!"
                                            }
                                        }
                                    };

                                    // ======== END FORMATTED VARIABLES & STRINGS & EMBED ========

                                    // post embed with changes displayed
                                    message.channel.send(comparisonEmbed);

                                    // alert user that they must confirm before actually sending changes
                                    message.reply("Changes displayed in embed above. Confirm with reaction ✅, or cancel with ❌").then(function (response) {
                                        // add reactions for easy user access
                                        response.react('✅');
                                        response.react('❌');

                                        //filter for the reaction collector
                                        const filter = (reaction, user) => user.id === message.author.id && (reaction.emoji.name === '✅' || reaction.emoji.name === '❌');

                                        // await user reaction
                                        response.awaitReactions(filter, { max: 1, time: 100000 }).then(collected => {
                                            // tell the log
                                            logger.info(`[modpoke] Collected ${collected.size} reactions.`)
                                            // if confirmed, update the poke and alert the user to such
                                            if (collected.first().emoji.name === '✅') {
                                                // update the pokemon and print confirmation
                                                newPoke.updatePokemon(connection, message, rows[0].private).then(function (results) {
                                                    let successString = "Success! " + pokeName + "'s " + valName + " has been changed to " + valString + " and all related stats have been updated.\n\nHint: View Pokemon's stat's using `+showpoke [nickname]`";
                                                    logger.info(`[modpoke] ${successString}`)
                                                    message.reply(successString);
                                                }).catch(function (error) {
                                                    message.reply("Error updating SQL for: " + pokeName);
                                                    logger.error(`[modpoke] Error updating SQL for ${pokeName}`)
                                                });
                                            } else {
                                                // if you're here, the user clicked X
                                                logger.info("Edits to Pokemon cancelled by user.")
                                                message.reply(pokeName + "'s edits have been cancelled");
                                            }
                                        }).catch((err) => {
                                            // timeout message
                                            let timeoutMessage = "Edits to " + pokeName + " cancelled via timeout.";
                                            // if you're here, the action timed out
                                            logger.error(`[modpoke] ${timeoutMessage}`);
                                            message.reply(timeoutMessage);
                                        });
                                    });

                                    //TODO: Find a better way to preserve health
                                    //As of right now just re-rolls hp
                                    //would have to add this within pokemon to do it neatly.
                                    //We can add an arg to .updatePokemon but I'm already doing that with private
                                    //and a one-off fix here would be messy since hp might change in another part of the bot


                                }).catch(function (error) {
                                    let loadNewPokeMessage = "Error loading new Pokemon to object. Please make sure you've entered a valid field and value.";
                                    message.reply(loadNewPokeMessage);
                                    logger.error(`[modpoke] ${loadNewPokeMessage}\n\t${error.toString()}`)
                                });
                            }).catch(function (error) {
                                let loadOriginalPokeMessage = "Error while attempting to load the original Pokemon to an object.";
                                message.reply(loadOriginalPokeMessage);
                                logger.error(`[modpoke] ${loadOriginalPokeMessage}\n\t${error.toString}`)
                            });
                        }
                    });
                }
            }
        });


    } catch (error) {
        logger.error(`[modpoke] Error while attempting to modify the Pokemon.\n\t${error.toString()}`)
        message.channel.send(error.toString());
        message.channel.send('Error while attempting to modify the Pokemon.').catch(console.error);
    }
};