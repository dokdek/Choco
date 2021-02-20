const Discord = require("discord.js");
const mongoose = require("mongoose");
const User = require("./models/user.model");
const helpMessage = require("./commands/help");
const kanjiJSON = require("./kanji.json");
const learn = require("./commands/learn");
const newUser = require("./helpers/new-user");
const fetchReviews = require("./commands/fetch-reviews");
const vocabJSON = require("./vocab.json");

require("dotenv").config();

const client = new Discord.Client();
const uri = process.env.ATLAS_URI;
const connection = mongoose.connection;

let kanjiArray = [];
let vocabArray = [];

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
      oneCorrect: false,
      level: 0,
      type: "kanji"
    };
    kanjiArray.push(newKanji);
  });

  vocabJSON.forEach((e)=>{
    const newVocab = {
      kanji: e.vocab,
      wk_level: e.wk_level,
      meanings: e.meanings,
      readings: e.readings,
      level: 0,
      oneCorrect: false,
      reviewDate: new Date(),
      meaningReview: false,
      readingReview: false,
      type: "vocab"
    }
    vocabArray.push(newVocab);
  })
  setInterval(reviewChecker, 60 * 60 * 1000);
});

client.on("message", (message) => {
  if (message.channel.type !== "dm" && message.content === "~help") {
    message.reply("I only work in DMs~");
    return;
  }
  if (message.content === "~help") {
    helpMessage(message);
  }
  if (message.content === "~review") {
    fetchReviews(message, kanjiArray, vocabArray);
  }
  if (message.content === "~learn") {
    learn(message, kanjiArray, vocabArray);
  }
  if (message.content === "~new") {
    newUser(message, kanjiArray, vocabArray);
  }
});

function reviewChecker() {
  console.log("Checking reviews.");
  const currDate = new Date();
  let reviewAmount = 0;
  let newReviews = false;
  User.find({}, (err, users) => {
    if (err) {
      console.log("Error in reviewChecker");
    } else {
      users.forEach((user) => {
        for(let i = 0; i < user.reviewed.length; i++){
          if(currDate > user.reviewed[i].reviewDate){
            console.log("Review found");
            newReviews = true;
            reviewAmount++;
            user.reviews.push(user.reviewed[i])
            user.reviewed.splice(i, 1);
            i--;
          }
        }
        if (newReviews === true && user.reminded != reviewAmount) {
          console.log("Sending review reminder to");
          console.log(user.userId);
          const embeddedMessage = new Discord.MessageEmbed()
            .setColor("#fd360b")
            .setTitle("Reviews available!")
            .setDescription(
              "You have " +
                reviewAmount +
                " reviews available. Use ~review to commence them now."
            )
            .setFooter("Updated on " + new Date());
            user.reminded = reviewAmount;
            user.markModified("reviewed");
            user.save()
            .then(()=>{
              client.users.fetch(user.userId)
              .then((user)=>{
                user.send(embeddedMessage);
              });
            })
          newReviews = false;
          reviewAmount = 0;
        }
      });
    }
  });
}

function mover(){
  console.log("moving back to reviewed");
  User.find({},(err, users)=>{
    if (err) {
      console.log("Error in reviewChecker");
    } else {
      users.forEach((user) => {
        const temp = user.reviews;
        user.reviewed = temp.concat(user.reviewed);
        user.reviews = [];
        user.markModified("reviews");
        user.save();
      });
    }
  })
}

client.login(process.env.TOKEN);
