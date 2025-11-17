#pragma once
#include <Arduino.h>

enum SystemState {
    IDLE,
    FACE_SCAN,
    PIN_ENTRY,
    ACCESS_GRANTED,
    ACCESS_DENIED,
    MQTT_OVERRIDE
};

extern SystemState currentState;

void init_state_machine();
void handle_state_machine();
void changeState(SystemState newState);