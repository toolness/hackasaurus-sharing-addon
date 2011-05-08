window.addonHandlers = {};

self.port.on("event", function(data) {
  if (data.event in window.addonHandlers)
    window.addonHandlers[data.event](data.options);
});

window.sendAddonEvent = function(event, options) {
  self.port.emit("event", {event: event, options: options});
};
