const Discord = require("discord.js");

const timeInterval = [4, 8, 24, 48, 168, 336, 730, 2920];
const humanTimeInterval = [
  "4 hours",
  "8 hours",
  "1 day",
  "2 days",
  "1 week",
  "2 weeks",
  "1 month",
  "4 months",
  "",
];
const levelNames = [
  "Apprentice 1",
  "Apprentice 2",
  "Apprentice 3",
  "Apprentice 4",
  "Guru 1",
  "Guru 2",
  "Master",
  "Enlightened",
  "Burned",
];

const reviewQuestions = (message, user, amount) => {
  if (amount === 0) {
    const reviewMessage = user.reviews.length + " reviews left.";
    if (user.reviews.length === 1) {
      reviewMessage = "1 review left.";
    }
    const embeddedMessage = new Discord.MessageEmbed()
      .setColor("#fd360b")
      .setTitle(reviewMessage);
    //change below, cannot check length, since sometimes vocab will be there. Extract to new function
    if (kanjiLearningLength(user) === 0 && levelChecker(user) === true) {
      //move vocab to learning here.
      let hasLearning = true;
      while (hasLearning) {
        if (user.vocabToLearn[0].wk_level === user.level) {
          user.learning.push(user.vocabToLearn[0]);
          user.vocabToLearn.shift();
        } else {
          hasLearning = false;
        }
      }
      user.level += 1;
      user.reminded = 0;
      embeddedMessage
        .setTitle("Level up!")
        .setDescription("You are now on level " + user.level);
      user.save();
    }
    message.reply(embeddedMessage);
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
  } else if (user.reviews[randomIndex].meaningReview === true) {
    //create reading review
    reviewEmbed(message, user, randomIndex, amount, true);
  } else {
    meaningEmbed(message, user, randomIndex, amount, true);
  }
};

