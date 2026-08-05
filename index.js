require("dotenv").config();

const { Client, GatewayIntentBits } = require("discord.js");

const fs = require("fs");

const economyFile = "./database/economy.json";

function getEconomy() {
    return JSON.parse(fs.readFileSync(economyFile));
}

function saveEconomy(data) {
    fs.writeFileSync(economyFile, JSON.stringify(data, null, 2));
}

function createUser(id) {
    const economy = getEconomy();

    if (!economy[id]) {
        economy[id] = {
            coins: 0,
            daily: 0
        };

        saveEconomy(economy);
    }

    return economy[id];
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once("ready", () => {
    console.log(`${client.user.tag} is online! 😺`);
});

client.on("messageCreate", (message) => {
    if (message.author.bot) return;

    // Ship Command 💖
if (message.content.startsWith("meow!ship")) {

    const users = message.mentions.users;

    if (users.size < 2) {
        return message.reply(
            "💖 Mention two people to ship them!\nExample: `meow!ship @user1 @user2`"
        );
    }

    const userArray = [...users.values()];

    const user1 = userArray[0];
    const user2 = userArray[1];

    const percentage = Math.floor(Math.random() * 101);

    let messageText;

    if (percentage >= 90) {
        messageText = "💞 Perfect match! Soulmate vibes!";
    } 
    else if (percentage >= 70) {
        messageText = "💕 Cuteissiii match!";
    } 
    else if (percentage >= 40) {
        messageText = "💗 There might be something there awwiiee!";
    } 
    else {
        messageText = "💔Ole Ole... Maybe just friends...";
    }

    message.channel.send({
        embeds: [
            {
                title: "💖 Meow Love Calculator",
                description:
                `${user1} ❤️ ${user2}\n\n` +
                `**Compatibility:** ${percentage}%\n\n` +
                messageText,
                color: 0xff69b4
            }
        ]
    });

}

    // Test command
    if (message.content === "meow") {
        message.reply("Meow! 😺");
    }

  // Help Command
if (message.content === "meow!help") {

    console.log("HELP COMMAND USED");

    const helpEmbed = {
        color: 0xff69b4,
        title: "😺 Meow Bot Help Menu",
        description: "Here are all my commands! 🐾",

        fields: [

            {
                name: "💖 Interaction Commands",
                value:
`
\`meow!hug @user\` 🤗 - Hug someone
\`meow!kiss @user\` 💋 - Kiss someone
\`meow!pat @user\` 🐾 - Pat someone
\`meow!cuddle @user\` 🧸 - Cuddle someone
\`meow!slap @user\` 💥 - Slap someone
`
            },


            {
                name: "💰 Economy Commands",
                value:
`
\`meow!bal\` 💵 - Check your coins
\`meow!daily\` 🎁 - Claim daily coins
\`meow!work\` 💼 - Work for coins
\`meow!beg\` 🥺 - Beg for coins
\`meow!profile\` 👤 - View your profile
\`meow!leaderboard\` 🏆 - Richest users
`
            },


            {
                name: "😺 Fun Commands",
                value:
`
\`meow\` 🐱 - Say hello to the bot
`
            },
{
    name: "💞 Social Commands",
    value:
`
\`meow!ship @user1 @user2\` 💖 - Check compatibility
`
},



        ],

        footer: {
            text: "Meow Bot ❤️"
        }
    };


   return message.channel.send({
    embeds: [helpEmbed]
});

}
// Economy Commands

const economy = getEconomy();


// Balance
if (message.content === "meow!bal") {

    const user = createUser(message.author.id);

    message.reply(
        `💰 ${message.author.username}'s balance: **${user.coins} coins**`
    );

}


// Daily
if (message.content === "meow!daily") {

    const user = createUser(message.author.id);

    const amount = Math.floor(Math.random() * 500) + 100;

    user.coins += amount;

    saveEconomy(getEconomy());

    message.reply(
        `🎁 You claimed your daily reward!\nYou got **${amount} coins** 💰`
    );

}


// Work
if (message.content === "meow!work") {

    const user = createUser(message.author.id);

    const jobs = [
        "🐱 Cat cafe worker",
        "🐟 Fish collector",
        "😺 Professional cat petter",
        "🧶 Yarn hunter"
    ];

    const job = jobs[Math.floor(Math.random() * jobs.length)];

    const amount = Math.floor(Math.random() * 300) + 50;

    user.coins += amount;

    saveEconomy(getEconomy());

    message.reply(
        `${job}!\nYou earned **${amount} coins** 💰`
    );

}


// Beg
if (message.content === "meow!beg") {

    const user = createUser(message.author.id);

    const amount = Math.floor(Math.random() * 100);

    user.coins += amount;

    saveEconomy(getEconomy());

    message.reply(
        `🥺 Someone gave you **${amount} coins**`
    );

}


// Profile
if (message.content === "meow!profile") {

    const user = createUser(message.author.id);

    message.channel.send({
        embeds: [
            {
                title: `😺 ${message.author.username}'s Profile`,
                fields: [
                    {
                        name: "💰 Coins",
                        value: `${user.coins}`
                    }
                ],
                color: 0xff69b4
            }
        ]
    });

}


// Leaderboard
if (message.content === "meow!leaderboard") {

    const users = Object.entries(getEconomy());

    users.sort((a,b) => b[1].coins - a[1].coins);

    let board = "";

    users.slice(0,10).forEach((user,index)=>{

        board += `**${index+1}.** <@${user[0]}> - 💰 ${user[1].coins}\n`;

    });


    message.channel.send({
        embeds:[
            {
                title:"🏆 Meow Economy Leaderboard",
                description: board || "No users yet!",
                color:0xffd700
            }
        ]
    });

}

    // Interaction commands
    const interactions = {

        hug: {
            text: "hugs",
            gifs: [
                 "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExZGdkODEzaWI3eDJuMG82Z3BjNGZoMWh1OHg3M3hkemJmYWt4c3U1eSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/DjczAlIcyK1Co/giphy.gif",
           "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExMGQ3bWwwYnI3ZnV0ZjR0Mmpzcmluc2VoaGEzY3k4cGk1M2V3MzJqNyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/LIqFOpO9Qh0uA/giphy.gif",
           "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExcmdjMHpqeXEyeTg3ejd6aWpqMjJxcjB1bnkybGF5bnQxb2ZnZ3BicSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/49mdjsMrH7oze/giphy.gif",
           "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExbGtpdG40NmhnazQzNWV6NmRnNmtvOXluenZ4NmRxaTAwZjB2ZjAzeCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/wnsgren9NtITS/giphy.gif",
           "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExdnliODkwb3A3aDZmc2dqczUxN3FjdnM2Z3cxajZvNzQ1a3ZjMzU2bSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/svXXBgduBsJ1u/giphy.gif",
            "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExY3EzMjlzZDFwYWV3bXdhOWF1MTZ5YW9vbnh4a3V2bWZqMGNoYmRyNCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/nZG37fsx2kkFzQ85iI/giphy.gif",
            ]
        },

        kiss: {
            text: "kisses",
            gifs: [
                "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExbWk0NnVrcHA0c2ZhMmZ2ZjF2aW1lM2Vsam43MTA1ODF1aGNzdTh2YSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/bGm9FuBCGg4SY/giphy.gif",
                "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExcG9mNmRuaTZ5MG94Nmh3MGExamhtaXQ2emFrZTVuNWJudXJ6bThjaiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/zkppEMFvRX5FC/giphy.gif",
                "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExcXlsZjB1MHVtczdvZzI1MTB2NDd4MXZraXRxMzJtZGNzaWlpcTNiMiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/jR22gdcPiOLaE/giphy.gif",
                "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExamgzZ3kzMjl4OXo1aHdobXY2d3RjeG4xZTgwdWlwdnkyODVzanpsYyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/wOtkVwroA6yzK/giphy.gif",
                "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExdDZ5NzNyazFwYm5jNHl3MW01cjZtZGx5aDRjbHVka3I3b3pzcmh3NSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/QweWddrIQxlfi/giphy.gif"
            ]
        },

        pat: {
            text: "pats",
            gifs: [
                "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExY2E3MnNqOGxpdXJwNHNiNzIwNWdtd3RvM2t2eWRqMDc3MnVvOHFybCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/AomVL3N8lTxiuYtI2I/giphy.gif",
                "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExbTg3NTlzNWl3a3o4NnU5ZHJvMjc2ZGsyaG5pZXNzeHl3cG5tNmF5aCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/janUhvoTL7p0iFbP5P/giphy.gif",
                "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExaXc3a3FnenRucWw4eGZqczk3c2tqMm82b3Q0enZoNW1zbW16dXppcSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/CJpbePCrkrErMnfdAV/giphy.gif",
                "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExb2FzbHNia2V1MnprbjZ6bXFqNXRoM2QxaHByMmVraG84b3BvaHg1NiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/LVagcxBJjZBvmyPA99/giphy.gif",
                "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExcGlnZXc1OWxhNGIzeGM2dnZrMm16a3ZwczViazh2djJkZTRqajFybSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ye7OTQgwmVuVy/giphy.gif",
            ]
        },

        cuddle: {
            text: "cuddles",
            gifs: [
                "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExcnNpbHNoNTA1bXg2MWVwNXg4eTBjNzcyZm9naG5qdHR2b2doNzI0OCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/BXrwTdoho6hkQ/giphy.gif",
                "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExejFsY2ZocDdjN20yNmJqeWJpbHJwNmxvemF3OWw4MGU5eXd0NXI5dCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Y8wCpaKI9PUBO/giphy.gif",
                "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExNGE1bWtvMDBlMXlmNGcxbWtqM2psMmp5Y2htMHY4cTVxdXJ0bzI5NSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/bQATeUxCoCFr2/giphy.gif",

            ]
        },

        slap: {
            text: "slaps",
            gifs: [
                "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExZGgwZXVuYzJvZzlrNWxvcnphM2VqbTZlMnhwc2V0ejdpY2NkajI0ZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/xUNd9HZq1itMkiK652/giphy.gif",
                "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExNXUxNjVmcTMyYWdyb2JqY2dnNHl0c3hjd2FtZGV4MXEzN3hyd2pjcSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/xUO4t2gkWBxDi/giphy.gif",
                "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDB4N2RybjZmMXA3YjhlN3NpcTZzY3p4YmtpN21tcTl1cTFyMDFrYSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/WvzGVdiVRNq8qtWPKu/giphy.gif",
                "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExMWl4dGV1NGRhb2RqdDFqOXRsYmNlb3lsdnJ3cGVoM2tyZWdydzZrNSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/WvzGVdiVRNq8qtWPKu/giphy.gif"
            ]
        }

    };


   for (const command in interactions) {

    if (message.content === `meow!${command}` || message.content.startsWith(`meow!${command} `)) {

        const user = message.mentions.users.first();

        if (!user) {
            return message.reply(
                `🐱 Ole Ole! You have to mention someone!\nLike: \`meow!${command} @user\``
            );
        }

        const data = interactions[command];

        const gif = data.gifs[
            Math.floor(Math.random() * data.gifs.length)
        ];

        return message.channel.send({
            content: `💖 ${message.author} ${data.text} ${user}!`,
            embeds: [
                {
                    image: {
                        url: gif
                    },
                    color: 0xff69b4
                }
            ]
        });
    }

   }
   });


client.login(process.env.TOKEN);