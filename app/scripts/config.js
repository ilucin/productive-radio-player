modulejs.define('config', function() {
  'use strict';

  const development = {
    realtimeHost: 'http://localhost:3000',
    apiHost: 'http://api.productive.io.dev',
    token: '240f869e-d33a-4952-9d5d-109304a4a934',
    personId: '91',
    projectId: '72',
    organizationId: '16'
  };

  const production = {
    realtimeHost: 'https://realtime.productive.io',
    apiHost: 'https://api.productive.io',
    token: window.PRODUCTION_TOKEN,
    personId: '13892',
    projectId: '1',
    organizationId: '1'
  };

  return Object.assign({}, ENV === 'development' ? development : production);
});
