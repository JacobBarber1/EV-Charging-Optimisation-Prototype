import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine";

let map;
let router;
let closestStationName = "";
let routeTime = 0;

// Custom icons
const redIcon = L.icon({
  iconUrl: "marker-red.png",
  iconSize: [48, 48],
  iconAnchor: [24, 48],
  popupAnchor: [0, -48],
});
const blueIcon = L.icon({
  iconUrl: "marker-blue.png",
  iconSize: [48, 48],
  iconAnchor: [24, 48],
  popupAnchor: [0, -48],
});

// Nodes/locations to be placed on the map
const nodes = [
  { name: "VIRTA Charging Station", marker: L.marker([54.980496829569006, -1.5998971758933211], { icon: blueIcon }) },
  { name: "PoGo Charging Station", marker: L.marker([54.970971869209194, -1.6179499655936918], { icon: blueIcon }) },
  { name: "Fastned Charging Station", marker: L.marker([54.97499414278806, -1.6246158176701744], { icon: blueIcon }) },
  { name: "bp pulse Charging Station", marker: L.marker([54.96719616897439, -1.6056753565153077], { icon: blueIcon }) },
  { name: "InstaVolt Charging Station", marker: L.marker([54.97804430973945, -1.57411415355686], { icon: blueIcon }) },
  { name: "Be.EV Charging Station", marker: L.marker([54.98115734862636, -1.5720504242614803], { icon: blueIcon }) },
  { name: "evyve Charging Station", marker: L.marker([54.99134181676397, -1.5846783570678173], { icon: blueIcon }) },
  { name: "InstaVolt Charging Station", marker: L.marker([54.96252616437865, -1.588412381263026], { icon: blueIcon }) },
  { name: "InstaVolt Charging Station", marker: L.marker([54.96229120880857, -1.5879574522425255], { icon: blueIcon }) },
  { name: "evyve Charging Station", marker: L.marker([54.98197330693165, -1.6652848046783182], { icon: blueIcon }) },
  { name: "Genie Point Charging Station", marker: L.marker([54.99004624191036, -1.6502973803084127], { icon: blueIcon }) },
  { name: "ChargePoint Charging Station", marker: L.marker([55.001890265799844, -1.5781350102476444], { icon: blueIcon }) },
];

// Initialize the Leaflet map
export function initializeMap() {
  // Set Newcastle map bounds
  const southWestBound = L.latLng(54.8, -2);
  const northEastBound = L.latLng(55.12, -1.1);
  const maxBoundArea = L.latLngBounds(southWestBound, northEastBound);

  // Initialize Leaflet map - https://leafletjs.com/examples/quick-start/
  map = L.map("map", {
    minZoom: 11,
    maxZoom: 17,
    maxBounds: maxBoundArea,
    maxBoundsViscosity: 0.5,
  }).setView([54.9783, -1.6174], 13); // Newcastle coordinates with initial zoom level of 13

  // Add base tile layer (OpenStreetMap)
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    format: "image/png",
  }).addTo(map);

  addMarkers(nodes);

  map.on("click", onMapClick);
}

// Add markers to the map
export function addMarkers(nodes) {
  nodes.forEach((node) => {
    node.marker.addTo(map);
    node.marker.bindPopup(node.name);
  });
}

// Calculate and display the route on map click
function onMapClick(e) {
  const clickedPoint = e.latlng;
  const nearestNode = calculateNearestNode(clickedPoint);

  // Remove the previous route if it exists
  if (router) {
    router.spliceWaypoints(0, 2);
    map.removeControl(router);
  }

  // Create the routing control and add it to the map
  router = L.Routing.control({
    waypoints: [L.latLng(clickedPoint.lat, clickedPoint.lng), L.latLng(nearestNode.lat, nearestNode.lng)],
    lineOptions: {
      styles: [{ color: "red", opacity: 0.6, weight: 4 }],
    },
    fitSelectedRoutes: false,
    show: true,
    createMarker: function (i, waypoint) {
      if (i === 0) {
        return L.marker(waypoint.latLng, { icon: redIcon });
      }
    },
  }).addTo(map);

  // Listen for the routing response event
  router.on("routesfound", function (event) {
    const route = event.routes[0];
    closestStationName = route.name;
    routeTime = route.summary.totalTime / 60; // In minutes
  });
}

// Calculate nearest node from clicked point on the map
function calculateNearestNode(clickedPoint) {
  let minDistance = Infinity;
  let nearestNode = null;
  // Check distance between each node and find closest one
  nodes.forEach(function (node) {
    const distance = clickedPoint.distanceTo(node.marker.getLatLng());
    if (distance < minDistance) {
      minDistance = distance;
      nearestNode = node.marker.getLatLng();
    }
  });
  return nearestNode;
}

// Get closest station name
export function getClosestStationName() {
  return closestStationName;
}

// Get route time
export function getRouteTime() {
  return routeTime;
}