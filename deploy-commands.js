require("dotenv").config();

const { REST, Routes, SlashCommandBuilder } = require("discord.js");

const commands = [

  new SlashCommandBuilder()
    .setName("play")
    .setDescription("音楽再生")
    .addStringOption(option =>
      option.setName("url")
        .setDescription("YouTube / Spotify")
        .setRequired(true)),

  new SlashCommandBuilder()
    .setName("skip")
    .setDescription("スキップ"),

  new SlashCommandBuilder()
    .setName("stop")
    .setDescription("停止"),

  new SlashCommandBuilder()
    .setName("queue")
    .setDescription("再生リスト")

].map(command => command.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {

  await rest.put(
    Routes.applicationCommands(process.env.CLIENT_ID),
    { body: commands }
  );

  console.log("Slash commands registered");

})();