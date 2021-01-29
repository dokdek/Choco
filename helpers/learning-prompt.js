const Discord = require("discord.js");

const learningPrompt = (user, message) => {
  //check if learning array is empty, if empty take all user level kanji and move from to learn to learning array, then pass to embed.
  if (user.learning.length === 0) {
    let hasLearning = true;
    while (hasLearning) {
      if (user.toLearn[0].values.wk_level === user.level) {
        user.learning.push(user.toLearn[0]);
        user.toLearn.shift();
      } else {
        hasLearning = false;
      }
    }
  }
  user.save().then(()=>   learningEmbed(user, message, 1));
};

function learningEmbed(user, message, counter) {
  if (user.learning.length === 0 || counter === 6) {
    const embeddedCompletionMsg = new Discord.MessageEmbed()
      .setColor("#fd360b")
      .setDescription(
        "Learning complete, please review now to reinforce your memory, or choose to learn more."
      );
    user.save().then(() => {
      message.reply(embeddedCompletionMsg);
    });
  } else if (counter <= 5) {
    const embeddedMessage = new Discord.MessageEmbed().setColor("#fd360b");
    embeddedMessage
      .setTitle(user.learning[0].kanji)
      .addFields(
        { name: "Meaning", value: user.learning[0].values.wk_meanings },
        {
          name: "Kunyomi Readings",
          value:
            user.learning[0].values.wk_readings_kun.length === 0
              ? "None"
              : user.learning[0].values.wk_readings_kun,
        },
        {
          name: "Onyomi Readings",
          value:
            user.learning[0].values.wk_readings_on.length === 0
              ? "None"
              : user.learning[0].values.wk_readings_on,
        }
      )
      .setFooter("Level: " + user.learning[0].values.wk_level);
    message.reply(embeddedMessage).then((msg) => {
      msg.react("➡️").then(() => {
        const reactFilter = (reaction, user) => {
          return reaction.emoji.name === "➡️" && user.id !== msg.author.id;
        };
        msg.awaitReactions(reactFilter, { max: 1 }).then(() => {
          msg.delete();
          user.reviews.push(user.learning[0]);
          user.learning.shift();
          learningEmbed(user, message, counter + 1);
        });
      });
    });
  }
}

module.exports = learningPrompt;
