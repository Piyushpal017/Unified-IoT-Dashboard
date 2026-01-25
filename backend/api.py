from fastapi import FastAPI
from database import SessionLocal, engine
from models import Device, Telemetry, Base
from fastapi.middleware.cors import CORSMiddleware
import mqtt_listener
import publisher
import threading

app = FastAPI(title="Unified IoT Dashboard API")

# ------------------ CORS ------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------ DB INIT ------------------
Base.metadata.create_all(bind=engine)

# ------------------ STARTUP ------------------
@app.on_event("startup")
def start_background_services():
    print("🚀 Backend starting...")

    # MQTT Subscriber (listener)
    try:
        mqtt_listener.start_mqtt()
        print("📡 MQTT Subscriber started")
    except Exception as e:
        print("❌ MQTT Subscriber failed:", e)

    # MQTT Publisher (fake data generator)
    try:
        threading.Thread(
            target=publisher.start_publisher,
            daemon=True
        ).start()
        print("📤 MQTT Publisher started")
    except Exception as e:
        print("❌ MQTT Publisher failed:", e)

# ------------------ APIs ------------------

# Health check
@app.get("/")
def root():
    return {"status": "API running + MQTT active ✅"}

# Get all devices
@app.get("/devices")
def get_devices():
    db = SessionLocal()
    devices = db.query(Device).all()
    db.close()
    return [{"device_id": d.device_id} for d in devices]

# Get latest data of all devices
@app.get("/latest-data")
def get_latest_data():
    db = SessionLocal()
    result = []

    devices = db.query(Device).all()
    for device in devices:
        latest = (
            db.query(Telemetry)
            .filter(Telemetry.device_id == device.device_id)
            .order_by(Telemetry.id.desc())
            .first()
        )
        if latest:
            result.append({
                "device_id": device.device_id,
                "voltage": latest.voltage,
                "current": latest.current,
                "power": latest.power,
                "timestamp": latest.timestamp
            })

    db.close()
    return result

# Get telemetry history of one device
@app.get("/telemetry/{device_id}")
def get_telemetry(device_id: str):
    db = SessionLocal()
    data = (
        db.query(Telemetry)
        .filter(Telemetry.device_id == device_id)
        .order_by(Telemetry.id.desc())
        .limit(50)
        .all()
    )
    db.close()

    return [
        {
            "voltage": t.voltage,
            "current": t.current,
            "power": t.power,
            "timestamp": t.timestamp
        }
        for t in data
    ]
