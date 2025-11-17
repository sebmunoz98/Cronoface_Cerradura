#include "state_machine.h"
#include "door_control.h"
#include "face_logic.h"
#include "../security/pin_auth.h"
#include "../logs/event_log.h"
#include "../config/system_config.h"

SystemState currentState = IDLE;
unsigned long stateStartTime = 0;

void init_state_machine() {
    currentState = IDLE;
    stateStartTime = millis();
}

void changeState(SystemState newState) {
    currentState = newState;
    stateStartTime = millis();
}

void handle_state_machine() {
    switch (currentState) {
        case IDLE:
            break;

        case FACE_SCAN:
            if (face_detected_and_recognized()) {
                log_event("FACE_OK");
                changeState(ACCESS_GRANTED);
            }
            break;

        case PIN_ENTRY:
            break;

        case ACCESS_GRANTED:
            door_open();
            if (millis() - stateStartTime > DOOR_OPEN_TIME) {
                door_close();
                changeState(IDLE);
            }
            break;

        case ACCESS_DENIED:
            door_close();
            if (millis() - stateStartTime > 2000) {
                changeState(IDLE);
            }
            break;

        case MQTT_OVERRIDE:
            door_open();
            if (millis() - stateStartTime > DOOR_OPEN_TIME) {
                door_close();
                changeState(IDLE);
            }
            break;
    }
}