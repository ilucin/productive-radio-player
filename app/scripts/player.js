modulejs.define('player', ['evented'], function(evented) {
  'use strict';

  const player = evented({});
  const playlist = [];

  let ytPlayer;
  let isYouTubeIframeApiReady = false;
  let isInitCalled = false;

  function popFromQueue() {
    const url = playlist.shift();
    player.trigger('playlist:change', playlist);
    return url;
  }

  function loadVideoByUrl(url) {
    ytPlayer.loadVideoById(url.split('v=')[1]);
  }

  function playFromQueue() {
    const url = popFromQueue();

    if (!url) {
      return;
    }

    loadVideoByUrl(url);
  }

  function onPlayerStateChange(ev) {
    const state = ev.data;
    if (state === YT.PlayerState.ENDED) {
      playFromQueue();
    }
  }

  function initPlayer() {
    ytPlayer = new YT.Player('yt-player', {
      height: '390',
      width: '640',
      events: {
        onStateChange: onPlayerStateChange
      }
    });
  }

  function init() {
    isInitCalled = true;

    if (isYouTubeIframeApiReady) {
      initPlayer();
    }
  }

  window.onYouTubeIframeAPIReady = function() {
    isYouTubeIframeApiReady = true;

    if (isInitCalled) {
      initPlayer();
    }
  };

  function pushToPlaylist(url) {
    playlist.push(url);
    player.trigger('playlist:change', playlist);
  }

  function playFromQueueIfNotPlaying() {
    if (ytPlayer.getPlayerState() !== YT.PlayerState.PLAYING) {
      playFromQueue();
    }
  }

  function play() {
    ytPlayer.playVideo();
  }

  function stop() {
    ytPlayer.stopVideo();
  }

  function ytPlayerCall(method, args) {
    ytPlayer[method](...args);
  }

  return Object.assign(player, {
    init,
    pushToPlaylist,
    playFromQueue,
    playFromQueueIfNotPlaying,
    play,
    stop,
    ytPlayerCall
  });
});
