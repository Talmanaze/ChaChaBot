var assert = require('assert');
var genpoke = require('../commands/genpoke.js');
var pokedex = require('pokedex-promise-v2');

describe('+genpoke', function () {
    describe('help', function () {
        it('should send a help message back to the user, when they use \'+genpoke help\'', function () {
            //message template
            const CMD_TEMPLATE = '+genpoke [SPECIES] [LEVEL (1-20)] [NICKNAME - no spaces or special characters] [HIDDEN' +
                ' ABILITY % (as a number, 0-100)]';
            //help message
            const HELP_MESSAGE = '\n' + CMD_TEMPLATE + '\n\n' + 'examples - `+genpoke Pikachu 1 Pika` or `+genpoke Pikachu 1' +
                ' Pika' +
                ' 30`' +
                ' (30% chance to have hidden ability)' +
                '\n\nCreates a new Pokemon when given the values above, printing it upon completion. \n**Created as private by' +
                ' default** - use `+modpoke (name) private 0` to make publicly visible/editable\n\n' +
                '(Hint: You can view an existing Pokemon with `+showpoke [nickname]`, or remove it using `+rempoke [nickname]`';

            class dum_msg {
                channel = {
                    name: "channel1",
                    guild: {
                        name: "guild1"
                    }
                };

                reply = function (obj) {
                    assert.strictEqual(obj, HELP_MESSAGE);
                    return Promise.resolve()
                }
            }

            let dum_args = ['help'];
            let dum_msg1 = new dum_msg()
            genpoke.run('', '', '', dum_msg1, dum_args)
        })
    });

    describe('too few args', function () {
        it('should tell the user there are too few arguments when they supply less than 3', function () {
            class dum_channel {
                send = function (obj) {
                    assert.strictEqual(obj, "You haven't provided enough arguments. Should be +genpoke [SPECIES] [LEVEL (1-20)] [NICKNAME - no spaces or special characters] [HIDDEN ABILITY % (as a number, 0-100)]")
                    return Promise.resolve()
                }
                guild = {
                    name: "guild1"
                }
                name = "channel1"
            }

            class dum_msg {
                channel = new dum_channel();
            }

            let dum_args = ['one', 'two'];
            let dum_msg1 = new dum_msg();
            genpoke.run('', '', '', dum_msg1, dum_args);
        })
    })

    describe('catching an error', function () {
        it('should throw an error when something goes wrong', function () {
            class dum_channel {
                send = function (obj) {
                    assert.strictEqual(obj, 'ChaCha machine :b:roke while attempting to generate a Pokemon, please try again later')
                    return Promise.resolve()
                }
                guild = {
                    name: "guild1"
                }
                name = "channel1"
            }

            class dum_msg {
                channel = new dum_channel();
                reply = function () { }
            }

            let dum_args = ['one', 'two', 'three'];
            let dum_msg1 = new dum_msg();
            genpoke.run('', '', '', dum_msg1, dum_args);
        })
    })

    describe('valid use case WITHOUT hidden ability %', function () {
        it('should generate the pokemon properly', function () {
            class dum_channel {
                send = function (obj) {
                    assert.strictEqual(obj.embed.title, 'Level 17 Gastly ~ fartcloud')
                    assert.strictEqual(obj.embed.url, `https://bulbapedia.bulbagarden.net/wiki/gastly_(Pok%C3%A9mon)`)
                    assert.strictEqual(obj.embed.description, "Click the link for the Bulbapedia page, or use !data to call info using the Pokedex bot.")
                }
                guild = {
                    name: "guild1"
                }
                name = "channel1"
            }

            class dum_msg {
                channel = new dum_channel();
                author = {
                    "id": 1
                }
                reply = function (obj) {
                    assert(obj, 'fartcloud has been added to the database\nTo remove it, use this command: `+rempoke fartcloud "`')
                }
            }

            class dum_conn {
                query = function () { }
            }

            class fake_client {
                user = {
                    "username": "natzberg",
                    "avatarURL": "not.real"
                }
            }

            let dum_args = ['gastly', '17', 'fartcloud'];
            let dum_msg1 = new dum_msg();
            let dum_conn1 = new dum_conn();
            let my_pkdx = new pokedex();
            let dum_client = new fake_client();
            genpoke.run(dum_client, dum_conn1, my_pkdx, dum_msg1, dum_args)
        })
    })
});