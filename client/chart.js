import Chart from "chart.js/auto";

export function createChart(hourlyPricesThroughoutDay) {
  const ctx = document.getElementById("hourlyPricesChart");

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
          borderColor: "rgb(0, 97, 153)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: "Electricity Prices Throughout The Day",
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