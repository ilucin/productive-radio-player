modulejs.define('main', [
  'config', 'player', 'server', 'command-parser', 'store', 'view'
], function(config, player, server, parseCommand, store, view) {
  'use strict';

  function filterCommandsByType(commands, type) {
    return commands.filter((command) => {
      Object.assign(command, parseCommand(command.text));
      return command && command.type === type;
    });
  }

  const commandHandlers = {
    addToPlaylist(cmd) {
      cmd.urls.forEach((url) => player.pushToPlaylist(url));
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
      server.fetchCommandsForStation(store.currentStation.id).then((commands) => {
        const filteredCommands = filterCommandsByType(commands, 'addToPlaylist');
        const command = Math.floor(Math.random() * filteredCommands.length);

        if (command) {
          commandHandlers.addToPlaylist(command);
        }
      });
    }
  };

  store.observe('currentStation', function(currentStation) {
    player.stop();
    store.isLoadingPlaylist = true;
    store.playlist = [];

    server.fetchCommandsForStation(currentStation.id).then((commands) => {
      store.isLoadingPlaylist = false;
      const filteredCommands = filterCommandsByType(commands, 'addToPlaylist');
      // .reduce((arr, cmd) => {
      //   return cmd.urls.reduce((inArr, url) => {
      //     return inArr.find((a) => a.url === url) ? inArr : inArr.concat(cmd);
      //   }, arr);
      // }, []);
      filteredCommands.slice(0, 10).forEach((command) => commandHandlers.addToPlaylist(command));
    });
  });

  function processServerCommand(text) {
    const cmd = parseCommand(text);

    if (cmd && commandHandlers[cmd.type]) {
      commandHandlers[cmd.type](cmd);
    }
  }

  return function main() {
    player.init();
    server.connectToSocket();
    server.fetchStations().then((stations) => (store.stations = stations));
    server.on('command', processServerCommand);
    view.on('selectStation', (station) => (store.currentStation = station));
    view.on('next', () => commandHandlers.next());
  };
});
