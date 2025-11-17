#include "door_control.h"
#include <Arduino.h>

const int RELAY_PIN = 2;

void init_door_system() {
    pinMode(RELAY_PIN, OUTPUT);
    digitalWrite(RELAY_PIN, LOW);
}

void door_open() {
    digitalWrite(RELAY_PIN, HIGH);
}

void door_close() {
    digitalWrite(RELAY_PIN, LOW);
}

bool door_is_open() {
    return digitalRead(RELAY_PIN) == HIGH;
}