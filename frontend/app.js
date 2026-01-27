const API_BASE = "https://unified-iot-dashboard-bhm0.onrender.com";

let chart;
let currentDevice = "";

// retry fetch (Render cold start fix)
async function fetchWithRetry(url, retries = 12) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw "error";
    return await res.json();
  } catch {
    if (retries === 0) throw "server down";
    await new Promise(r => setTimeout(r, 4000));
    return fetchWithRetry(url, retries - 1);
  }
}

// load latest table
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
      </tr>`;
  });

  document.getElementById("totalDevices").innerText = data.length;
  document.getElementById("lastUpdate").innerText = new Date().toLocaleTimeString();

  loadDeviceDropdown(data.map(d => d.device_id));
}

// dropdown
function loadDeviceDropdown(devices) {
  const select = document.getElementById("deviceSelect");
  if (select.options.length > 0) return;

  devices.forEach(d => {
    const opt = document.createElement("option");
    opt.value = d;
    opt.textContent = d;
    select.appendChild(opt);
  });

  currentDevice = devices[0];
  loadChart(currentDevice);

  select.onchange = () => {
    currentDevice = select.value;
    loadChart(currentDevice);
  };
}

// chart
async function loadChart(device) {
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
    }
  });
}

// dark mode
document.getElementById("darkToggle").onclick = () => {
  document.body.classList.toggle("dark");
};

// start
loadLatestData();
setInterval(loadLatestData, 5000);
