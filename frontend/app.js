const API = "https://unified-iot-dashboard-bhm0.onrender.com";

const tableBody = document.getElementById("tableBody");
const deviceSelect = document.getElementById("deviceSelect");
const totalDevices = document.getElementById("totalDevices");
const lastUpdate = document.getElementById("lastUpdate");
const darkToggle = document.getElementById("darkToggle");

let chart;
let currentDevice = null;

// DARK MODE
darkToggle.onclick = () => {
  document.body.classList.toggle("dark");
};

// LOAD TABLE
async function loadTable() {
  const res = await fetch(`${API}/latest-data`);
  const data = await res.json();

  tableBody.innerHTML = "";
  deviceSelect.innerHTML = "";

  data.forEach(d => {
    tableBody.innerHTML += `
      <tr>
        <td>${d.device_id}</td>
        <td>${d.voltage}</td>
        <td>${d.current}</td>
        <td>${d.power}</td>
        <td>${d.timestamp}</td>
      </tr>
    `;

    const opt = document.createElement("option");
    opt.value = d.device_id;
    opt.textContent = d.device_id;
    deviceSelect.appendChild(opt);
  });

  totalDevices.textContent = data.length;
  lastUpdate.textContent = new Date().toLocaleTimeString();

  if (!currentDevice && data.length) {
    currentDevice = data[0].device_id;
    loadChart(currentDevice);
  }
}

// LOAD GRAPH
async function loadChart(device) {
  currentDevice = device;

  const res = await fetch(`${API}/telemetry/${device}`);
  const data = await res.json();

  const labels = data.map(d => d.timestamp);
  const power = data.map(d => d.power);

  if (chart) chart.destroy();

  chart = new Chart(document.getElementById("powerChart"), {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: `Power (${device})`,
        data: power,
        borderColor: "#38bdf8",
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

deviceSelect.onchange = e => loadChart(e.target.value);

// AUTO REFRESH (NO SCROLL BUG)
loadTable();
setInterval(loadTable, 5000);
setInterval(() => loadChart(currentDevice), 7000);
