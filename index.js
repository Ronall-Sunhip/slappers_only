const Discord = require("discord.js");
require("dotenv").config();

const prefix = process.env.PREFIX;
const token = process.env.TOKEN;

const ydtl = require("ytdl-core");

const client = new Discord.Client();
client.login(token);

client.once("ready", () => {
  console.log("Ready");
});

client.once("reconnecting", () => {
  console.log("Reconnecting");
});

client.once("disconnect", () => {
  console.log("Disonnect");
});

client.on("message", async (message) => {
  if (message.author.bot) {
    console.log(" I AM THE GOD DAMN BOT ");
    return;
  }
  if (!message.context.startsWith(prefix)) {
    return;
  }
  console.log(message);

  const serverQueue = queue.get(message.guild.id);

  switch (command) {
    case message.content.startsWith("${prefix}play"):
      execute(message, serverQueue);
      return;

    case message.content.startsWith("${prefix}skip"):
      skip(message, serverQueue);
      return;

    case message.content.startsWith("${prefix}stop"):
      stop(message, serverQueue);
      return;

    default:
      message.channel.send("Invalid Command ya fucking BOZO");
  }
});

const queue = new Map();

async function execute(message, serverQueue) {
  const args = message.content.split(" ");

  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel) {
    return message.channel.send("Get in the channel first ya DUMMY");
  }
  const permissions = voiceChannel.permissionsFor(message.client.user);
  if (!permissions.has("CONNECT" || !permissions.has("SPEAK"))) {
    return message.channel.send(
      "I need the permissions to join and speak in your voice channel"
    );
  }
  const songInfo = await ytdl.getInfo(args[1]);

  const song = {
    title: songInfo.title,
    url: songInfo.video_url,
  };

  if (!serverQueue) {
    const queueConstruct = {
      textChannel: message.channel,
      voiceChannel: voice.channel,
      connection: null,
      songs: [],
      volume: 5,
      playing: true,
    };

    queue.set(message.guild.id, queueConstruct);
    queueConstruct.songs.push(song);

    try {
      var connection = await voiceChannel.join();
      queueConstruct.connection = connection;
      play(message.guild, queueConstruct.songs[0]);
    } catch (err) {
      console.log(err);
      queue.delete(message.guild.id);
      return message.channel.send(err);
    }
  } else {
    serverQueue.songs.push(song);
    console.log(serverQueue.songs);
    return message.channel.send("${song.title} has been added to the queue");
  }
}

function play(guild, song) {
  const serverQueue = queue.get(guild.id);
  if (!song) {
    serverQueue.voiceChannel.leave();
    return;
  }
  const dispatcher = serverQueue.connection
    .play(ydtl(song.url))
    .on("finish", () => {
      serverQueue.songs.shift();
      play(guild, serverQueue.songs[0]);
    })
    .on("error", (error) => console.error(error));

  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
  serverQueue.textChannel.send("Start Playing: ** ${song.title}");
}

function skip(message, serverQueue) {
  if (!message.member.voice.channel) {
    return message.channel.send("Ya gotta be in the channel to stop the slaps");
  }
  if (!serverQueue) {
    return message.channel.send("No song skip unga bunga");
  }
  serverQueue.connection.dispatcher.end();
}

function stop(message, serverQueue) {
  if (!message.member.voice.channel) {
    return message.channel.send("get in to stop the slappies");
  }

  serverQueue.songs = [];
  serverQueue.connection.dispatcher.end();
}
