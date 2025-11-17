#include "pin_auth.h"

String masterPIN = "1234";

bool validate_pin(String pin) {
    return pin == masterPIN;
}

void update_pin(String newPin) {
    masterPIN = newPin;
}