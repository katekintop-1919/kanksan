require("dotenv").config();
const { REST, Routes, SlashCommandBuilder } = require("discord.js");

const commands = [
  new SlashCommandBuilder()
    .setName("play")
    .setDescription("音楽を再生します")
    .addStringOption(option =>
      option.setName("url")
        .setDescription("YouTube URL")
        .setRequired(true)),

  new SlashCommandBuilder()
    .setName("skip")
    .setDescription("曲をスキップ"),

  new SlashCommandBuilder()
    .setName("stop")
    .setDescription("音楽停止"),

  new SlashCommandBuilder()
    .setName("queue")
    .setDescription("再生リスト表示")
].map(command => command.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands },
    );

    console.log("スラッシュコマンド登録完了");
  } catch (error) {
    console.error(error);
  }
})();