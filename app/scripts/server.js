modulejs.define('server', ['io', 'evented', 'config', 'store'], function(io, evented, config, store) {
  'use strict';

  const {realtimeHost, token, organizationId, projectId, personId, apiHost} = config;
  const server = evented({});

  function getTextContentFromHtml(html) {
    const el = document.createElement('div');
    el.innerHTML = html;
    return el.textContent.trim();
  }

  function query(endpoint, filter, perPage = 100, page = 1) {
    return fetch(encodeURI(`${apiHost}/api/v2/${organizationId}/${endpoint}?per_page=${perPage}&page=${page}&${filter}&token=${token}`));
  }

  function depaginatedQuery(endpoint, filter, perPage = 100) {
    let page = 1;
    const responses = [];

    const loadNextPage = () => {
      return query(endpoint, filter, perPage, page)
        .then((res) => res.json())
        .then((res) => {
          responses.push(res);

          if (page < res.meta.total_pages) {
            page++;
            return loadNextPage();
          }

          return responses;
        });
    };

    return Promise.resolve().then(loadNextPage);
  }

  function onNewNotification(evData) {
    query('notifications', `filter[id]=${evData.notification_id}`, 1)
      .then((res) => server.trigger('command', getTextContentFromHtml(res.data[0].attributes.excerpt)));
  }

  function fetchStations() {
    store.isLoadingStations = true;
    return depaginatedQuery('tasks', `filter[project_id]=${projectId}&filter[status]=1`).then((responses) => {
      store.isLoadingStations = false;
      return responses.reduce((arr, res) => {
        return res.data.reduce((stations, task) => {
          const assignee = task.relationships.assignee.data ? res.included.find(function(model) {
            return model.type === 'people' && model.id === task.relationships.assignee.data.id;
          }) : null;

          return stations.concat({
            id: task.id,
            name: task.attributes.title,
            tags: task.attributes.tag_list,
            owner: assignee ? `${assignee.attributes.first_name} ${assignee.attributes.last_name}`.trim() : 'Nobody'
          });
        }, arr);
      }, []);
    });
  }

  function fetchCommandsForStation(stationId) {
    return depaginatedQuery('activities', `filter[task_id]=${stationId}`).then((responses) => {
      return responses.reduce((arr, res) => {
        return res.data
          .filter((activity) => activity.attributes.item_type === 'comment')
          .reduce((commands, activity) => {
            const comment = res.included.find((model) => model.id === String(activity.attributes.item_id));
            if (comment && !comment.attributes.deleted_at) {
              commands.push({
                id: comment.id,
                text: getTextContentFromHtml(comment.attributes.body)
              });
            }
            return commands;
          }, arr);
      }, []);
    });
  }

  function connectToSocket() {
    const socket = io(realtimeHost, {path: '', autoConnect: true});
    socket.on('connect', function() {
      socket.emit('join', {token, person_id: personId});
    });
    socket.on('new-notification', onNewNotification);
  }

  return Object.assign(server, {
    connectToSocket,
    fetchStations,
    fetchCommandsForStation
  });
});
