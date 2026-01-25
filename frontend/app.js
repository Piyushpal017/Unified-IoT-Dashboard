const API_BASE = "https://unified-iot-dashboard-bhm0.onrender.com";

// load latest data

async function loadLatestData(){
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
}

// Load power chart

async function loadPowerChart(){
    const res = await fetch(`${API_BASE}/telemetry/meter_101`);
    const data = await res.json();

    const labels = data.map(d => d.timestamp).reverse();
    const power = data.map(d => d.power).reverse();

    new Chart(document.getElementById("powerChart"), {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Power",
                data: power,
                fill: false
            }]
        }
    });
}

loadLatestData();
loadPowerChart();

// Auto refresh every 5 sec
setInterval(loadLatestData, 5000)