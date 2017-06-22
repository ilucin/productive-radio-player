modulejs.define('view', ['store', 'evented'], function(store, evented) {
  'use strict';

  const view = evented({});
  const playlistEl = document.querySelector('.playlist');
  const radioStationListEl = document.querySelector('.radio-station-list');

  function getTemplate(id) {
    return document.querySelector(`.templates #${id}`).innerHTML;
  }

  store.observe('playlist', 'isLoadingPlaylist', function renderPlaylist(playlist, isLoading) {
    if (isLoading) {
      playlistEl.innerHTML = `<div class="loader"> Loading stations ${getTemplate('pong-loader')}`;
    } else {
      const list = playlist.map((url) => `<li> ${url} </li>`).join('');
      playlistEl.innerHTML = `<ul>${list}</ul>`;
    }
  });

  store.observe('stations', 'currentStation', 'isLoadingStations', function renderStations(stations, currentStation, isLoadingStations) {
    function renderStation(station) {
      const tagsHtml = station.tags.map((tag) => `<div class="radio-station__tag"> ${tag} </div>`).join('');
      const el = document.createElement('div');
      el.classList.add('radio-station');

      if (station === currentStation) {
        el.classList.add('is-current');
      }

      el.innerHTML = `
        <div class="radio-station__name"> ${station.name} </div>
        <div class="radio-station__owner"> By: ${station.owner || 'Nobody'} </div>
        <div class="radio-station__tags"> ${tagsHtml} </div>
      `;

      el.addEventListener('click', () => view.trigger('onStationClick', station));
      return el;
    }

    if (isLoadingStations) {
      radioStationListEl.innerHTML = `<div class="loader"> Loading stations ${getTemplate('pong-loader')} </div>`;
    } else {
      radioStationListEl.innerHTML = '';
      stations.forEach((station) => radioStationListEl.appendChild(renderStation(station)));
    }
  });

  return view;
});