function meaningEmbed(message, user, randomIndex, amount, levelIncrease) {
  let item = user.reviews[randomIndex];
  const embeddedMessage = new Discord.MessageEmbed()
    .setTitle(item.kanji)
    .setDescription("What is the **meaning** of the above?");
  //change embed msg below for vocab
  if (item.type === "Kanji") {
    embeddedMessage
      .setColor("#f6a0dad")
      .setFooter(
        item.type + " | Meaning | " + "Level: " + item.values.wk_level
      );
  } else if (item.type === "Vocab") {
    embeddedMessage
      .setColor("#29c2ef")
      .setFooter(
        item.type + " | Meaning | " + "Level: " + item.values.wk_level
      );
  }
  message.reply(embeddedMessage).then((msg) => {
    const msgFilter = (m) =>
      m.content.length > 0 && m.author.id === user.userId;
    msg.channel
      .awaitMessages(msgFilter, { max: 1 })
      .then((collected) => {
        //Change below for vocab, need change response, and change checker. The rest can stay.
        let response;
        let acceptedAnswers;
        if (item.type === "Kanji") {
          //captilizes first letter of response as all kanji meanings are capitalized
          response = capitalizeFirstLetter(collected.first().content.trim());
          acceptedAnswers = item.values.wk_meanings;
          //lowercases response as most vocab are in lowercase
        } else if (item.type === "Vocab") {
          response = collected.first().content.toLowerCase().trim();
          acceptedAnswers = item.meanings;
        }
        if (acceptedAnswers.includes(response)) {
          //Meaning complete, one crrect
          user.reviews[randomIndex].meaningReview = true;
          user.reviews[randomIndex].oneCorrect = true;
          msg.delete();
          embeddedMessage
            .setTitle("Correct!")
            .setDescription(item.kanji)
            .setColor("#00FF00");
          if (levelIncrease) {
            item.level += 1;
            amount--;
            item.oneCorrect = false;
            item.readingReview = false;
            item.meaningReview = false;
            if (item.level === 9) {
              //move to learnt/burned
            } else {
              let reviewDate = new Date();
              reviewDate.setHours(
                reviewDate.getHours() + timeInterval[item.level - 1]
              );
              item.reviewDate = reviewDate;
              user.reviewed.push(item);
              user.reviews.splice(randomIndex, 1);
            }
            embeddedMessage.setDescription(item.kanji).addFields(
              {
                name: "Proficiency",
                value: levelNames[item.level - 1],
              },
              {
                name: "Next Review",
                value:
                  item.reviewDate +
                  "\n" +
                  "In " +
                  humanTimeInterval[item.level - 1],
              }
            );
          }
          message.reply(embeddedMessage);
          user.markModified("reviews");
          user.save().then(() => reviewQuestions(message, user, amount));
        } else {
          if (item.level > 0) {
            item.level -= 1;
          }
          msg.delete();
          //change embed for vocab
          embeddedMessage
            .setTitle(item.kanji)
            .setDescription("Incorrect!")
            .addFields({
              name: "Meaning",
              value: acceptedAnswers,
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
  let item = user.reviews[randomIndex];
  const embeddedMessage = new Discord.MessageEmbed()
    .setTitle(item.kanji)
    .setDescription("What is the **reading** of the above?");
  if (item.type === "Kanji") {
    embeddedMessage
      .setColor("#f6a0dad")
      .setFooter(
        item.type + " | Meaning | " + "Level: " + item.values.wk_level
      );
  } else if (item.type === "Vocab") {
    embeddedMessage
      .setColor("#29c2ef")
      .setFooter(
        item.type + " | Meaning | " + "Level: " + item.values.wk_level
      );
  }
  message.reply(embeddedMessage).then((msg) => {
    const msgFilter = (m) =>
      m.content.length > 0 && m.author.id === user.userId;
    msg.channel
      .awaitMessages(msgFilter, { max: 1 })
      .then((collected) => {
        let response;
        let acceptedAnswer;
        if (item.type === "Kanji") {
          //captilizes first letter of response as all kanji meanings are capitalized
          response = capitalizeFirstLetter(collected.first().content.trim());
          acceptedAnswer =
            item.values.wk_readings_on.includes(response) ||
            item.values.wk_readings_kun.includes(response);
          //lowercases response as most vocab are in lowercase
        } else if (item.type === "Vocab") {
          response = collected.first().content.toLowerCase().trim();
          acceptedAnswer = item.readings === response;
        }
        if (acceptedAnswer) {
          //Meaning complete, one crrect
          item.readingReview = true;
          item.oneCorrect = true;
          msg.delete();
          embeddedMessage
            .setTitle("Correct!")
            .setDescription("")
            .setColor("#00FF00");
          if (levelIncrease) {
            item.level += 1;
            amount--;
            item.oneCorrect = false;
            item.readingReview = false;
            item.meaningReview = false;
            if (item.level === 9) {
              //move to learnt/burned
            } else {
              let reviewDate = new Date();
              reviewDate.setHours(
                reviewDate.getHours() + timeInterval[item.level - 1]
              );
              item.reviewDate = reviewDate;
              user.reviewed.push(item);
              user.reviews.splice(randomIndex, 1);
            }
            embeddedMessage.setDescription(item.kanji).addFields(
              {
                name: "Proficiency",
                value: levelNames[item.level - 1],
              },
              {
                name: "Next Review",
                value:
                  item.reviewDate +
                  "\n" +
                  "In " +
                  humanTimeInterval[item.level - 1],
              }
            );
          }
          message.reply(embeddedMessage);
          user.markModified("reviews");
          user.save().then(() => reviewQuestions(message, user, amount));
        } else {
          if (item.level > 0) {
            item.level -= 1;
          }
          msg.delete();
          embeddedMessage.setTitle(item.kanji).setDescription("Incorrect!");
          if (item.type === "Kanji") {
            embeddedMessage.addFields(
              {
                name: "Kunyomi Readings",
                value:
                  item.values.wk_readings_kun.length === 0
                    ? "None"
                    : item.values.wk_readings_kun,
              },
              {
                name: "Onyomi Readings",
                value:
                  item.values.wk_readings_on.length === 0
                    ? "None"
                    : item.values.wk_readings_on,
              }
            );
          } else if (item.type === "Vocab") {
            embeddedMessage.addFields({
              name: "Readings",
              value: item.readings,
            });
          }
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

//Checks if the kanji items at the user level have gone to guru1. If all guru1, user may move to next level.
function levelChecker(user) {
  const userLevel = user.level;
  const levelArray = user.reviewed.map((e) => {
    if (e.values.wk_level === userLevel) {
      return e;
    }
  });
  for (let i = 0; i < levelArray.length; i++) {
    if (levelArray[i].level < 5) {
      return false;
    }
  }
  return true;
}

//Checks if there are any kanjis in the learning array, if there are, return false.
function kanjiLearningLength(user) {
  user.learning.forEach((e) => {
    if (e.type === "Kanji") {
      return false;
    }
  });
  return true;
}

module.exports = reviewQuestions;
