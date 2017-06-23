modulejs.define('runloop', function() {
  'use strict';

  const deferedJobs = [];
  let jobCount = 0;

  function run(job) {
    jobCount++;
    job();
    jobCount--;

    if (jobCount === 0 && deferedJobs.length > 0) {
      deferedJobs.forEach((deferedJob) => deferedJob());
    }
  }

  function defer(job) {
    if (jobCount === 0) {
      job();
    } else {
      deferedJobs.push(job);
    }
  }

  function wrap(job) {
    return (...args) => run(() => job(...args));
  }

  return {
    defer,
    run,
    wrap
  };
});
