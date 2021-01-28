const Discord = require("discord.js");
const User = require("../models/user.model");

const func = (message, kanjiArray) => {
  User.findOne({ userId: message.author.id }, (err, user) => {
    if (err) {
      message.reply("I encountered an error.");
    } else if (user) {
      const embeddedGreeting = new Discord.MessageEmbed()
        .setColor("#fd360b")
        .setTitle("User already exists!")
        .setDescription("You are already in my database!");
      message.reply(embeddedGreeting);
    } else {
      const newUser = new User({
        userId: message.author.id,
        level: 1,
        toLearn: kanjiArray,
      });
      newUser
        .save()
        .then(() => {
          const embeddedGreeting = new Discord.MessageEmbed()
            .setColor("#fd360b")
            .setTitle("New User Dectected!")
            .setDescription(
              "It seems you are not in my database, I have created a profile for you. Good luck learning~!"
            );
          message.reply(embeddedGreeting);
        })
        .catch((err) => console.log(err));
    }
  });
};

module.exports = func;
