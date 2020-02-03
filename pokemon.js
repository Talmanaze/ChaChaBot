const GENDER_MAX = 8;
const NATURE_ARRAY_MAX = 5;
const STAT_ARRAY_MAX = 6;
const NATURE_POSITIVE_MULIPLIER = 1.1;
const NATURE_NEGATIVE_MULTIPLIER = 0.9;
const BASE_HP = 16;
const EV_MULTIPLIER = 4;
const BASE_STAT_MULTIPLIER = 2;
const ATTACK_BST_INDEX = 1;
const SPECIALATTACK_BST_INDEX = 3;
const SPECIALDEFENSE_BST_INDEX = 4;
const SPEED_BST_INDEX = 5;
const NATURAL_ARMOUR_MULT = 0.08;
const DEFENSE_BST_INDEX = 2;
const NATURAL_ARMOUR_SHIFT = 0.6;
const AC_BASE = 10;
const DEX_AC_CALC_BASE = 10;
const DEX_AC_CALC_MULT = 2;
const STAT_CALC_MULT = 0.15;
const STAT_CALC_BASE = 1.5;
const DTEN = 10;
const FORM_DIVISOR = 20;
const FORM_SHIFT = 5;
const MOVE_SPEED_MULT = 0.38;
const MOVE_SPEED_SHIFT = 4;
const SHINY_CHANCE = 4096;
const IV_MAX = 32;

// Generates a new ChaCha Pokemon, given level & base stats

// ======================= POKEMON OBJECT =======================

function Pokemon(tempSpecies, tempLevel, tempName, P){

    // ======================= VARIABLES =======================

    this.name = tempName;
    this.species = tempSpecies;
    this.level = tempLevel;
    //level
    //stat arrays: HP, ATK, DEF, SPA, SPD, SPE
    this.baseStats = [1,1,1,1,1,1];
    //chance of being male
    this.genderChance = 1;
    //number of abilities available
    this.abilityNum = 1;
    //size bonus
    this.sizeBonus = 1;
    //hidden ability percentile
    this.haChance = 1;

    // IVs
    this.ivStats = [0, 0, 0, 0, 0, 0];

    // EVs ... all naturally 0
    this.evStats = [0, 0, 0, 0, 0, 0];

    //formula for stats
    this.formStats = [0, 0, 0, 0, 0, 0];
    // nmulti, calculator stats
    this.nMultiStats = [1, 1, 1, 1, 1, 1];

    // final stats
    this.finalStats = [0, 0, 0, 0, 0, 0];

    // gender, ability, shiny
    this.gender = "";
    // the final ability chosen
    this.ability = "";
    // if the pokemon is shiny or not
    this.shiny = false;

    //nature + correlating names
    this.natureFinal = "";
    //nature names
    this.natureNames = [
        ["Hardy", "Lonely", "Adamant", "Naughty", "Brave"],
        ["Bold", "Docile", "Impish", "Lax", "Relaxed"],
        ["Modest", "Mild", "Bashful", "Rash", "Quiet"],
        ["Calm", "Gentle", "Careful", "Quirky", "Sassy"],
        ["Timid", "Hasty", "Jolly", "Naive", "Serious"]
    ];


    // DND STATS
    this.natArmor = 0;
    this.armorClass = 10;
    this.moveSpeed = 20;
    this.conBase = 10;
    this.conMod = 0;
    this.strBase = 0;
    this.strMod = 0;
    this.intBase = 0;
    this.intMod = 0;
    this.wisBase = 0;
    this.wisMod = 0;
    this.dexBase = 10;
    this.dexMod = 0;

    P.getPokemonByName(this.species)
        .then(function(response){
            this.pokemonData = response;
        })
        .catch(function(error) {
            console.log("Error when retrieving pokemon Data :C  ERROR: ", error);
        });
    P.getPokemonSpeciesByName(this.species)
        .then(function(response){
            this.speciesData = response;
        })
        .catch(function(error) {
            console.log("Error when retrieving pokemon species Data :C  ERROR: ", error);
        });


}
// ========================= MISC VAL GENERATORS =========================
//modifier generator
let modPrint = function (abilityScore) {
    let mainScore = abilityScore;
    let rawMod = modGen(abilityScore);
    let modString;

    rawMod = rawMod.toFixed(0);

    if (rawMod > 0) {
        modString = "+" + rawMod.toString();
    } else {
        modString = rawMod.toString();
    }
    return modString;
};

