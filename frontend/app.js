const API = "https://unified-iot-dashboard-bhm0.onrender.com";

const loader = document.getElementById("loading");
const tableBody = document.querySelector("#data-table tbody");
const deviceSelect = document.getElementById("deviceSelect");
const totalDevicesEl = document.getElementById("totalDevices");
const lastUpdateEl = document.getElementById("lastUpdate");

let chart;
let currentDevice = null;

/* 🌐 Wait for backend (COLD START FIX) */
async function waitForBackend() {
  while (true) {
    try {
      const res = await fetch(`${API}/latest-data`);
      const data = await res.json();
      if (data.length > 0) {
        loader.classList.add("hidden");
        renderTable(data);
        setupDevices(data);
        updateStats(data);
        loadGraph();
        setInterval(refreshAll, 5000);
        break;
      }
    } catch {
      console.log("Backend waking up...");
    }
    await new Promise(r => setTimeout(r, 5000));
  }
}

/* 📊 Table */
function renderTable(data) {
  tableBody.innerHTML = "";
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
  });
}

/* 📈 Stats */
function updateStats(data) {
  totalDevicesEl.textContent = data.length;
  lastUpdateEl.textContent = new Date().toLocaleTimeString();
}

/* 🔽 Device dropdown */
function setupDevices(data) {
  const devices = [...new Set(data.map(d => d.device_id))];
  deviceSelect.innerHTML = "";
  devices.forEach(d => {
    deviceSelect.innerHTML += `<option value="${d}">${d}</option>`;
  });
  currentDevice = devices[0];
}

/* 📉 Chart */
async function loadGraph() {
  const res = await fetch(`${API}/telemetry/${currentDevice}`);
  const data = await res.json();

  const labels = data.map(d => d.timestamp).reverse();
  const values = data.map(d => d.power).reverse();

  if (chart) chart.destroy();

  chart = new Chart(document.getElementById("powerChart"), {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: `Power (${currentDevice})`,
        data: values,
        borderWidth: 2,
        tension: 0.4
      }]
    }
  });
}

/* 🔄 Auto Refresh */
async function refreshAll() {
  const res = await fetch(`${API}/latest-data`);
  const data = await res.json();
  renderTable(data);
  updateStats(data);
  loadGraph();
}

/* 🔀 Device change */
deviceSelect.addEventListener("change", e => {
  currentDevice = e.target.value;
  loadGraph();
});

/* 🌙 Dark Mode */
document.getElementById("darkToggle").onclick = () => {
  document.body.classList.toggle("dark");
};

/* 🚀 INIT */
waitForBackend();
