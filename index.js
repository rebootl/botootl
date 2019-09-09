const Discord = require('discord.js');
const ytdl = require('ytdl-core');

const config = require('./config.json');
const selectiveMode = true;

// Create an instance of a Discord client
const client = new Discord.Client();

client.on('ready', async () => {
  console.log('I am ready!');
  const voiceCh = await client.channels.get(config.voiceChannelId);
  const voice = await voiceCh.join();

  let playing = false;
  let url = "";
  let dispatcher;

  const playVoice = stream => {
    return voice.play(stream, { seek: 0, volume: 0.5 });
  }

  client.on('message', message => {
    if (!message.guild) return;
    if (message.author.bot) return;
    if (message.channel.id != config.textChannelId) return;
    if (!message.content) return;
    if (selectiveMode && (!message.member || !message.member.voice.channel ||
      message.member.voice.channel.id != config.voiceChannelId)) return;

    if (message.content === 'ping') {
      message.channel.send('pong');
    }

    if (message.content.startsWith('!')) {
      const parts = message.content.slice(1).split(' ');
      console.log(parts);
      const cmd = parts[0];
      if (cmd === 'play') {
        if (playing === true) {
          message.channel.send("Already playing a song, pls wait. :P");
          return;
        }
        url = parts[1];
        try {
          playing = true;
          const stream = ytdl(url, { filter : 'audioonly' });
          dispatcher = playVoice(stream);
          dispatcher.on('finish', () => {
            playing = false;
            console.log('Finished playing!');
          });
        } catch (e) {
          playing = false;
          console.log("Error playing url: " + url);
          message.channel.send("Error playing url... :(");
          console.log(e);
        }
      }
      else if (cmd === 'stop' && playing) {
          dispatcher.destroy();
          playing = false;
      }
      else if (cmd === 'song' && playing) {
        message.channel.send(url);
      }
    }
    return;
  });
});
// Log our bot in using the token from https://discordapp.com/developers/applications/me
client.login(config.token);
