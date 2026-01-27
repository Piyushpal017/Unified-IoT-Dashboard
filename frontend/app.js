const API_BASE = "https://unified-iot-dashboard-bhm0.onrender.com";

let chart = null;
let currentDevice = "";
let devicesLoaded = false;

/* ---------- SAFE FETCH (Render cold start fix) ---------- */
async function fetchWithRetry(url, retries = 15) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch {
    if (retries === 0) throw new Error("Server down");
    await new Promise(r => setTimeout(r, 4000));
    return fetchWithRetry(url, retries - 1);
  }
}

/* ---------- LOAD TABLE + STATS ---------- */
async function loadLatestData() {
  const data = await fetchWithRetry(`${API_BASE}/latest-data`);

  document.getElementById("loaderOverlay").style.display = "none";

  const tbody = document.querySelector("#data-table tbody");
  tbody.innerHTML = "";

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

  document.getElementById("totalDevices").innerText = data.length;
  document.getElementById("lastUpdate").innerText =
    new Date().toLocaleTimeString();

  if (!devicesLoaded) {
    initDeviceDropdown(data.map(d => d.device_id));
    devicesLoaded = true;
  }

  // 🔥 LIVE GRAPH UPDATE
  updateChart();
}

/* ---------- DEVICE DROPDOWN ---------- */
function initDeviceDropdown(devices) {
  const select = document.getElementById("deviceSelect");
  select.innerHTML = "";

  devices.forEach(d => {
    const opt = document.createElement("option");
    opt.value = d;
    opt.textContent = d;
    select.appendChild(opt);
  });

  currentDevice = devices[0];
  createChart(currentDevice);

  select.onchange = () => {
    currentDevice = select.value;
    createChart(currentDevice);
  };
}

/* ---------- CREATE CHART ---------- */
async function createChart(device) {
  const data = await fetchWithRetry(`${API_BASE}/telemetry/${device}`);

  const labels = data.map(d => d.timestamp).reverse();
  const values = data.map(d => d.power).reverse();

  if (chart) chart.destroy();

  chart = new Chart(document.getElementById("powerChart"), {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: `Power (${device})`,
        data: values,
        borderWidth: 2,
        tension: 0.4
      }]
    },
    options: {
      animation: true,
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

/* ---------- UPDATE CHART DATA (LIVE) ---------- */
async function updateChart() {
  if (!chart || !currentDevice) return;

  const data = await fetchWithRetry(`${API_BASE}/telemetry/${currentDevice}`);

  chart.data.labels = data.map(d => d.timestamp).reverse();
  chart.data.datasets[0].data = data.map(d => d.power).reverse();
  chart.update();
}

/* ---------- DARK MODE ---------- */
document.getElementById("darkToggle").onclick = () => {
  document.body.classList.toggle("dark");
};

/* ---------- START ---------- */
loadLatestData();
setInterval(loadLatestData, 5000);
