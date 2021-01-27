const Discord = require("discord.js");
const User = require("../models/user.model");

const func = (message) => {const newUser = new User({
    userId: message.author.id,
    level: 1,
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
}

module.exports = func;