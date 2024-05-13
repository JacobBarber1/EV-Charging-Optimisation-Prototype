import Chart from "chart.js/auto";

const ctx = document.getElementById("hourlyPricesChart");

export function createChart(hourlyPricesThroughoutDay) {
  // Define the data for the chart
  const hours = Object.keys(hourlyPricesThroughoutDay);
  const prices = Object.values(hourlyPricesThroughoutDay);

  // Create the chart
  const hourlyPricesChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: hours,
      datasets: [
        {
          label: "Price (£/kWh)",
          data: prices,
          backgroundColor: "rgba(0, 97, 153, 0.8)",
        },
      ],
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: "Charging Schedule",
          font: {
            size: 18,
          },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Hour of the Day",
          },
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Price (£/kWh)",
          },
        },
      },
    },
  });
}

// Change bars to show time allocated and cheapest times
export function updateBarsOnChart(allocatedTime, cheapestTimes) {
  const hourlyPricesChart = Chart.getChart(ctx);
  hourlyPricesChart.data.datasets[0].backgroundColor = setBarColours(
    hourlyPricesChart.data.labels,
    allocatedTime,
    cheapestTimes
  );
  hourlyPricesChart.update();
}

// Set bar colour
function setBarColours(hours, allocatedTime, cheapestTimes) {
  return hours.map((hour) => {
    if (allocatedTime.includes(hour)) {
      if (cheapestTimes.includes(hour)) {
        return "rgba(3, 198, 0.8)"; // Green - Cheapest charging time
      } else {
        return "rgba(198, 0, 0, 0.8)"; // Red - Allocated time
      }
    } else {
      return "rgba(206, 206, 206, 0.8)"; // Grey - Other times
    }
  });
}