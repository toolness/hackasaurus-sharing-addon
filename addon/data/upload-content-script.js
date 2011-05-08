window.addonHandlers = {};

onMessage = function(data) {
  if (data.event in window.addonHandlers)
    window.addonHandlers[data.event](data.options);
};

window.sendAddonEvent = function(event, options) {
  postMessage({event: event, options: options});
};
