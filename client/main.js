import { initializeMap, getRouteTime, getClosestStationName } from "./map.js";

initializeMap();

const form = document.querySelector(".form-container");
const output = document.querySelector(".output-container");

const evModels = {
  bmw: { name: "BMW iX xDrive 50", capacity: 105 },
  honda: { name: "Honda e", capacity: 61.9 },
  mercedes: { name: "Mercedes-Benz EQS AMG 53 4MATIC+", capacity: 118 },
  mini: { name: "MINI Electric", capacity: 36.8 },
  nissan: { name: "Nissan LEAF", capacity: 39 },
  tesla: { name: "Tesla Model 3", capacity: 57.5 },
  volkswagen: { name: "Volkswagen ID.3", capacity: 58 },
};

form.addEventListener("submit", function (event) {
  event.preventDefault();

  // Get form input values
  const arrivalTime = document.getElementById("arrival").value;
  const chargingDuration = document.getElementById("duration").value;
  const evModel = document.getElementById("model").value;
  const currentCharge = document.getElementById("charge").value;

  calculateSchedule(arrivalTime, chargingDuration, currentCharge, evModel);
});

function calculateSchedule(arrivalTime, chargingDuration, currentCharge, evModel) {
  const hourlyPricesThroughoutDay = [0.12, 0.09, 0.11, 0.12, 0.15, 0.17, 0.14, 0.18, 0.17, 0.22, 0.3, 0.55, 0.52, 0.53, 0.52, 0.64, 0.92, 0.88, 0.77, 0.72, 0.62, 0.57, 0.47, 0.45,
  ];
  const evModelName = evModels[evModel].name;
  const batteryCapacity = evModels[evModel].capacity;
  const chargingRate = 20; // kWh
  const travelTimeToStation = getRouteTime().toFixed(2);
  const energyConsumptionPerMinute = 0.2; // kWh
  const chargeRemainingAtStation = (currentCharge - energyConsumptionPerMinute * travelTimeToStation).toFixed(2);

  let cost = 0;
  // Get the cost for each hour of charging
  for (let i = 0; i < chargingDuration; i++) {
    const hourIndex = (parseInt(arrivalTime) + i) % 24; // Get index but don't go past 23 (go back to index 0)
    cost += hourlyPricesThroughoutDay[hourIndex];
  }

  output.innerHTML = `
    <h2>Output</h2>
    <p>EV Model: ${evModelName}</p>
    <p>Closest Station: ${getClosestStationName()}</p>
    <p>Travel time to station: ${travelTimeToStation} minutes</p>
    <p>Charge remaining on arrival to station: ${chargeRemainingAtStation} kWh</p>
    <p>Total Battery Capacity: ${batteryCapacity} kWh</p>
    <p>Rate of Charge: ${chargingRate} kWh</p>
    <p>Hour of Arrival: ${arrivalTime}:00</p>
    <p>Charging Duration: ${chargingDuration} hour(s)</p>
    <p>Cost: £${cost.toFixed(2)}</p>
  `;
}

function updateTime() {
  var now = new Date();
  var hours = now.getHours();
  var minutes = now.getMinutes();
  var seconds = now.getSeconds();
  if (hours < 10) hours = "0" + hours;
  if (minutes < 10) minutes = "0" + minutes;
  if (seconds < 10) seconds = "0" + seconds;
  document.getElementById("time").innerHTML = hours + ":" + minutes + ":" + seconds;
}
setInterval(updateTime, 1000);