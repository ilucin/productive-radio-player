modulejs.define('view', ['player'], function(player) {
  'use strict';

  function renderPlaylist(playlist) {
    const list = playlist.map((url) => `<li> ${url} </li>`).join('');
    document.querySelector('.playlist').innerHTML = `<ul>${list}</ul>`;
  }

  return function initView() {
    player.on('playlist:change', renderPlaylist);
  };
});
