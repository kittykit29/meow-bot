require("dotenv").config();

const {
    Client,
    GatewayIntentBits,
    AttachmentBuilder,
    EmbedBuilder
} = require("discord.js");

const {
    createCanvas,
    loadImage
} = require("@napi-rs/canvas");

const fs = require("fs");
console.log("🔥 MEOW BOT VERSION: SHIP FONT FIX 123");

const workCooldown = new Map();
const duelChallenges = new Map();
const activeDuels = new Map();
const typeChallenges = new Map();
const activeTypingGames = new Map();
const chatCooldown = new Map();
const activeGuessGames = new Map();

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
            daily: 0,
            inventory: [],
            pet: null
        };

        saveEconomy(economy);
    }

    return economy;
}

 
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
    ]
});

client.once("ready", () => {
    console.log(`${client.user.tag} is online! 😺`);
});

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    // Make all commands case-insensitive
    const command = message.content.trim().toLowerCase();


// 💬 Chat Coin Reward
const chatCooldownTime = 60 * 1000; // 1 minute
const now = Date.now();

const isCommand = command.startsWith("meow!");

if (!isCommand) {

    const lastChatReward = chatCooldown.get(message.author.id);

    // First message starts their chat timer
    if (!lastChatReward) {

        chatCooldown.set(message.author.id, now);

    }

    // Give 5 coins after 1 minute
    else if (now - lastChatReward >= chatCooldownTime) {

        const economy = createUser(message.author.id);
        const user = economy[message.author.id];

        user.coins += 5;

        saveEconomy(economy);

        chatCooldown.set(message.author.id, now);

        // Optional: uncomment if you want a reaction
        // message.react("💰");
    }
}

// 🐱 Meow Guess the Word
if (command === "meow!guess") {

    // Don't allow two games in the same channel
    if (activeGuessGames.has(message.channel.id)) {
        return message.reply(
            "😺 There's already a Guess the Word game happening here!\nGuess the current word first! 🐾"
        );
    }

    const words = [
        {
            word: "cat",
            clues: [
                " I have four legs.",
                " I love to purr.",
                " I might enjoy chasing fish."
            ]
        },
        {
            word: "pizza",
            clues: [
                " I am usually round.",
                " I often have cheese.",
                " I am usually cooked in an oven."
            ]
        },
        {
            word: "banana",
            clues: [
                "I am a fruit.",
                " I am usually yellow.",
                " Monkeys are famous for liking me."
            ]
        },
        {
            word: "ocean",
            clues: [
                " I contain lots of water.",
                " Many fish live inside me.",
                " Ships can travel across me."
            ]
        },
        {
            word: "pencil",
            clues: [
                " You can use me to write.",
                " Students often use me.",
                " I can be erased."
            ]
        },
        {
            word: "cookie",
            clues: [
                " I am usually sweet.",
                " I can contain chocolate chips.",
                " I go well with milk."
            ]
        },
        {
            word: "rainbow",
            clues: [
                " I can appear after rain.",
                " You need sunlight for me to appear.",
                " I have many colors."
            ]
        },
        {
            word: "guitar",
            clues: [
                " I am a musical instrument.",
                " I have strings.",
                " You can play music with me."
            ]
        },
        {
            word: "castle",
            clues: [
                "Kings and queens might live in me.",
                "I can have towers.",
                "You might find me in fairy tales."
            ]
        },
        {
            word: "snow",
            clues: [
                " I am very cold.",
                " You can make a snowman from me.",
                " I am usually white."
            ]
        }
    ];

    const selected =
        words[Math.floor(Math.random() * words.length)];

    const game = {
        word: selected.word,
        clues: selected.clues
    };

    activeGuessGames.set(message.channel.id, game);

    const gameMessage = await message.channel.send({
        embeds: [
            {
                title: "🐱 Meow Guess the Word!",
                description:
                    `🔤 The word has **${game.word.length} letters**!\n\n` +
                    `💡 **Clue 1:** ${game.clues[0]}\n\n` +
                    `⏳ You have **30 seconds** to guess!\n\n` +
                    `💰 Winner gets **+50 coins!**\n\n` +
                    `🐾 Just type your guess in the chat!`,
                color: 0xff69b4,
                footer: {
                    text: "Meow Bot • Guess the word!"
                }
            }
        ]
    });

    // Give the second clue after 10 seconds
    const clue2Timer = setTimeout(() => {

        if (!activeGuessGames.has(message.channel.id)) return;

        gameMessage.edit({
            embeds: [
                {
                    title: "🐱 Meow Guess the Word!",
                    description:
                        `🔤 The word has **${game.word.length} letters**!\n\n` +
                        `💡 **Clue 1:** ${game.clues[0]}\n\n` +
                        `💡 **Clue 2:** ${game.clues[1]}\n\n` +
                        `⏳ Hurry! **20 seconds left!**\n\n` +
                        `💰 Winner gets **+50 coins!**`,
                    color: 0xff69b4,
                    footer: {
                        text: "Meow Bot • Guess the word!"
                    }
                }
            ]
        });

    }, 10000);

    // Give the final clue after 20 seconds
    const clue3Timer = setTimeout(() => {

        if (!activeGuessGames.has(message.channel.id)) return;

        gameMessage.edit({
            embeds: [
                {
                    title: "🐱 Meow Guess the Word!",
                    description:
                        `🔤 The word has **${game.word.length} letters**!\n\n` +
                        `💡 **Clue 1:** ${game.clues[0]}\n\n` +
                        `💡 **Clue 2:** ${game.clues[1]}\n\n` +
                        `💡 **FINAL CLUE:** ${game.clues[2]}\n\n` +
                        `🚨 **10 seconds left!**\n\n` +
                        `💰 Winner gets **+50 coins!**`,
                    color: 0xff69b4,
                    footer: {
                        text: "Meow Bot • FINAL CLUE!"
                    }
                }
            ]
        });

    }, 20000);

    // Listen for guesses
    const guessCollector =
        message.channel.createMessageCollector({
            filter: msg => !msg.author.bot,
            time: 30000
        });

    guessCollector.on("collect", msg => {

        const guess = msg.content.trim().toLowerCase();

        if (guess !== game.word) {
            return;
        }

        // Correct answer!
        guessCollector.stop("winner");

        clearTimeout(clue2Timer);
        clearTimeout(clue3Timer);

        activeGuessGames.delete(message.channel.id);

        const economy = createUser(msg.author.id);
        const user = economy[msg.author.id];

        user.coins += 50;

        saveEconomy(economy);

        message.channel.send({
            embeds: [
                {
                    title: "🎉 CORRECT!",
                    description:
                        `🏆 ${msg.author} guessed the word!\n\n` +
                        `🐾 The word was **${game.word.toUpperCase()}**!\n\n` +
                        `💰 Reward: **+50 coins!**\n\n` +
                        `😺 Meow Bot is impressed!`,
                    color: 0xff69b4
                }
            ]
        });
    });

    guessCollector.on("end", (collected, reason) => {

        clearTimeout(clue2Timer);
        clearTimeout(clue3Timer);

        activeGuessGames.delete(message.channel.id);

        if (reason === "winner") return;

        message.channel.send({
            embeds: [
                {
                    title: "⏰ TIME'S UP!",
                    description:
                        `😿 Nobody guessed the word!\n\n` +
                        `🐾 The word was **${game.word.toUpperCase()}**!\n\n` +
                        `😺 Better luck next time!`,
                    color: 0xff69b4
                }
            ]
        });
    });
}

