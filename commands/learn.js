const learningPrompt = require("../helpers/learning-prompt");
const User = require("../models/user.model");


const learn = (message) => {
    User.findOne({userId: message.author.id},(err,user)=>{
        if(err){
            console.log(err);
            message.reply("I had an error processing that request.");
        }else if(user){
            const learningLength = user.learning.length;
            console.log(learningLength);
            learningPrompt(user, message);
        }else{
            newUser(message);
        }
      })
};

module.exports = learn;