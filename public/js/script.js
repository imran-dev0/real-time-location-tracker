const socket = io();

// Get device name from user or assign default
const deviceName = prompt("Enter your Name/device name") || "Unnamed Device";

if (navigator.geolocation) {
  navigator.geolocation.watchPosition((position) => {
    const { latitude, longitude } = position.coords;
    socket.emit("send-location", {
      latitude,
      longitude,
      name: deviceName
    });
  }, (error) => {
    console.error(error);
  }, {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
  });
}

const map = L.map("map").setView([0, 0], 16);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "OpenStreetMap"
}).addTo(map);

const markers = {};

socket.on("receive-location", (data) => {
  const { id, latitude, longitude, name } = data;
  map.setView([latitude, longitude]);

  if (markers[id]) {
    markers[id].setLatLng([latitude, longitude]);
  } else {
    markers[id] = L.marker([latitude, longitude])
      .addTo(map)
      .bindTooltip(name, {
        permanent: true,
        direction: "top",
        offset: [0, -10],
        className: "device-label"
      })
      .openTooltip();
  }
});

socket.on("user-disconnected", (id) => {
  if (markers[id]) {
    map.removeLayer(markers[id]);
    delete markers[id];
  }
});
