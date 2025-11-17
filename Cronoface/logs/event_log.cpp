#include "event_log.h"
#include "../src/mqtt_client.h"

void log_event(const char* event) {
    mqtt_publish_event(event);
}