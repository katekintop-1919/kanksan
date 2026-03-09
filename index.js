require("dotenv").config();

const { Client, GatewayIntentBits } = require("discord.js");
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require("@discordjs/voice");
const play = require("play-dl");

play.setToken({
  spotify: {
    client_id: process.env.SPOTIFY_CLIENT_ID,
    client_secret: process.env.SPOTIFY_SECRET
  }
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ]
});

const queue = new Map();

client.once("ready", () => {
  console.log("Music Bot Ready 🎵");
});

client.on("interactionCreate", async interaction => {

  if (!interaction.isChatInputCommand()) return;

  const serverQueue = queue.get(interaction.guild.id);

  if (interaction.commandName === "play") {

    await interaction.deferReply();

    const url = interaction.options.getString("url");

    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel)
      return interaction.editReply("VCに入ってください");

    let song;

    if (play.sp_validate(url) === "track") {

      const track = await play.spotify(url);
      song = {
        title: track.name,
        url: `ytsearch:${track.name} ${track.artists[0].name}`
      };

    } else {

      song = {
        title: url,
        url: url
      };

    }

    if (!serverQueue) {

      const queueConstruct = {
        voiceChannel,
        songs: [],
        player: createAudioPlayer()
      };

      queue.set(interaction.guild.id, queueConstruct);
      queueConstruct.songs.push(song);

      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: interaction.guild.id,
        adapterCreator: interaction.guild.voiceAdapterCreator
      });

      connection.subscribe(queueConstruct.player);

      playSong(interaction.guild, queueConstruct.songs[0]);

      interaction.editReply(`再生開始 🎵 ${song.title}`);

    } else {

      serverQueue.songs.push(song);
      interaction.editReply("キューに追加しました");

    }

  }

  if (interaction.commandName === "skip") {

    if (!serverQueue)
      return interaction.reply("再生していません");

    serverQueue.player.stop();
    interaction.reply("スキップしました");

  }

  if (interaction.commandName === "stop") {

    if (!serverQueue)
      return interaction.reply("再生していません");

    serverQueue.songs = [];
    serverQueue.player.stop();

    interaction.reply("停止しました");

  }

  if (interaction.commandName === "queue") {

    if (!serverQueue)
      return interaction.reply("キューは空です");

    let text = "再生リスト:\n";

    serverQueue.songs.forEach((song, i) => {
      text += `${i + 1}. ${song.title}\n`;
    });

    interaction.reply(text);

  }

});

async function playSong(guild, song) {

  const serverQueue = queue.get(guild.id);

  if (!song) {
    queue.delete(guild.id);
    return;
  }

  const stream = await play.stream(song.url);

  const resource = createAudioResource(stream.stream, {
    inputType: stream.type
  });

  serverQueue.player.play(resource);

  serverQueue.player.once(AudioPlayerStatus.Idle, () => {

    serverQueue.songs.shift();
    playSong(guild, serverQueue.songs[0]);

  });

}

client.login(process.env.TOKEN);