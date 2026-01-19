from sqlalchemy import Column, Integer, String, Float
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Device(Base):
    __tablename__ = "devices"

    id = Column(Integer, primary_key=True)
    device_id = Column(String, unique=True)

class Telemetry(Base):
    __tablename__ = "telemetry"

    id = Column(Integer, primary_key=True)
    device_id = Column(String)
    voltage = Column(Float)
    current = Column(Float)
    power = Column(Float)
    timestamp = Column(String)