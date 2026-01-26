const API = "https://unified-iot-dashboard-bhm0.onrender.com";

let chart;
let currentDevice = "";

async function loadLatestData() {
  const res = await fetch(`${API}/latest-data`);
  const data = await res.json();

  const tbody = document.querySelector("#data-table tbody");
  tbody.innerHTML = "";

  document.getElementById("totalDevices").innerText = data.length;
  document.getElementById("lastUpdate").innerText =
    data.length ? data[0].timestamp : "--";

  data.forEach(d => {
    tbody.innerHTML += `
      <tr>
        <td>${d.device_id}</td>
        <td>${d.voltage}</td>
        <td>${d.current}</td>
        <td>${d.power}</td>
        <td>${d.timestamp}</td>
      </tr>
    `;
  });

  loadDeviceDropdown(data.map(d => d.device_id));
}

function loadDeviceDropdown(devices) {
  const select = document.getElementById("deviceSelect");

  if (select.options.length === 0) {
    devices.forEach(d => {
      const opt = document.createElement("option");
      opt.value = d;
      opt.innerText = d;
      select.appendChild(opt);
    });
    currentDevice = devices[0];
    loadChart(currentDevice);
  }
}

async function loadChart(device) {
  const res = await fetch(`${API}/telemetry/${device}`);
  const data = await res.json();

  const labels = data.map(d => d.timestamp).reverse();
  const power = data.map(d => d.power).reverse();

  if (chart) chart.destroy();

  chart = new Chart(document.getElementById("powerChart"), {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: `Power (${device})`,
        data: power,
        borderWidth: 2,
        tension: 0.4
      }]
    }
  });
}

// AUTO REFRESH GRAPH
setInterval(() => {
  if (currentDevice) loadChart(currentDevice);
}, 5000);

// EVENTS
document.getElementById("deviceSelect").addEventListener("change", e => {
  currentDevice = e.target.value;
  loadChart(currentDevice);
});

document.getElementById("darkToggle").onclick = () => {
  document.body.classList.toggle("dark");
};

// INITIAL LOAD (FIXED)
loadLatestData();
setInterval(loadLatestData, 5000);
