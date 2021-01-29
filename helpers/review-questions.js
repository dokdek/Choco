const Discord = require("discord.js");

const reviewQuestions = (message, user, amount) => {
  if (amount === 0) {
    return;
  }
  const randomIndex = Math.floor(Math.random() * amount);
  console.log(randomIndex);
  if (user.reviews[randomIndex].oneCorrect === false) {
    const ran = Math.floor(Math.random() * 2);
    if (ran === 1) {
      //create meaning review
      meaningEmbed(message, user, randomIndex, amount);
    } else {
      //create reading review
      reviewEmbed(message, user, randomIndex, amount);
    }
  } else if (user.reviews[randomIndex].meaningCorrect === true) {
    //create reading review
    reviewEmbed(message, user, randomIndex, amount, true);
  } else {
    meaningEmbed(message, user, randomIndex, amount, true);
  }
};

function meaningEmbed(message, user, randomIndex, amount, levelIncrease) {
  user.reviews[randomIndex];
  const embeddedMessage = new Discord.MessageEmbed()
    .setColor("#fd360b")
    .setTitle(user.reviews[randomIndex].kanji)
    .setDescription("");
  embeddedMessage.setDescription("What is the meaning of the above?");
  message.reply(embeddedMessage).then((msg) => {
    const msgFilter = (m) =>
      m.content.length > 0 && m.author.id === user.userId;
    msg.channel
      .awaitMessages(msgFilter, { max: 1 })
      .then((collected) => {
        const response = capitalizeFirstLetter(
          collected.first().content.trim()
        );
        if (user.reviews[randomIndex].values.wk_meanings.includes(response)) {
          //Meaning complete, one crrect
          user.reviews[randomIndex].meaningReview = true;
          user.reviews[randomIndex].oneCorrect = true;
          msg.delete();
          embeddedMessage.setTitle("Correct!").setDescription("");
          message.reply(embeddedMessage);
          if (levelIncrease) {
            //increase this kanji level here.
            //change review time here
            amount--;
          }
          user.markModified("reviews");
          user.save().then(() => reviewQuestions(message, user, amount));
        } else {
          //reduce level by 1???
          msg.delete();
          embeddedMessage
            .setTitle(user.reviews[randomIndex].kanji)
            .setDescription("Incorrect!")
            .addFields({
              name: "Meaning",
              value: user.reviews[randomIndex].values.wk_meanings,
            });
          message.reply(embeddedMessage);
          user.markModified("reviews");
          user.save().then(() => reviewQuestions(message, user, amount));
        }
      })
      .catch((err) => console.log(err));
  });
}

function reviewEmbed(message, user, randomIndex, amount, levelIncrease) {
  user.reviews[randomIndex];
  const embeddedMessage = new Discord.MessageEmbed()
    .setColor("#fd360b")
    .setTitle(user.reviews[randomIndex].kanji)
    .setDescription("");
  embeddedMessage.setDescription("What is the reading of the above?");
  message.reply(embeddedMessage).then((msg) => {
    const msgFilter = (m) =>
      m.content.length > 0 && m.author.id === user.userId;
    msg.channel
      .awaitMessages(msgFilter, { max: 1 })
      .then((collected) => {
        const response = capitalizeFirstLetter(
          collected.first().content.trim()
        );
        if (
          user.reviews[randomIndex].values.wk_readings_on.includes(response) ||
          user.reviews[randomIndex].values.wk_readings_kun.includes(response)
        ) {
          //Meaning complete, one crrect
          user.reviews[randomIndex].readingReview = true;
          user.reviews[randomIndex].oneCorrect = true;
          msg.delete();
          embeddedMessage.setTitle("Correct!").setDescription("");
          message.reply(embeddedMessage);
          if (levelIncrease) {
            //increase this kanji level here.
            //change review time here.
            amount--;
          }
          user.markModified("reviews");
          user.save().then(() => reviewQuestions(message, user, amount));
        } else {
          //reduce level by 1???
          msg.delete();
          embeddedMessage
            .setTitle(user.reviews[randomIndex].kanji)
            .setDescription("Incorrect!")
            .addFields(
              {
                name: "Kunyomi Readings",
                value:
                  user.reviews[randomIndex].values.wk_readings_kun.length === 0
                    ? "None"
                    : user.reviews[randomIndex].values.wk_readings_kun,
              },
              {
                name: "Onyomi Readings",
                value:
                  user.reviews[randomIndex].values.wk_readings_on.length === 0
                    ? "None"
                    : user.reviews[randomIndex].values.wk_readings_on,
              }
            );
          message.reply(embeddedMessage);
          user.markModified("reviews");
          user.save().then(() => reviewQuestions(message, user, amount));
        }
      })
      .catch((err) => console.log(err));
  });
}

function capitalizeFirstLetter(string) {
  return string[0].toUpperCase() + string.slice(1).toLowerCase();
}

module.exports = reviewQuestions;
