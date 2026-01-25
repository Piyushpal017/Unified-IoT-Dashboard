const API_BASE = "https://unified-iot-dashboard-bhm0.onrender.com";

let chart;
let currentDevice = "";

// ------------------ Latest Data ------------------
async function loadLatestData() {
    const res = await fetch(`${API_BASE}/latest-data`);
    const data = await res.json();

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

    populateDeviceDropdown(data.map(d => d.device_id));
}

// ------------------ Dropdown ------------------
function populateDeviceDropdown(devices) {
    const select = document.getElementById("deviceSelect");

    if (select.options.length === 0) {
        devices.forEach(d => {
            const opt = document.createElement("option");
            opt.value = d;
            opt.textContent = d;
            select.appendChild(opt);
        });

        currentDevice = devices[0];
        loadPowerChart(currentDevice);
    }
}

// ------------------ Chart ------------------
async function loadPowerChart(deviceId) {
    const res = await fetch(`${API_BASE}/telemetry/${deviceId}`);
    const data = await res.json();

    const labels = data.map(d => d.timestamp).reverse();
    const power = data.map(d => d.power).reverse();

    if (chart) chart.destroy();

    chart = new Chart(document.getElementById("powerChart"), {
        type: "line",
        data: {
            labels,
            datasets: [{
                label: `Power (${deviceId})`,
                data: power,
                borderWidth: 2,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// ------------------ Events ------------------
document.getElementById("deviceSelect").addEventListener("change", e => {
    currentDevice = e.target.value;
    loadPowerChart(currentDevice);
});

document.getElementById("darkToggle").addEventListener("click", () => {
    document.body.classList.toggle("dark");
});

// ------------------ Auto Refresh ------------------
loadLatestData();
setInterval(loadLatestData, 5000);
