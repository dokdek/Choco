const Discord = require("discord.js");
const mongoose = require("mongoose");
const User = require("./models/user.model");
const helpMessage = require("./commands/help");
const kanjiJSON = require("./kanji.json");
const learn = require("./commands/learn");
const newUser = require("./helpers/new-user");
const fetchReviews = require("./commands/fetch-reviews");

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
      oneCorrect: false,
      level: 0,
    };
    kanjiArray.push(newKanji);
  });
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
    fetchReviews(message, kanjiArray);
  }
  if (message.content === "~learn") {
    learn(message, kanjiArray);
  }
  if (message.content === "~new") {
    newUser(message, kanjiArray);
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
        user.reviewed.forEach((e) => {
          if (currDate > e.reviewDate) {
            console.log("Review found");
            newReviews = true;
            reviewAmount++;
            user.reviews.push(e);
            user.reviewed.shift();
          }
        });
        if (newReviews === true) {
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
          client.users.fetch(user.userId)
          .then((user)=>{
            user.send(embeddedMessage);
          });
          newReviews = false;
          reviewAmount = 0;
        }
      });
    }
  });
}

function testSend(){
  client.users.fetch("95652393978433536")
          .then((user)=>{
            user.send("hello");
          });
}

setInterval(reviewChecker, 60 * 60 * 1000);
setInterval(testSend, 60 * 60);

client.login(process.env.TOKEN);
