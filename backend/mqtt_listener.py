import json
import paho.mqtt.client as mqtt
from database import SessionLocal
from models import Device, Telemetry

BROKER = "broker.hivemq.com"
PORT = 1883
TOPIC = 'iot/meter/data'

def on_connect(client, userdata, flags, rc):
    print("Backend connected to MQTT broker")
    client.subscribe(TOPIC)

def on_message(client, userdata, msg):
    payload = msg.payload.decode()
    
    try:
        data = json.loads(payload)
        db = SessionLocal()

        # Device save (if not exists)
        device = db.query(Device).filter(Device.device_id == data["device_id"]).first()
        if not device:
            device = Device(device_id = data["device_id"])
            db.add(device)

        telemetry = Telemetry(
            device_id =data["device_id"],
            voltage = data["voltage"],
            current = data["current"],
            power = data["power"],
            timestamp = data["timestamp"]
        )

        db.add(telemetry)
        db.commit()
        db.close()

        print("Saved to DB:", data)

    except Exception as e:
        print("Error saving data:", e)

client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

client.connect(BROKER, PORT, 60)
client.loop_forever()