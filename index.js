const Discord = require("discord.js");
const mongoose = require("mongoose");
const helpMessage = require("./commands/help");
const kanjiJSON = require("./kanji.json");
const learn = require("./commands/learn");
const newUser = require("./helpers/new-user");

require("dotenv").config();

const client = new Discord.Client();
const uri = process.env.ATLAS_URI;
const connection = mongoose.connection;
let kanjiArray = [];

mongoose.connect(uri, { useNewUrlParser: true, useCreateIndex: true });
connection.once("open", () => {
  console.log("MongoDB connection established.");
});

client.once("ready", () => {
  console.log("Bot ready!");
  client.user.setActivity("Under Development");
  Object.keys(kanjiJSON).forEach((e) => {
    const newKanji = {
      kanji: e,
      values: kanjiJSON[e],
      reviewDate: new Date(),
      meaningReview: false,
      readingReview: false,
      bothCorrect: false,
    };
    kanjiArray.push(newKanji);
  });
});

client.on("message", (message) => {
  if (message.channel.type !== "dm" && message.content === "~help") {
    message.reply("I only work in DMs~");
    return;
  }
  /*if(message.content.startsWith("~") && createNewUser){
      console.log("Creating new user");
      const newUser = new User({
        userId: message.author.id,
        review: [],
        apprentice1: [],
        apprentice2: [],
        apprentice3: [],
        apprentice4: [],
        guru1: [],
        guru2: [],
        master: [],
        enlightened: [],
      })
      newUser.save()
        .then(()=>{
          const embeddedGreeting = new Discord.MessageEmbed()
          .setColor("#fd360b")
          .setTitle("New User Dectected!")
          .setDescription(
            "It seems you are not in my database, I have created a profile for you. Good luck learning~!"
          );
          message.reply(embeddedGreeting);
        })
        .catch((err)=>console.log(err));
    }*/
  if (message.content === "~help") {
    helpMessage(message);
  }
  if (message.content === "~review") {
    fetchReviews(message);
  }
  if (message.content === "~learn") {
    learn(message);
  }
  if (message.content === "~new") {
    newUser(message, kanjiArray);
  }
});

client.login(process.env.TOKEN);
