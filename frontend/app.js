const API_BASE = "https://unified-iot-dashboard-bhm0.onrender.com";

let powerChart = null;
let selectedDevice = "meter_101";

/* ---------------- DOM READY (FIX #1) ---------------- */
document.addEventListener("DOMContentLoaded", () => {
    loadLatestData();
    loadPowerChart();

    // auto refresh
    setInterval(loadLatestData, 5000);
    setInterval(loadPowerChart, 5000);
});

/* ---------------- TABLE DATA ---------------- */
async function loadLatestData() {
    try {
        const res = await fetch(`${API_BASE}/latest-data`);
        const data = await res.json();

        const tbody = document.querySelector("#data-table tbody");
        tbody.innerHTML = "";

        data.forEach(d => {
            const row = `
                <tr>
                    <td>${d.device_id}</td>
                    <td>${d.voltage}</td>
                    <td>${d.current}</td>
                    <td>${d.power}</td>
                    <td>${d.timestamp}</td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    } catch (err) {
        console.error("Table load error:", err);
    }
}

/* ---------------- CHART (FIX #2) ---------------- */
async function loadPowerChart() {
    try {
        const res = await fetch(`${API_BASE}/telemetry/${selectedDevice}`);
        const data = await res.json();

        const labels = data.map(d => d.timestamp).reverse();
        const power = data.map(d => d.power).reverse();

        // create chart ONLY ONCE
        if (!powerChart) {
            const ctx = document.getElementById("powerChart").getContext("2d");

            powerChart = new Chart(ctx, {
                type: "line",
                data: {
                    labels: labels,
                    datasets: [{
                        label: `Power (${selectedDevice})`,
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
        // update existing chart
        else {
            powerChart.data.labels = labels;
            powerChart.data.datasets[0].data = power;
            powerChart.update();
        }

    } catch (err) {
        console.error("Chart load error:", err);
    }
}
