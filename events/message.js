// Message Event

module.exports = (client, connection, P, message) => {
  // Ignore all bots
  if (message.author.bot) {
    return;
  }

  // ---------------------- PHRASE ANSWERS ----------------------
  //non-prefix responses
  const sentence = message.content.toLowerCase();
  //ligma
  if (sentence.includes("ligma")) {
    message.react("504175902393892875").catch(console.error);
    message.channel.send("Ligma ballz xD").catch(console.error);
  }
  //sugondese/sugandese
  else if (sentence.includes("sugondese") || sentence.includes("sugandese")) {
    message.react("504175902393892875").catch(console.error);
    message.channel.send("Sugondese nuts!").catch(console.error);
  }
  //sukon
  else if (sentence.includes("sukon") || sentence.includes("sukan")) {
    message.react("504175902393892875").catch(console.error);
    message.channel.send("Sukon deez nuts!").catch(console.error);
  }
  //dabbin on em
  else if (sentence.includes("dab") || message.content.includes("soren")) {
    message.channel.send("<:dab:355952925635379202>").catch(console.error);
  }
  // big think
  else if (sentence.includes("think")) {
    var randomThink = Math.floor(Math.random() * 10 + 1);
    //1-5 = castform think, 6-10= ashthink
    if (randomThink <= 5) {
      message.react("355493467800993794").catch(console.error);
    } else {
      message.react("361725356396380161").catch(console.error);
    }
  }
  //stick em up
  else if (
    sentence.includes("gun") ||
    sentence.includes("shoot") ||
    sentence.includes("schut") ||
    sentence.includes("schüt")
  ) {
    message.react("356191158017196032").catch(console.error);
  }
  //bofa
  else if (sentence.includes("bofa")) {
    message.react("504175902393892875").catch(console.error);
    message.channel.send("BOFA DEEZ NUTS!!!");
  }
  //nut
  else if (sentence.includes("nut")) {
    message.react("504175902393892875").catch(console.error);
  }
  //ditto
  else if (sentence.includes("ditto")) {
    message.react("359359698098585600").catch(console.error);
  }
  //jynx
  else if (sentence.includes("jynx") || sentence.includes("jinx")) {
    message.react("361730318618853376").catch(console.error);
  }
  //you're welcome
  else if (sentence.includes("thank") && sentence.includes("chachabot")) {
    message.channel.send("You're welcome :wink:");
  }
  // ---------------------- END PHRASE ANSWERS ----------------------

  // Ignore messages not starting with the prefix (in config.json)
  if (message.content.indexOf(client.config.prefix) !== 0) {
    return;
  }

  // Our standard argument/command name definition.
  const args = message.content
    .slice(client.config.prefix.length)
    .trim()
    .split(/ +/g);
  const command = args.shift().toLowerCase();

  // Grab the command data from the client.commands Enmap
  const cmd = client.commands.get(command);

  // If that command doesn't exist, silently exit and do nothing
  if (!cmd) return;

  // Run the command
  cmd.run(client, connection, P, message, args);
};
