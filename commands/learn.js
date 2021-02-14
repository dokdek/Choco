const learningPrompt = require("../helpers/learning-prompt");
const User = require("../models/user.model");
const newUser = require("../helpers/new-user");

const learn = (message, kanjiArray) => {
  User.findOne({ userId: message.author.id }, (err, user) => {
    if (err) {
      console.log(err);
      message.reply("I had an error processing that request.");
    } else if (user) {
      learningPrompt(user, message);
    } else {
      newUser(message, kanjiArray);
    }
  });
};

module.exports = learn;
