const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const cowsay = require('cowsay');
const fs = require('fs');

const config = require('./config.json');
const selectiveMode = true;

// Create an instance of a Discord client
const client = new Discord.Client();

const util = require('util');
const spawnSync = require('child_process').spawnSync;

// TTS synthesis
function createText(text) {
  //const filename = `espeak-${Math.random().toString().split('.')[1]}.wav`;
  const ret = spawnSync('espeak', ['-w', 'text.wav', text]);
};

function getMOTD() {
  const ret = spawnSync('fortune', ['-a', '-s']);
  return ret.stdout;
}

function getCowlist() {
  const folder = './node_modules/cowsay/cows';
  const cowfiles = [];
  fs.readdirSync(folder).forEach(file => {
    cowfiles.push(file.split('.')[0]);
  });
  return cowfiles;
}

client.on('ready', async () => {
  console.log('I am ready!');
  const voiceCh = await client.channels.cache.get(config.voiceChannelId);
  const voice = await voiceCh.join();

  let playing = false;
  let volume = config.volume;
  const max_volume = 1.0;
  let url = "";
  let text = "";
  let dispatcher;

  const playVoice = stream => {
    return voice.play(stream, { seek: 0, volume: volume });
  }

  const playText = text => {
    return voice.play('text.wav');
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
      else if (cmd === 'song') {
        if (playing) {
          message.channel.send(url);
        } else {
          repl = "I'm not playing a song rn";
          message.channel.send(repl);
          createText(repl);
          playText(repl);
        }
      }
      else if (cmd === 'volume') {
        if (parts.length === 1) {
          message.channel.send("Current Volume: " + volume);
          return;
        }
        if (parts[1] === 'up' && volume < max_volume) {
          volume = Math.round((volume + 0.1) * 10) / 10;
        }
        else if (parts[1] === 'down' && volume > 0.) {
          volume = Math.round((volume - 0.1) * 10) / 10;
        }
        else {
          const parsed_volume = parseFloat(parts[1]); 
          if (!Number.isNaN(parsed_volume) && parsed_volume > 0 && parsed_volume < max_volume) {
            volume = parsed_volume;
          }
        }
        if (playing) {
          dispatcher.setVolume(volume);
        }
        message.channel.send("Current Volume: " + volume);
      }
      else if (cmd === 'restart') {
        message.reply('bee boop bee boop');
        process.exit(0);
      }
      else if (cmd === 'say') {
        if (playing) {
	  message.channel.send("I'm playing a song... pls wait :D");
        } else {
          text = parts.slice(1);
          createText(text);
          playText(text);
        }
      }
      else if (cmd === 'cowsay') {
        text = parts.slice(1);
        let cowfile = 'sheep';
        if (text[0].startsWith('[')) {
          const cow = text[0].slice(1, -1);
          const cowfiles = getCowlist();
          if (cowfiles.includes(cow)) {
            cowfile = cow;
          }
          text = text.slice(1);
        }
        message.channel.send("```" + cowsay.say({text: text.join(' '),
        f: cowfile}) + "```",);
        if (!playing) {
          createText(text);
          playText(text);
        }
      }
      else if (cmd === 'cowlist') {
        const cowlist = getCowlist();
        let cowtext = ""
        for (const c of cowlist) {
          cowtext += c + '\n';
        }
        message.channel.send("```" + cowtext + "```");
      }
      else if (cmd === 'motd') {
        motd = getMOTD();
        message.channel.send("```" + motd + "```");
        if (!playing) {
          createText(motd);
          playText(motd);
        }
      }
    }
    return;
  });
});
// Log our bot in using the token from https://discordapp.com/developers/applications/me
client.login(config.token);
