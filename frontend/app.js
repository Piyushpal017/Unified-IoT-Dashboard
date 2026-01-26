const API_BASE = "https://unified-iot-dashboard-bhm0.onrender.com";

let selectedDevice = "meter_101";
let powerChart = null;

/* ---------------- LOAD TABLE ---------------- */
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
}

/* ---------------- LOAD GRAPH ---------------- */
async function loadPowerChart() {
    const res = await fetch(`${API_BASE}/telemetry/${selectedDevice}`);
    const data = await res.json();

    const labels = data.map(d => d.timestamp);
    const values = data.map(d => d.power);

    // destroy old chart
    if (powerChart) {
        powerChart.destroy();
    }

    powerChart = new Chart(document.getElementById("powerChart"), {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: `Power (${selectedDevice})`,
                data: values,
                borderWidth: 2,
                tension: 0.4,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: false }
            }
        }
    });
}

/* ---------------- DEVICE SWITCH ---------------- */
document.addEventListener("DOMContentLoaded", () => {
    loadLatestData();
    loadPowerChart();

    document.getElementById("deviceSelect").addEventListener("change", e => {
        selectedDevice = e.target.value;
        loadPowerChart();
    });

    // auto refresh
    setInterval(() => {
        loadLatestData();
        loadPowerChart();
    }, 5000);
});
