#include <Arduino.h>
#include <WiFi.h>
#include "config/wifi_config.h"
#include "config/mqtt_config.h"
#include "src/mqtt_client.h"
#include "src/door_control.h"
#include "src/face_logic.h"
#include "src/oled_display.h"
#include "src/state_machine.h"
#include "security/pin_auth.h"
#include "logs/event_log.h"

void connectWiFi() {
  Serial.print("Conectando a WiFi: ");
  Serial.println(WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  int retries = 0;
  while (WiFi.status() != WL_CONNECTED && retries < 50) {
    delay(500);
    Serial.print(".");
    retries++;
  }
  Serial.println();
  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("WiFi conectado. IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("No se pudo conectar a WiFi (se seguirá intentando en segundo plano).");
  }
}

void setup() {
  Serial.begin(115200);
  Serial.println();
  Serial.println("Iniciando Sistema Smart Lock...");

  connectWiFi();

  init_display();
  init_door_system();
  init_face_logic();
  init_state_machine();
  init_mqtt_client();

  log_event("Sistema iniciado");
}

void loop() {
  handle_mqtt_loop();
  handle_state_machine();
  delay(10);
}