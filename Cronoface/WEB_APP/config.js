const MQTT_CONFIG = {
  host: "wss://broker.emqx.io:8084/mqtt",
  username: "usuario",
  password: "clave",
  clientId: "SmartLockWeb_" + Math.random().toString(16).substr(2, 8),
  topicCommand: "smartlock/cmd",
  topicStatus: "smartlock/status",
  topicEvents: "smartlock/events"
};