// ⭐ Rate Command
if (command.startsWith("meow!rate")) {

    const target = message.mentions.users.first();

    if (!target) {
        return message.reply(
            "⭐ Mention someone to rate!\nExample: `meow!rate @kitty`"
        );
    }

    // 👑 My DISCORD USER ID HERE
    const ownerId = "1403093633338441809";

    let rating;
    let ratingMessage;

    // 👑 Special 100/100 rating for the owner
    if (target.id === ownerId) {

        rating = 100;
        ratingMessage = "👑 The rating system has decided. Absolutely purr-fect!";

    } else {

        rating = Math.floor(Math.random() * 101);

        if (rating === 100) {
            ratingMessage = "😳 HOW ARE YOU THIS PERFECT?!";
        }
        else if (rating >= 80) {
            ratingMessage = "😺 That's pretty pawsome!";
        }
        else if (rating >= 60) {
            ratingMessage = "🐾 Not bad at all!";
        }
        else if (rating >= 40) {
            ratingMessage = "😹 Meow Bot has seen better...";
        }
        else {
            ratingMessage = "💀 The cats are disappointed.";
        }
    }

    return message.channel.send({
        embeds: [
            {
                title: "⭐ Meow Rating",
                description:
                    `🐱 **${target.username}**\n\n` +
                    `⭐ Rating: **${rating}/100**\n\n` +
                    ratingMessage,
                color: 0xff69b4
            }
        ]
    });
}

