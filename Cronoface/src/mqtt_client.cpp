#include "mqtt_client.h"
#include <WiFi.h>
#include <PubSubClient.h>
#include "../config/mqtt_config.h"
#include "state_machine.h"

WiFiClient espClient;
PubSubClient client(espClient);

void mqtt_callback(char* topic, byte* message, unsigned int length) {
    if (strcmp(topic, TOPIC_COMMAND) == 0) {
        if (length > 0 && message[0] == '1') {
            changeState(MQTT_OVERRIDE);
        }
    }
}

void reconnect_mqtt() {
  while (!client.connected()) {
    if (client.connect("ESP32_SMARTLOCK", MQTT_USER, MQTT_PASSWORD)) {
      client.subscribe(TOPIC_COMMAND);
      mqtt_publish_status("online");
    } else {
      delay(2000);
    }
  }
}

void init_mqtt_client() {
  client.setServer(MQTT_SERVER, MQTT_PORT);
  client.setCallback(mqtt_callback);
}

void handle_mqtt_loop() {
  if (WiFi.status() != WL_CONNECTED) {
    return;
  }
  if (!client.connected()) {
    reconnect_mqtt();
  }
  client.loop();
}

void mqtt_publish_status(const char* status) {
  if (client.connected()) {
    client.publish(TOPIC_STATUS, status);
  }
}

void mqtt_publish_event(const char* event) {
  if (client.connected()) {
    client.publish(TOPIC_EVENTS, event);
  }
}