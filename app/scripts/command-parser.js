modulejs.define('command-parser', function() {
  'use strict';

  function parse(text) {
    console.log('Command: ', text);

    if (text === 'play') {
      return {type: 'play'};
    } else if (text === 'stop') {
      return {type: 'stop'};
    } else if (text === 'next') {
      return {type: 'next'};
    } else if (text.startsWith('http')) {
      return {type: 'addToPlaylist', url: text.split(' ')[0]};
    } else if (text.startsWith('add ')) {
      return {type: 'addToPlaylist', url: text.split('add ')[1].trim()};
    } else if (text.startsWith('player ')) {
      const splits = text.split(' ');
      return {type: 'ytPlayerCall', method: splits[1], args: splits.slice(2)};
    } else if (text.startsWith('random')) {
      return {type: 'addRandomToPlaylist'};
    }

    return null;
  }

  return {
    parse
  };
});