let modGen = function (abilityScore) {
    return Math.floor((abilityScore - 10)/2);
};

Pokemon.prototype.genRandAbility = function() {
    if (Math.floor((Math.random() * 100) + 1) <= haChance) {
        this.ability = this.abilityNum;
    } else {
        if (this.abilityNum === 2) {
            this.ability = 1;
        } else {
            this.ability = Math.floor((Math.random()) + 1);
        }
    }
};
//Assign gender
Pokemon.prototype.assignRandGender = function(genderChance) {
    //assign gender
    let gender = "genderless";
    //Calculates Gender as a fraction of 8
    const genderNum = Math.floor((Math.random() * GENDER_MAX) + 1);
    if (genderChance <= -1) return gender;
    else if (genderNum <= genderChance) {
           gender = "female";
    }
    else gender = "male";

     this.gender = gender;
};

//shiny generator!
Pokemon.prototype.assignShiny = function() {
    this.shiny = (Math.floor((Math.random() * SHINY_CHANCE) + 1)) >= SHINY_CHANCE;
};

// ========================= STAT ARRAY GENERATOR!!! =========================
//assign IVs
Pokemon.prototype.assignRandIVs = function(ivStats) {
    for (let i = 0; i < STAT_ARRAY_MAX; i++) {
        this.ivStats[i] = Math.floor((Math.random() * IV_MAX)); //assigns a value between 0 & 31 to all the IVs
    };
};

//generate nature
Pokemon.prototype.assignRandNature = function() {
//x-coord for nature
    let natureXCoord = Math.floor((Math.random() * NATURE_ARRAY_MAX)); //val between 0-4 for array
//y-coord for nature
    let natureYCoord = Math.floor((Math.random() * NATURE_ARRAY_MAX));

//assign nature to final val
    this.natureFinal = this.natureNames[natureXCoord][natureYCoord];

//update attributes based on nature
//if xcoord = ycoord, no changes, otherwise adjusting...
    if (natureXCoord !== natureYCoord) {
        for (let i = 0; i < STAT_ARRAY_MAX; i++) {
            if (natureXCoord === i) {
                this.nMultiStats[i + 1] = NATURE_POSITIVE_MULIPLIER;
            }
            if (natureYCoord === i) {
                this.nMultiStats[i + 1] = NATURE_NEGATIVE_MULTIPLIER;
            }
        }
    }
};

Pokemon.prototype.calculateStats = function() {
//get CON + hit points
//calculate con +  EQ: [(BaseStats + IVs + EVs/4) * .15 +1.5]
    this.conBase = Math.round(this.baseStats[0] + this.ivStats[0] * STAT_CALC_MULT + STAT_CALC_BASE);

    this.conMod = modPrint(this.conBase);

//calculate = attribute max HP
//formula for hp... 16 + Conmod, with an additional 2d10 + conmod per level.
    let diceRoll = BASE_HP;
    for (let i = 1; i < this.level; i++) {
        diceRoll += Math.floor((Math.random() * DTEN) + 1) + Math.floor((Math.random() * DTEN) + 1) + ((this.conBase - 10) / 2);
    }
    this.finalStats[0] = BASE_HP + ((this.conBase - 10) / 2) + diceRoll;

//get all ability scores
//go through base formula for stat creation
    for (let ii = 1; ii < STAT_ARRAY_MAX; ii++) {
        this.formStats[ii] = Math.floor((((BASE_STAT_MULTIPLIER * this.baseStats[ii] + this.ivStats[ii] + (this.evStats[ii] / EV_MULTIPLIER)) * this.level) / FORM_DIVISOR) + FORM_SHIFT);
        this.finalStats[ii] = Math.floor(this.formStats[ii] * this.nMultiStats[ii]);
    }

//get dnd stats
//stat calculator
    const getAbility = function (a) {
        return (STAT_CALC_MULT * a + STAT_CALC_BASE);
    };

//strength is based off of attack stat
    this.strBase = Math.round(getAbility(this.finalStats[ATTACK_BST_INDEX]));
    this.strMod = modPrint(this.strBase);

//int is based off of special attack stat
    this.intBase = Math.round(getAbility(this.finalStats[SPECIALATTACK_BST_INDEX]));
    this.intMod = modPrint(this.intBase);

//wis is based off of special defense stat
    this.wisBase = Math.round(getAbility(this.finalStats[SPECIALDEFENSE_BST_INDEX]));
    this.wisMod = modPrint(this.wisBase);

//dex is based off of speed stat
    this.dexBase = Math.round(getAbility(this.finalStats[SPEED_BST_INDEX]));
    this.dexMod = modPrint(this.dexBase);

//get nat armor, ac
//natArmor is based off defense stat
    this.natArmor = (NATURAL_ARMOUR_MULT * (this.finalStats[DEFENSE_BST_INDEX])) - NATURAL_ARMOUR_SHIFT;

//armor class
//message.channel.send(`Natural Armor: ${natArmor} || Size Bonus: ${sizeBonus} || Dex: ${dexMod}`);
    this.armorClass = (AC_BASE + this.natArmor + this.sizeBonus + ((this.dexBase - DEX_AC_CALC_BASE) / DEX_AC_CALC_MULT)).toFixed(0);

//get move speed
    this.moveSpeed = (MOVE_SPEED_MULT * this.finalStats[SPEED_BST_INDEX] + MOVE_SPEED_SHIFT).toFixed(2);
};

