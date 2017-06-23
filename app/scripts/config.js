modulejs.define('config', function() {
  'use strict';

  const development = {
    realtimeHost: 'http://localhost:3000',
    apiHost: 'http://api.productive.io.dev',
    token: '3b0c6139-8be0-422c-b4d2-ec2979aa3da9',
    personId: '94',
    projectId: '72',
    organizationId: '16'
  };

  const production = {
    realtimeHost: 'https://realtime.productive.io',
    apiHost: 'https://api.productive.io',
    token: window.PRODUCTION_TOKEN,
    personId: '13892',
    projectId: '23',
    organizationId: '1'
  };

  return Object.assign({}, ENV === 'development' ? development : production);
});
