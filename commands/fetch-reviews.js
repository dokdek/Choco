const Discord = require("discord.js");
const User = require("../models/user.model");
const newUser = require("../helpers/new-user");
const reviewQuestions = require("../helpers/review-questions");

const fetchReviews = (message, kanjiArray) => {
    //finds if user exists
    User.findOne({userId: message.author.id},(err,user)=>{
        if(err){
            console.log(err);
            message.reply("I had an error processing that request.");
        }else if(user){
            if(user.reviews.length >= 5){
                //Ask review here up to 5.
                reviewQuestions(message, user, 5);
                console.log("Going into reviews1")
            }else{
                //Ask review question here up to maximum.
                reviewQuestions(message, user, user.reviews.length);
            }
        }else{
            newUser(message, kanjiArray);
        }
      })
}

module.exports = fetchReviews;