Pokemon.prototype.sendSummaryMessage = function(client, message) {
    message.channel.send({embed: {
            color: 3447003,
            author: {
                name: client.user.username,
                icon_url: client.user.avatarURL
            },
            title: `Level ${this.level} ${this.name}`,
            url: `https://bulbapedia.bulbagarden.net/wiki/${this.name}_(Pok%C3%A9mon)`,
            description: "Click the link for the Bulbapedia page, or use !data to call info using the Pokedex bot.",
            fields: [
                {
                    name: "Basic Info",
                    value: `**Ability:** ${this.ability} | **Gender:** ${this.gender} | **Nature: ** ${this.natureFinal} | **Shiny: ** ${this.shiny}\n=================`
                },
                {
                    name: "HP",
                    value: `**IV: ** ${this.ivStats[0]} | **Final: ** ${this.finalStats[0]}\n=================`
                },
                {
                    name: "Attack",
                    value: `**IV: ** ${this.ivStats[1]} | **Final: ** ${this.finalStats[1]}\n=================`
                },
                {
                    name: "Defense",
                    value: `**IV: ** ${this.ivStats[2]} | **Final: ** ${this.finalStats[2]}\n=================`
                },
                {
                    name: "Special Attack",
                    value: `**IV: ** ${this.ivStats[3]} | **Final: ** ${this.finalStats[3]}\n=================`
                },
                {
                    name: "Special Defense",
                    value: `**IV: ** ${this.ivStats[4]} | **Final: ** ${this.finalStats[4]}\n=================`
                },
                {
                    name: "Speed",
                    value: `**IV: ** ${this.ivStats[5]} | **Final: ** ${this.finalStats[5]}\n=================`
                },
                {
                    name: "Ability Scores",
                    value: `**STR: ** ${this.strBase.toFixed(0)}(${this.strMod}) | **DEX: ** ${this.dexBase.toFixed(0)}(${this.dexMod}) | **CON: ** ${this.conBase.toFixed()}(${this.conMod})\n**INT: ** ${this.intBase.toFixed(0)}(${this.intMod}) | **WIS: ** ${this.wisBase.toFixed(0)}(${this.wisMod})\n**AC: ** ${this.armorClass} | **Move Speed: ** ${this.moveSpeed} ft`
                },
            ],
            timestamp: new Date(),
            footer: {
                icon_url: client.user.avatarURL,
                text: "Chambers and Charizard!"
            }
        }
    });
};


/* //CONNECTION Function - To Be Finished
        //upload
        connection.connect(function(err) {
            if (err) throw err;
            console.log("Connected!");
            var sql = "INSERT INTO pokemon (name, species, level, nature, gender, ability, hp, atk, def, spa, spd, spe, IVhp, IVatk, IVdef, IVspa, IVspd, IVspe, EVhp, EVatk, EVdef, EVspa, EVspd, EVspe) VALUES ('Company Inc', 'Highway 37')";
            con.query(sql, function (err, result) {
                if (err) throw err;
                console.log("1 record inserted");
            });
        });
*/