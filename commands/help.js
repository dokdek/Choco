const Discord = require("discord.js");

const helpMessage = (message) => {
    const embeddedMessage = new Discord.MessageEmbed()
    .setColor("#DBFFFF")
    .setTitle("My Commands~")
    .setDescription(
      "~review command is the main command you will use. It will bring up reviews if you have any. ~learn command will bring up 5 new kanji for you to learn and add it to your review pool."
    );
    message.reply(embeddedMessage);
}

module.exports = helpMessage;