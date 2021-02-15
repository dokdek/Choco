const Discord = require("discord.js");

const timeInterval = [4, 8, 24, 48, 168, 336, 730, 2920];
const humanTimeInterval = ["4 hours", "8 hours","1 day","2 days","1 week", "2 weeks","1 month", "4 months", ""];
const levelNames = ["Apprentice 1", "Apprentice 2", "Apprentice 3", "Apprentice 4", "Guru 1", "Guru 2", "Master", "Enlightened", "Burned"];

const reviewQuestions = (message, user, amount) => {
  if (amount === 0) {
    const reviewMessage = user.reviews.length + " reviews left.";
    if(user.reviews.length === 1){
      reviewMessage = "1 review left."
    }
    const embeddedMessage = new Discord.MessageEmbed()
    .setColor("#fd360b")
    .setTitle(reviewMessage);
    if(user.learning.length === 0 && levelChecker(user) === true){
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
    .setColor("#fd360b")
    .setTitle(user.reviews[randomIndex].kanji)
    .setDescription("What is the **meaning** of the above?")
    .setFooter("**Meaning** | Level: " + item.values.wk_level);
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
          embeddedMessage.setTitle("Correct!").setDescription("").setColor("#00FF00");
          if (levelIncrease) {
            item.level += 1;
            amount--;
            item.oneCorrect = false;
            item.readingReview = false;
            item.meaningReview = false;
            if (item.level === 9) {
              //move to learnt/burned
            } else {
              let reviewDate = new Date()
              reviewDate.setHours(reviewDate.getHours() + timeInterval[item.level - 1]);
              item.reviewDate = reviewDate;
              user.reviewed.push(item);
              user.reviews.splice(randomIndex, 1);
            }
            embeddedMessage
            .setDescription(item.kanji)
            .addFields(
              {
                name: "Proficiency",
                value: levelNames[item.level - 1],
              },
              {
                name: "Next Review",
                value: item.reviewDate + "\n" + humanTimeInterval[item.level - 1],
              },);
          }
          message.reply(embeddedMessage);
          user.markModified("reviews");
          user.save().then(() => reviewQuestions(message, user, amount));
        } else {
          if (item.level > 0) {
            item.level -= 1;
          }
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
  let item = user.reviews[randomIndex];
  const embeddedMessage = new Discord.MessageEmbed()
    .setColor("#fd360b")
    .setTitle(item.kanji)
    .setDescription("What is the **reading** of the above?")
    .setFooter("**Reading** | Level: " + item.values.wk_level);
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
          item.values.wk_readings_on.includes(response) ||
          item.values.wk_readings_kun.includes(response)
        ) {
          //Meaning complete, one crrect
          item.readingReview = true;
          item.oneCorrect = true;
          msg.delete();
          embeddedMessage.setTitle("Correct!").setDescription("").setColor("#00FF00");
          if (levelIncrease) {
            item.level += 1;
            amount--;
            item.oneCorrect = false;
            item.readingReview = false;
            item.meaningReview = false;
            if (item.level === 9) {
              //move to learnt/burned
            } else {
              let reviewDate = new Date()
              reviewDate.setHours(reviewDate.getHours() + timeInterval[item.level - 1]);
              item.reviewDate = reviewDate;
              user.reviewed.push(item);
              user.reviews.splice(randomIndex, 1);
            }
            embeddedMessage
            .setDescription(item.kanji)
            .addFields(
              {
                name: "Proficiency",
                value: levelNames[item.level - 1],
              },
              {
                name: "Next Review",
                value: item.reviewDate + "\n" + humanTimeInterval[item.level - 1],
              },);
          }
          message.reply(embeddedMessage);
          user.markModified("reviews");
          user.save().then(() => reviewQuestions(message, user, amount));
        } else {
            if (item.level > 0) {
              item.level -= 1;
            }
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

function levelChecker(user){
  const userLevel = user.level;
  const levelArray = user.reviewed.map((e)=>{
    if(e.values.wk_level === userLevel){
      return e;
    }
  });
  for(let i = 0; i < levelArray.length; i++){
    if(levelArray[i].level < 5){
      return false;
    }
  }
  return true;
}

module.exports = reviewQuestions;
