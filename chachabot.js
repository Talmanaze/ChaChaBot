const Discord = require("discord.js");
const Enmap = require("enmap");
const fs = require("fs");
const mysql = require("mysql");
const pokedex = require('pokedex-promise-v2');
const winston = require('winston');
const discordTransport = require('./models/discordTransport.js');



const client = new Discord.Client();

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    //
    // - Write all logs with level `error` and below to `error.log`
    // - Write all logs with level `info` and below to `combined.log`
    //
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console(),
  ]
});

//logger.add(new discordTransport({client: client}));

const config = require("./config.json");
// We also need to make sure we're attaching the config to the CLIENT so it's accessible everywhere!
client.config = config;

//Connect to the Mysql Server!
let connection = mysql.createConnection({
  host: config.mysql_host,
  user: config.mysql_user,
  password: config.mysql_pass,
  database: config.mysql_db,
  port: config.mysql_port,
  supportBigNumbers: true,
  bigNumberStrings: true
});

let P = new pokedex();

fs.readdir("./events/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    const event = require(`./events/${file}`);
    let eventName = file.split(".")[0];
    client.on(eventName, event.bind(null, client, connection, P));
  });
});

client.commands = new Enmap();

fs.readdir("./commands/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    if (!file.endsWith(".js")) return;
    let props = require(`./commands/${file}`);
    let commandName = file.split(".")[0];
    console.log(`Attempting to load command ${commandName}`);
    client.commands.set(commandName, props);
  });
});

connection.connect(function(err) {
  if (err) return console.error(err);
  console.log('Connection to mySQL database successful! Connected as id ' + connection.threadId);
});

client.login(config.token);


