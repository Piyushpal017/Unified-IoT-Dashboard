import json
import time
import random
import paho.mqtt.client as mqtt

BROKER = "localhost"
PORT = 1883
TOPIC = "iot/meter/data"

client = mqtt.Client()
client.connect(BROKER, PORT, 60)

device_ids = ["meter_101", "meter_102"]

print("Fake IOT device started....")

while True:
    data = {
        "device_id": random.choice(device_ids),
        "voltage": random.randint(220, 240),
        "current": round(random.uniform(3.0, 7.0), 2),
        "power": random.randint(800, 1500),
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
    }

    client.publish(TOPIC, json.dumps(data))
    print("Published:", data)

    time.sleep(5)