// Shope items
const shopItems = {

    food: {
        fish: {
            name: "🐟 Small Fish",
            price: 100
        },
        sushi: {
            name: "🍣 Sushi Roll",
            price: 250
        },
        milk: {
            name: "🥛 Milk Bowl",
            price: 300
        },
        goldfish: {
            name: "🐠 Golden Fish",
            price: 600
        }
    },


    toys: {
        yarn: {
            name: "🧶 Yarn Ball",
            price: 100
        },
        feather: {
            name: "🪶 Feather Toy",
            price: 250
        },
        mouse: {
            name: "🐭 Toy Mouse",
            price: 400
        },
        collar: {
            name: "🎀 Fancy Collar",
            price: 800
        }
    },


    house: {
        bed: {
            name: "🛏️ Cozy Bed",
            price: 1000
        },
        house: {
            name: "🏡 Cat House",
            price: 4000
        },
        castle: {
            name: "👑 Royal Cat Castle",
            price: 9000
        }
    },


    special: {
        luckypaw: {
            name: "🍀 Lucky Paw",
            price: 20000
        },
        diamondfish: {
            name: "💎 Diamond Fish",
            price: 30000
        },
        crown: {
            name: "👑 Cat Crown",
            price: 50000
        }
    }

};
// 💗 MEOW BOT SHIP

if (command.startsWith("meow!ship")) {

    const users = [...message.mentions.users.values()];

    let user1;
    let user2;

    // TWO PEOPLE MENTIONED
    if (users.length >= 2) {
        user1 = users[0];
        user2 = users[1];
    }

    // ONE PERSON MENTIONED
    else if (users.length === 1) {
        user1 = users[0];
        user2 = message.author;
    }

    // NO ONE MENTIONED
    else {
        user1 = message.author;

        const members = message.guild.members.cache.filter(
            member =>
                !member.user.bot &&
                member.id !== message.author.id
        );

        if (members.size === 0) {
            return message.reply(
                "😭 I need at least one other person to ship you with!"
            );
        }

        user2 = members.random().user;
    }

    // RANDOM PERCENTAGE
    const percentage = Math.floor(Math.random() * 101);

    let shipMessage;

    if (percentage >= 90) {
        shipMessage = "PERFECT MATCH!";
    } else if (percentage >= 75) {
        shipMessage = "THEY'RE SO CUTE TOGETHER!";
    } else if (percentage >= 60) {
        shipMessage = "THERE'S DEFINITELY SOMETHING THERE!";
    } else if (percentage >= 40) {
        shipMessage = "MAYBE... MAYBE NOT...";
    } else if (percentage >= 20) {
        shipMessage = "THIS MIGHT BE A LITTLE COMPLICATED...";
    } else {
        shipMessage = "BRO, ABSOLUTELY NOT.";
    }

    try {

        // 🎨 CANVAS
        const canvas = createCanvas(1000, 600);
        const ctx = canvas.getContext("2d");

        // COLORS
        const BABY_PINK = "#F8C8DC";
        const LIGHT_PINK = "#FFE8F1";
        const DARK_PINK = "#D94F83";
        const BLACK = "#171717";
        const WHITE = "#FFFFFF";

        // 🌸 BACKGROUND
        const gradient = ctx.createLinearGradient(
            0,
            0,
            1000,
            600
        );

        gradient.addColorStop(0, LIGHT_PINK);
        gradient.addColorStop(0.5, BABY_PINK);
        gradient.addColorStop(1, "#F5B6D0");

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1000, 600);

        // 🖤 BORDERS
        ctx.strokeStyle = BLACK;
        ctx.lineWidth = 7;
        ctx.strokeRect(15, 15, 970, 570);

        ctx.strokeStyle = WHITE;
        ctx.lineWidth = 3;
        ctx.strokeRect(28, 28, 944, 544);

        // 💗 DECORATIONS
        ctx.textAlign = "center";

        ctx.fillStyle = DARK_PINK;
        ctx.font = "bold 32px sans-serif";

        ctx.fillText("♥", 75, 90);
        ctx.fillText("♥", 925, 90);
        ctx.fillText("♡", 90, 410);
        ctx.fillText("♡", 910, 410);

        // 🖤 TITLE
        ctx.fillStyle = BLACK;
        ctx.font = "bold 50px sans-serif";
        ctx.fillText("Meow Bot", 500, 70);

        ctx.strokeStyle = DARK_PINK;
        ctx.lineWidth = 5;

        ctx.beginPath();
        ctx.moveTo(390, 82);
        ctx.lineTo(610, 82);
        ctx.stroke();

        ctx.fillStyle = BLACK;
        ctx.font = "23px sans-serif";
        ctx.fillText("Two souls ~ One purr", 500, 110);

        // 🐱 AVATARS
        const avatar1Url = user1.displayAvatarURL({
            extension: "png",
            size: 256
        });

        const avatar2Url = user2.displayAvatarURL({
            extension: "png",
            size: 256
        });

        const [avatar1, avatar2] = await Promise.all([
            loadImage(avatar1Url),
            loadImage(avatar2Url)
        ]);

        // 🖼️ DRAW AVATAR
        function drawAvatar(image, x, y) {

            ctx.save();

            ctx.beginPath();
            ctx.arc(x, y, 103, 0, Math.PI * 2);
            ctx.fillStyle = BLACK;
            ctx.fill();

            ctx.beginPath();
            ctx.arc(x, y, 96, 0, Math.PI * 2);
            ctx.fillStyle = WHITE;
            ctx.fill();

            ctx.beginPath();
            ctx.arc(x, y, 89, 0, Math.PI * 2);
            ctx.clip();

            ctx.drawImage(
                image,
                x - 89,
                y - 89,
                178,
                178
            );

            ctx.restore();
        }

        drawAvatar(avatar1, 245, 235);
        drawAvatar(avatar2, 755, 235);

        // 💗 HEART
        ctx.fillStyle = DARK_PINK;
        ctx.font = "bold 90px sans-serif";
        ctx.fillText("♥", 500, 270);

        // 🖤 USERNAMES
        ctx.fillStyle = BLACK;
        ctx.font = "bold 25px sans-serif";

        ctx.fillText(user1.username, 245, 355);
        ctx.fillText(user2.username, 755, 355);

        // 💗 PERCENTAGE
        ctx.fillStyle = BLACK;
        ctx.font = "bold 70px sans-serif";

        ctx.fillText(
            percentage + "%",
            500,
            440
        );

        // 🎀 MESSAGE BOX
        ctx.fillStyle = DARK_PINK;
        ctx.fillRect(250, 465, 500, 70);

        ctx.fillStyle = WHITE;
        ctx.font = "bold 20px sans-serif";

        ctx.fillText(
            shipMessage,
            500,
            510
        );

        // 📸 CREATE IMAGE
        const buffer = canvas.toBuffer("image/png");

        const attachment = new AttachmentBuilder(
            buffer,
            {
                name: "meow-ship.png"
            }
        );

        // 💬 SEND
        return message.reply({
            content:
                `💗 **Meow Love Calculator** 💗\n` +
                `💕 **${user1.username} × ${user2.username}**\n\n` +
                `💖 **Compatibility: ${percentage}%**\n` +
                `${shipMessage}`,
            files: [attachment]
        });

    } catch (error) {

        console.error("Ship command error:", error);

        return message.reply(
            "😿 Something went wrong while creating the ship image!"
        );
    }

}


    // Test command
    if (command === "meow") {
        message.reply("Meow! 😺");
    }

