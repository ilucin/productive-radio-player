modulejs.define('store', ['evented'], function(evented) {
  'use strict';

  const store = evented({
    observe(...args) {
      const clb = args.slice(-1)[0];
      const depKeys = args.slice(0, args.length - 1);

      depKeys.forEach((depKey) => {
        store.on(`change:${depKey}`, () => clb(...depKeys.map((key) => store[key])));
      });
    },

    defineTrackedProperty(prop, initialValue) {
      let val = initialValue;

      Object.defineProperty(store, prop, {
        get: () => val,
        set: (newVal) => {
          const oldVal = val;
          val = newVal;
          if (oldVal !== newVal) {
            store.trigger(`change:${prop}`, newVal, oldVal);
          }
        }
      });
    }
  });

  store.defineTrackedProperty('stations', []);
  store.defineTrackedProperty('playlist', []);
  store.defineTrackedProperty('isLoadingStations', false);
  store.defineTrackedProperty('isLoadingPlaylist', false);
  store.defineTrackedProperty('currentStation', null);

  return store;
});
