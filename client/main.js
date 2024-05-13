import { initializeMap, getRouteTime, getClosestStationName } from "./map.js";
import { createChart, updateBarsOnChart } from "./chart.js";

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

const hourlyPricesThroughoutDay = {
  "00:00": 0.12,
  "01:00": 0.09,
  "02:00": 0.11,
  "03:00": 0.12,
  "04:00": 0.15,
  "05:00": 0.17,
  "06:00": 0.14,
  "07:00": 0.18,
  "08:00": 0.17,
  "09:00": 0.22,
  "10:00": 0.3,
  "11:00": 0.55,
  "12:00": 0.52,
  "13:00": 0.53,
  "14:00": 0.52,
  "15:00": 0.64,
  "16:00": 0.92,
  "17:00": 0.88,
  "18:00": 0.77,
  "19:00": 0.72,
  "20:00": 0.62,
  "21:00": 0.57,
  "22:00": 0.47,
  "23:00": 0.45,
};

initializeMap();
createChart(hourlyPricesThroughoutDay);

// Setup form listener to get user input
form.addEventListener("submit", function (event) {
  event.preventDefault();

  // Get form input values
  const timeOfArrival = document.getElementById("timeOfArrival").value;
  const timeOfDeparture = document.getElementById("timeOfDeparture").value;
  const evModel = document.getElementById("model").value;
  const currentCharge = document.getElementById("charge").value;

  calculateSchedule(timeOfArrival, timeOfDeparture, currentCharge, evModel);
});

// Calculate best times to charge within allocated time
function calculateSchedule(timeOfArrival, timeOfDeparture, currentCharge, evModel) {
  const evModelName = evModels[evModel].name;
  const batteryCapacity = evModels[evModel].capacity;
  if (currentCharge > batteryCapacity) {
    currentCharge = batteryCapacity; // limit charge to capacity
  }
  const chargingRate = 20; // kWh
  const stationETA = getRouteTime();
  const energyConsumptionPerMinute = 0.2; // kWh
  const chargeUponArrival = currentCharge - energyConsumptionPerMinute * stationETA;

  // Check user has entered location on the map
  if (stationETA == 0.0) {
    return (output.innerHTML = `
    <p>Please click on the map to enter your current location and resubmit the form</p>
  `);
  }

  const parsedArrivalTime = parseInt(timeOfArrival, 10);
  const parsedDepartureTime = parseInt(timeOfDeparture, 10);
  const allocatedTime = getHours(parsedArrivalTime, parsedDepartureTime);

  // Calculate the time required to fully charge the battery in hours
  const timeToFullCharge = (batteryCapacity - currentCharge) / chargingRate;

  // Sort the times based on their price
  allocatedTime.sort((a, b) => hourlyPricesThroughoutDay[a] - hourlyPricesThroughoutDay[b]);

  // We only need the times until fully charged. Slice removes the extra and more expensive times because we have sorted the array by price
  const cheapestTimes = allocatedTime.slice(0, Math.ceil(timeToFullCharge));

  // Get the cost for each hour of charging until fully charged
  let cost = 0;
  cheapestTimes.map((time) => {
    cost += hourlyPricesThroughoutDay[time];
  });

  // Display schedule on the bar chart
  updateBarsOnChart(allocatedTime, cheapestTimes);

  output.innerHTML = `
    <h2>Charging Schedule</h2>
    <h3>EV Model: <p>${evModelName}</p></h3>
    <h3>Closest station: <p>${getClosestStationName()}</p></h3>
    <h3>Travel time to station: <p>${decimalToTime(stationETA / 60)}</p></h3>
    <h3>Charge upon arrival: <p>${chargeUponArrival.toFixed(2)} / ${batteryCapacity.toFixed(2)} kWh</p></h3>
    <h3>Time of arrival (hour): <p>${timeOfArrival}</p></h3>
    <h3>Time of departure (hour): <p>${timeOfDeparture}</p></h3>
    <h3>Time to fully charge (at ${chargingRate} kWh): <p>${decimalToTime(timeToFullCharge)}</p></h3>
    <h3>Cost: <p>£${cost.toFixed(2)}</p></h3>
  `;
}

// Store all hours between arrival and departure time
function getHours(parsedArrivalTime, parsedDepartureTime) {
  let timesArray = [];
  if (parsedArrivalTime <= parsedDepartureTime) {
    // Arrival and departure times are within the same day
    for (let hour = parsedArrivalTime; hour <= parsedDepartureTime; hour++) {
      // Format the hour as "hh:00" and push it to the timesArray
      const hourString = hour.toString().padStart(2, "0") + ":00";
      timesArray.push(hourString);
    }
  } else {
    // Departure time wraps around midnight
    // Add hours from arrival time to 23:00
    for (let hour = parsedArrivalTime; hour < 24; hour++) {
      const hourString = hour.toString().padStart(2, "0") + ":00";
      timesArray.push(hourString);
    }
    // Add hours from 00:00 to departure time
    for (let hour = 0; hour <= parsedDepartureTime; hour++) {
      const hourString = hour.toString().padStart(2, "0") + ":00";
      timesArray.push(hourString);
    }
  }

  return timesArray;
}

// Format decimal to time
function decimalToTime(decimal) {
  const hours = Math.floor(decimal);
  const minutes = Math.floor((decimal - hours) * 60);

  if (hours === 0) {
    return `${minutes} min`;
  } else {
    return `${hours} hour(s) ${minutes} min`;
  }
}

// Clock in the top right
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