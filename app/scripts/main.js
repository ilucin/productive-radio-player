modulejs.define('main', ['config', 'player', 'server', 'command-parser', 'view'], function(config, player, server, commandParser, initView) {
  'use strict';

  const {taskId} = config;

  const commandHandlers = {
    addToPlaylist(cmd) {
      player.pushToPlaylist(cmd.url);
      player.playFromQueueIfNotPlaying();
    },

    play() {
      player.play();
    },

    stop() {
      player.stop();
    },

    next() {
      player.playFromQueue();
    },

    ytPlayerCall(cmd) {
      player.ytPlayerCall(cmd.method, cmd.args);
    },

    addRandomToPlaylist() {
      server.fetchCommandsForStation(taskId).then((commands) => {
        let command;

        do {
          if (commands.lenght) {
            const idx = Math.floor(Math.random() * commands.length);
            command = commands[idx];
            commands.splice(idx, 1);
            Object.assign(command, commandParser.parse(command.text));
          }
        } while (commands.length && command.type !== 'addToPlaylist');

        if (command) {
          commandHandlers.addToPlaylist(command);
        }
      });
    }
  };

  function processServerCommand(text) {
    const cmd = commandParser.parse(text);
    console.log('Parsed command', cmd);

    if (cmd && commandHandlers[cmd.type]) {
      commandHandlers[cmd.type](cmd);
    }
  }

  return function main() {
    initView();
    player.init();
    server.connectToSocket();
    server.on('command', processServerCommand);
  };
});
