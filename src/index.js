require("dotenv/config");
const { Client, GatewayIntentBits } = require("discord.js");
const { CommandKit } = require("commandkit");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

new CommandKit({
  client,
  commandsPath: `${__dirname}/commands`,
});

client.on("ready", (client) => {
  console.log(`${client.user.tag} is ready!`);
});

client.login(process.env.DISCORD_TOKEN);
