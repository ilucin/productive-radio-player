modulejs.define('main', [
  'config', 'player', 'server', 'command-parser', 'store', 'view', 'utils', 'runloop'
], function(config, player, server, parseCommand, store, view, utils, runloop) {
  'use strict';

  const stationCacheMap = {};

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

  store.observe('playlist', function(playlist) {
    const stationCache = stationCacheMap[store.currentStation.id];

    if (playlist.length < 3 && stationCache.commands && stationCache.commands.length) {
      if (stationCache.shuffledCommands.length === 0) {
        stationCache.shuffledCommands = utils.shuffleArray(stationCache.commands);
      }

      stationCache.shuffledCommands.splice(0, 5).forEach((command) => {
        commandHandlers.addToPlaylist(command);
      });
    }
  });

  store.observe('currentStation', function(currentStation) {
    player.stop();
    store.isLoadingPlaylist = true;
    store.playlist = [];

    server.fetchCommandsForStation(currentStation.id)
      .then(runloop.wrap((commands) => {
        store.isLoadingPlaylist = false;

        const filteredCommands = filterCommandsByType(commands, 'addToPlaylist');
        const stationCache = stationCacheMap[currentStation.id];

        stationCache.commands = filteredCommands;
        stationCache.shuffledCommands = utils.shuffleArray(filteredCommands);
        stationCache.shuffledCommands.splice(0, 5).forEach((command) => {
          commandHandlers.addToPlaylist(command);
        });
      }));
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
    server.fetchStations().then((stations) => {
      store.stations = stations;
      stations.forEach((station) => (stationCacheMap[station.id] = {}));
    });
    server.on('command', runloop.wrap(processServerCommand));
    view.on('selectStation', (station) => (store.currentStation = station));
    view.on('next', () => commandHandlers.next());
  };
});
