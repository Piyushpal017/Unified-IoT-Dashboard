import json
import paho.mqtt.client as mqtt
from database import SessionLocal
from models import Device, Telemetry

BROKER = "broker.hivemq.com"
PORT = 1883
TOPIC = "iot/meter/data"

def on_connect(client, userdata, flags, rc):
    print("Backend connected to MQTT broker")
    client.subscribe(TOPIC)

def on_message(client, userdata, msg):
    try:
        data = json.loads(msg.payload.decode())
        print("Received:", data)

        db = SessionLocal()

        # ✅ Save device (commit REQUIRED)
        device = db.query(Device).filter_by(device_id=data["device_id"]).first()
        if not device:
            device = Device(device_id=data["device_id"])
            db.add(device)
            db.commit()   # 🔥 THIS WAS MISSING

        telemetry = Telemetry(
            device_id=data["device_id"],
            voltage=data["voltage"],
            current=data["current"],
            power=data["power"],
            timestamp=data["timestamp"]
        )

        db.add(telemetry)
        db.commit()
        db.close()

        print("Saved to DB")

    except Exception as e:
        print("Error saving data:", e)

client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
client.on_connect = on_connect
client.on_message = on_message

client.connect(BROKER, PORT, 60)
client.loop_start()
