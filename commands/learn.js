const learningPrompt = require("../helpers/learning-prompt");
const User = require("../models/user.model");
const newUser = require("../helpers/new-user");

const learn = (message, kanjiArray) => {
  User.findOne({ userId: message.author.id }, (err, user) => {
    if (err) {
      console.log(err);
      message.reply("I had an error processing that request.");
    } else if (user) {
      const learningLength = user.learning.length;
      if (learningLength === 0) {
        const embeddedMessage = new Discord.MessageEmbed()
          .setColor("#fd360b")
          .setDescription(
            "You have learned everything in your level. Continue reviewing until Guru 1 proficiency on all kanji to unlock the next level"
          );
        message.reply(embeddedMessage);
      } else {
        learningPrompt(user, message);
      }
    } else {
      newUser(message, kanjiArray);
    }
  });
};

module.exports = learn;
