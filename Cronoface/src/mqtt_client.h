#pragma once

void init_mqtt_client();
void handle_mqtt_loop();

void mqtt_publish_status(const char* status);
void mqtt_publish_event(const char* event);