// Help Command
if (command === "meow!help") {

    console.log("HELP COMMAND USED");

    const helpEmbed = {
        color: 0xff69b4,
        title: "😺 Meow Bot Help Menu",
        description: "Here are all my commands! 🐾",

        fields: [

            {
                name: "💖 Interaction Commands (1)",
                value:
`
\`meow!hug @user\` 🤗 - Hug someone
\`meow!kiss @user\` 💋 - Kiss someone
\`meow!pat @user\` 🐾 - Pat someone
\`meow!cuddle @user\` 🧸 - Cuddle someone
`
            },

            {
                name: "💥 Interaction Commands (2)",
                value:
`
\`meow!slap @user\` 💥 - Slap someone
\`meow!bonk @user\` 🔨 - Bonk someone
\`meow!bite @user\` 🦷 - Bite someone
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
\`meow!shop\` 🛒 - Browse the shop
\`meow!inventory\` 🎒 - View your items
`
            },
    
            
            {
                name: "😺 Fun Commands",
                value:
`
\`meow\` 🐱 - Say hello to the bot
\`meow!joke\` 😂 - Get a random cat joke
\`meow!type\`⌨️ - Who types fast
\`meow!guess\`🐾 - Guess the word
\`meow!rate\`⭐ - Rate a user

`
            },

            {
                name: "💞 Social Commands",
                value:
`
\`meow!ship @user1 @user2\` 💖 - Check compatibility
`
            }

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

// Shop Command
if (command === "meow!shop") {

    const shopEmbed = {
        color: 0xff69b4,
        title: "🛒 Meow Shop",
        description: "Buy cute items for your future pets! 🐾",

        fields: [

            {
                name: "🐟 Food Shop",
                value:
                Object.values(shopItems.food)
                .map(item => `${item.name} — 💰 ${item.price} coins`)
                .join("\n")
            },

            {
                name: "🧶 Toy Shop",
                value:
                Object.values(shopItems.toys)
                .map(item => `${item.name} — 💰 ${item.price} coins`)
                .join("\n")
            },

            {
                name: "🏠 House Shop",
                value:
                Object.values(shopItems.house)
                .map(item => `${item.name} — 💰 ${item.price} coins`)
                .join("\n")
            },

            {
                name: "✨ Special Shop",
                value:
                Object.values(shopItems.special)
                .map(item => `${item.name} — 💰 ${item.price} coins`)
                .join("\n")
            }

        ],

        footer: {
            text: "Use meow!buy <item> to purchase 🐱"
        }
    };


    message.channel.send({
        embeds: [shopEmbed]
    });

}


// Balance
if (command === "meow!bal") {

    const economy = getEconomy();
    const user = economy[message.author.id];

    if (!user) {
        return message.reply("😺 You don't have an account yet! Try `meow!work` first.");
    }

    message.reply(
        `💰 ${message.author.username}'s balance: **${user.coins} coins**`
    );

}


// Daily
if (command === "meow!daily") {

    const economy = createUser(message.author.id);
    const user = economy[message.author.id];

    const cooldownTime = 24 * 60 * 60 * 1000; // 24 hours
    const now = Date.now();

    if (user.daily && now - user.daily < cooldownTime) {

        const remaining = cooldownTime - (now - user.daily);

        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor(
            (remaining % (1000 * 60 * 60)) / (1000 * 60)
        );

        return message.reply(
            `😿 You already claimed your daily reward!\n⏳ Come back in **${hours}h ${minutes}m**`
        );
    }

    const amount = Math.floor(Math.random() * 500) + 100;

    user.coins += amount;

    // Save claim time
    user.daily = now;

    saveEconomy(economy);

    message.reply(
        `🎁 You claimed your daily reward!\nYou got **${amount} coins** 💰`
    );

}

// Work cooldown (2 minutes)

if (command === "meow!work") {

    const cooldownTime = 2 * 60 * 1000;
    const now = Date.now();

    const userCooldown = workCooldown.get(message.author.id);

    if (userCooldown && now - userCooldown < cooldownTime) {
        const remaining = cooldownTime - (now - userCooldown);
        const seconds = Math.ceil(remaining / 1000);

        return message.reply(
            `😿 Olelele can't u wait for 2 mins? try try...\n⏳ Come back in **${seconds} seconds**!`
        );
    }

    // Start cooldown
    workCooldown.set(message.author.id, now);


    // Your original work code
    const economy = createUser(message.author.id);
    const user = economy[message.author.id];

    const jobs = [
        "🐱 Cat cafe worker",
        "🐟 Fish collector",
        "😺 Professional cat petter",
        "🧶 Yarn hunter"
    ];

    const job = jobs[Math.floor(Math.random() * jobs.length)];
    const amount = Math.floor(Math.random() * 300) + 50;

    user.coins += amount;

    saveEconomy(economy);

    message.reply(
        `${job}!\nYou earned **${amount} coins** 💰`
    );
}


// Beg
if (command === "meow!beg") {

    const economy = createUser(message.author.id);
    const user = economy[message.author.id];

    const amount = Math.floor(Math.random() * 100);

    user.coins += amount;

    saveEconomy(economy);

    message.reply(
        `🥺 Someone gave you **${amount} coins**`
    );

}
// Buy Command
if (command.startsWith("meow!buy")) {

    const args = message.content.slice("meow!buy".length).trim();

    if (!args) {
        return message.reply(
            "😺 Please tell me what you want to buy!\nExample: `meow!buy Golden Fish`"
        );
    }

    const itemName = args.toLowerCase().trim();

    const shopItems = [
        // Food
        { name: "Small Fish", price: 100 },
        { name: "Sushi Roll", price: 250 },
        { name: "Milk Bowl", price: 300 },
        { name: "Golden Fish", price: 600 },

        // Toys
        { name: "Yarn Ball", price: 100 },
        { name: "Feather Toy", price: 250 },
        { name: "Toy Mouse", price: 400 },
        { name: "Fancy Collar", price: 800 },

        // House
        { name: "Cozy Bed", price: 1000 },
        { name: "Cat House", price: 4000 },
        { name: "Royal Cat Castle", price: 9000 },

        // Special
        { name: "Lucky Paw", price: 20000 },
        { name: "Diamond Fish", price: 30000 },
        { name: "Cat Crown", price: 50000 }
    ];

    // Find item
    const item = shopItems.find(
        i => i.name.toLowerCase() === itemName
    );

    if (!item) {
        return message.reply(
            "😿 That item doesn't exist!\nUse `meow!shop` to see available items."
        );
    }

    const economy = createUser(message.author.id);
const user = economy[message.author.id];

    // Check coins
    if (user.coins < item.price) {
        return message.reply(
            `😿 You don't have enough coins!\n\n` +
            `💰 Price: **${item.price} coins**\n` +
            `🪙 Your Balance: **${user.coins} coins**`
        );
    }

    // Make sure inventory exists
    if (!user.inventory) {
        user.inventory = [];
    }

    // Take coins
    user.coins -= item.price;

    // Add item
    user.inventory.push(item.name);

    // Save
    saveEconomy(economy);

    message.reply(
        `🛍️ **Purchase Successful!**\n\n` +
        `🐾 You bought **${item.name}**!\n` +
        `💸 Spent: **${item.price} coins**\n` +
        `💰 New Balance: **${user.coins} coins**`
    );
}


// Joke Command 😂
if (command === "meow!joke") {

    const jokes = [
        "😹 Why did the bicycle fall over?\nBecause it was two-tired.",
        "🐱Why can't your nose be 12 inches long?\nBecause then it would be a foot.",
        "😹 What's orange and sounds like a parrot?\nA carrot.",
        "🐾 Why don't eggs tell jokes?\nThey'd crack each other up!",
        "😺 Why did the tomato blush?\nBecause it saw the salad dressing.",
        "🐱 What do you call a cat that tells jokes?\nA comedi-cat!",
        "😹 Why did the kitten join the internet?\nIt wanted to find the purr-fect website!",
        "🐾What do you call a fish with no eyes?\nA fsh.",
        "🐾Why did the melon jump into the lake?\nIt wanted to be a watermelon."
    ];

    const joke = jokes[Math.floor(Math.random() * jokes.length)];

    message.reply(joke);
}

// Inventory Command
if (command === "meow!inventory") {

    const economy = createUser(message.author.id);
    const user = economy[message.author.id];

    if (user.inventory.length === 0) {
        return message.reply(
            "🎒 Your inventory is empty!\nUse `meow!shop` to buy cute items 🐾"
        );
    }

    const items = user.inventory
        .map((item, index) => `${index + 1}. ${item}`)
        .join("\n");


    message.channel.send({
        embeds: [
            {
                title: `🎒 ${message.author.username}'s Inventory`,
                description: items,
                color: 0xff69b4
            }
        ]
    });

}

// Profile
if (command === "meow!profile") {

    const economy = createUser(message.author.id);
    const user = economy[message.author.id];

    saveEconomy(economy);

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

// Pay
if (command.startsWith("meow!pay")) {

    const args = message.content.split(" ");

    const target = message.mentions.users.first();

    if (!target) {
        return message.reply(
            "😿 Mention someone to pay!\nExample: `meow!pay @user 100`"
        );
    }

    if (target.id === message.author.id) {
        return message.reply("🙀 You can't pay yourself!");
    }

    const amount = parseInt(args[2]);

    if (isNaN(amount) || amount <= 0) {
        return message.reply("💰 Enter a valid amount!");
    }

    const economy = createUser(message.author.id);
    createUser(target.id);

    const sender = economy[message.author.id];

    // Reload economy to make sure both users exist
    const updatedEconomy = getEconomy();

    const receiver = updatedEconomy[target.id];
    const senderUpdated = updatedEconomy[message.author.id];

    if (senderUpdated.coins < amount) {
        return message.reply("😿 You don't have enough coins!");
    }

    senderUpdated.coins -= amount;
    receiver.coins += amount;

    saveEconomy(updatedEconomy);

    message.reply(
        `💸 You sent **${amount} coins** to ${target}!`
    );
}

// Flip Command
if (command.startsWith("meow!flip")) {

   const economy = createUser(message.author.id);
const user = economy[message.author.id];

    const args = message.content.split(" ");
    const bet = Number(args[1]);

    if (!bet) {
        return message.reply("🎰 **Meow Coin Flip**\n\nUsage: `meow!flip <amount>`\nExample: `meow!flip 250`");
    }

    if (bet <= 0) {
        return message.reply("😿 You need to bet more than **0 coins**!");
    }

    if (user.coins < bet) {
        return message.reply(`😿 You don't have enough coins!\n💰 Your Balance: **${user.coins} coins**`);
    }


    const flipMessage = await message.reply(
        "🎰 **Meow Coin Flip**\n\n🪙 Flipping the coin..."
    );


    setTimeout(() => {

        const result = Math.random() < 0.5 ? "Heads" : "Tails";
        const win = Math.random() < 0.5;


        if (win) {

            user.coins += bet;

            saveEconomy(economy);

            flipMessage.edit(
                `🎰 **Meow Coin Flip**\n\n` +
                `🪙 The coin landed on **${result}!**\n\n` +
                `🎉 You won **${bet} coins**!\n` +
                `💰 New Balance: **${user.coins} coins**`
            );

        } else {

            user.coins -= bet;

            saveEconomy(economy);

            flipMessage.edit(
                `🎰 **Meow Coin Flip**\n\n` +
                `🪙 The coin landed on **${result}!**\n\n` +
                `😿 You lost **${bet} coins**!\n` +
                `💰 New Balance: **${user.coins} coins**`
            );

        }


    }, 2000);

}

// ⌨️ Meow Typing Challenge
if (command.startsWith("meow!type")) {

    const target = message.mentions.users.first();

    if (!target) {
        return message.reply(
            "⌨️ Mention someone to challenge!\nExample: `meow!type @user`"
        );
    }

    if (target.id === message.author.id) {
        return message.reply("😹 You can't challenge yourself!");
    }

    if (target.bot) {
        return message.reply("😿 You can't challenge a bot!");
    }

    if (
        typeChallenges.has(target.id) ||
        activeTypingGames.has(target.id) ||
        activeTypingGames.has(message.author.id)
    ) {
        return message.reply(
            "⌨️ One of you is already in a typing challenge!"
        );
    }

    typeChallenges.set(target.id, message.author.id);

    const acceptButton = new ButtonBuilder()
        .setCustomId("type_accept")
        .setLabel("Accept")
        .setEmoji("🟢")
        .setStyle(ButtonStyle.Success);

    const declineButton = new ButtonBuilder()
        .setCustomId("type_decline")
        .setLabel("Decline")
        .setEmoji("🔴")
        .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder()
        .addComponents(acceptButton, declineButton);

    const challengeMessage = await message.reply({
        content:
            `⌨️ **MEOW TYPING CHALLENGE!**\n\n` +
            `🐱 ${message.author} challenged ${target}!\n\n` +
            `${target}, do you accept?\n\n` +
            `⏳ You have **30 seconds**!`,
        components: [row]
    });

    const collector = challengeMessage.createMessageComponentCollector({
        time: 30000
    });

    collector.on("collect", async interaction => {

        // Only the challenged person can answer
        if (interaction.user.id !== target.id) {
            return interaction.reply({
                content: "😹 This challenge isn't for you!",
                ephemeral: true
            });
        }

        typeChallenges.delete(target.id);

        if (interaction.customId === "type_decline") {

            collector.stop("declined");

            return interaction.update({
                content:
                    `❌ **Challenge declined!**\n\n` +
                    `${target} declined ${message.author}'s typing challenge.`,
                components: []
            });
        }

        // =========================
        // ACCEPTED
        // =========================

        collector.stop("accepted");

        activeTypingGames.set(message.author.id, true);
        activeTypingGames.set(target.id, true);

        const sentences = [
            "The fluffy cat jumped over the sleepy dog.",
            "Three tiny kittens chased a golden fish.",
            "My silly cat stole a piece of cheese.",
            "The sleepy kitten was hiding under the table.",
            "A curious cat found a mysterious box.",
            "The orange cat loves playing with yarn.",
            "Seven cats were sleeping in the sunny garden.",
            "The little kitten climbed onto the cozy bed.",
            "A mischievous cat knocked over the milk bowl."
        ];

        const sentence =
            sentences[Math.floor(Math.random() * sentences.length)];

        await interaction.update({
            content:
                `⌨️ **TYPING RACE!**\n\n` +
                `🐱 ${message.author} VS ${target}\n\n` +
                `Get ready...\n\n` +
                `3️⃣\n` +
                `2️⃣\n` +
                `1️⃣\n\n` +
                `⚡ **GO!**\n\n` +
                `Type this EXACT sentence:\n\n` +
                `> ${sentence}\n\n` +
                `🏆 First correct answer wins!\n` +
                `💰 **+150 coins**`,
            components: []
        });

        const startTime = Date.now();

        const messageFilter = msg => {
            return (
                !msg.author.bot &&
                [message.author.id, target.id].includes(msg.author.id)
            );
        };

        const typingCollector =
            message.channel.createMessageCollector({
                filter: messageFilter,
                time: 30000
            });

        typingCollector.on("collect", async msg => {

            if (msg.content.trim() !== sentence) {
                return;
            }

            const winner = msg.author;
            const time = ((Date.now() - startTime) / 1000).toFixed(2);

            typingCollector.stop("winner");

            const economy = getEconomy();

            if (!economy[winner.id]) {
                economy[winner.id] = {
                    coins: 0,
                    daily: 0,
                    inventory: [],
                    pet: null
                };
            }

            economy[winner.id].coins += 150;

            saveEconomy(economy);

            activeTypingGames.delete(message.author.id);
            activeTypingGames.delete(target.id);

            await message.channel.send(
                `🏆 **TYPING RACE OVER!**\n\n` +
                `🥇 ${winner} **wins!**\n\n` +
                `⚡ Time: **${time} seconds**\n` +
                `💰 Reward: **+150 coins!**\n\n` +
                `😹 Everyone else was too slow!`
            );
        });

        typingCollector.on("end", async (collected, reason) => {

            activeTypingGames.delete(message.author.id);
            activeTypingGames.delete(target.id);

            if (reason === "winner") return;

            await message.channel.send(
                `⏰ **TIME'S UP!**\n\n` +
                `Nobody typed the sentence correctly!\n\n` +
                `🐱 Better luck next time!`
            );
        });
    });

    collector.on("end", async (collected, reason) => {

        if (reason === "accepted" || reason === "declined") return;

        if (typeChallenges.has(target.id)) {

            typeChallenges.delete(target.id);

            await challengeMessage.edit({
                content:
                    `⏰ **Challenge expired!**\n\n` +
                    `${target} didn't respond within 30 seconds.`,
                components: []
            });
        }
    });
}


// Leaderboard
if (command === "meow!leaderboard") {

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
                "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExdDZ5NzNyazFwYm5jNHl3MW01cjZtZGx5aDRjbHVka3I3b3pzcmh3NSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/QweWddrIQxlfi/giphy.gif",
                "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExMzJyYnRoYmp0YzI4bW90dnQ1ZGhlaXRuNGV5em0zcGV5a2MyOHd1NSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/qfQgXxBz1nvWEbOxyb/giphy.gif",
                "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExNnd6ZXowM2ZqZHo1MGFvYW9qdnZ3aXl0ZjFheG9vbXRhOXI4bmE3NyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Lx8z9ra4yYgtEDb7gq/giphy.gif"
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
                "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExdXdmZjE1NTQzMHloNnZsYjdocjFubmhveWl1NHp4eTNnNTgzd2wwaSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Y9bboRSDSw0CezsCji/giphy.gif",
                "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExdjM0OTZ0NmI2aW80ZmxwY3lyaXM1d3d5dWpxMWJxdHJtemU5ZWY5ZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/c7G6drkobIQXRJwX5v/giphy.gif"

            ]
        },

        slap: {
            text: "slaps",
            gifs: [
                "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExZGgwZXVuYzJvZzlrNWxvcnphM2VqbTZlMnhwc2V0ejdpY2NkajI0ZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/xUNd9HZq1itMkiK652/giphy.gif",
                "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExNXUxNjVmcTMyYWdyb2JqY2dnNHl0c3hjd2FtZGV4MXEzN3hyd2pjcSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/xUO4t2gkWBxDi/giphy.gif",
                "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDB4N2RybjZmMXA3YjhlN3NpcTZzY3p4YmtpN21tcTl1cTFyMDFrYSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/WvzGVdiVRNq8qtWPKu/giphy.gif",
                "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExMWl4dGV1NGRhb2RqdDFqOXRsYmNlb3lsdnJ3cGVoM2tyZWdydzZrNSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/WvzGVdiVRNq8qtWPKu/giphy.gif",
                "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExMDRqb2oxajczYmE5eXhrZHB3d2RpaHhpOWx5cDM3NHNrd2h3dXZuZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/a7HKjDb3UJ0kM/giphy.gif"
            ]
        },
       
        bonk: {
            text: "bonks",
            gifs: [
                "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExdGVqamp2b3I5bmM1M3AxaTd5YmQ1OGs2bTF5bjI4dnM2dmxmeTk3OCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/rfHc3U73N07tKPgCvJ/giphy.gif",
                "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExcmRyYmF5OHR6MTB1N29kcnJpbG5jcTg4Y29icnJ6ZzQ5bmszeTF0OSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/rtCxlwzJhP3tsmaIAS/giphy.gif",
                "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExMmJ1NnM5NXhobzB0am5zNG54aWVpdnVkd3FwYmo2OG4yeno5dzFkOCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/xjHj7TPdbCN8I/giphy.gif",
                "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExNWt1djllNm1vMW5ja3I0Y2QxaWE3Ym5xanRncXBnbGJyazZka205eCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/7xV8FFg0ztGsseOTEd/giphy.gif"
            ]
        },

        bite: {
        text: "bites",
        gifs: [
            "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExc3FwNGdzNjZ5azRyeHkweTZrajA0endjN3hhMnpyNWpyZ24wa3ZnMSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/lrMUMn9lnpaJDsvP0u/giphy.gif",
            "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExcjZkNDViaHdwbTNiN3hwZmkxYW9vM2FoNWRtd21pemVvY2JiaHRyaSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/mEMRAZYygRyk8/giphy.gif",
            "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExaGFzYjRybTlraGR0Ymx0aHJ3Nm1tdHJpMHVyYXBhZnNicWh4dnB2NiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/b6mpA0JrIUsFSdhG9q/giphy.gif",
            "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExb2Z4M2ttc2pxOWxocTV2dGI1YzluZzR2Y2c4dnphbzVxMG5jMjZ3aiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/U1wMHRq7bnuInYaVlB/giphy.gif",
            "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExd3FzMXFjM2M4ZXBsdHczd29mM2dubmo0bHN3M2oweWRuc3VoNTVuOCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/W5tiV5EyW4TL4xToti/giphy.gif"
        ]
       }
    };


for (const action in interactions) {

    if (
        command === `meow!${action}` ||
        command.startsWith(`meow!${action} `)
    ) {

        const user = message.mentions.users.first();

        if (!user) {
            return message.reply(
                `🐱 Ole Ole! You have to mention someone!\nLike: \`meow!${action} @user\``
            );
        }

        const data = interactions[action];

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