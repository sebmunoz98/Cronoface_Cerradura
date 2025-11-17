console.log('SmartLock Web App lista');

// --- 0. CONFIGURACIÓN DE CONSTANTES ---
// La URL del stream de la cámara (IP 192.168.1.29 configurada)
const CAMERA_STREAM_URL = "http://192.168.1.29:81/stream";

// --- 1. CONFIGURACIÓN DE ELEMENTOS DEL DOM ---
const elements = {
    // Indicadores MQTT
    connectionIndicator: document.getElementById('connection-indicator'),
    brokerInfo: document.getElementById('broker-info'),
    brokerStatusDetail: document.getElementById('broker-status-detail'),
    // Tarjeta principal
    systemStatusIcon: document.getElementById('system-status-icon'),
    systemStatusLabel: document.getElementById('system-status-label'),
    systemStatusDetail: document.getElementById('system-status-detail'),
    deviceIp: document.getElementById('device-ip'),
    doorState: document.getElementById('door-state'),
    // Botones de control
    btnOpen: document.getElementById('btn-open'),
    btnClose: document.getElementById('btn-close'),
    // Historial
    logOutput: document.getElementById('log-output'),
    // Face ID
    toggleFaceId: document.getElementById('toggle-faceid'),
    faceidDot: document.getElementById('faceid-dot'),
    faceidStatusLabel: document.getElementById('faceid-status-label'),
    // NUEVOS ELEMENTOS DE CÁMARA
    cameraStream: document.getElementById('camera-stream'),
    cameraStatus: document.getElementById('camera-status'),
    btnRefreshStream: document.getElementById('btn-refresh-stream'),
};

// --- 2. FUNCIONES DE UI ---

/**
 * Agrega un mensaje al panel de log.
 * @param {string} message - El mensaje a mostrar.
 * @param {string} type - Tipo de mensaje ('system', 'command', 'error', 'success').
 */
function logEvent(message, type = 'system') {
    const now = new Date();
    const time = now.toTimeString().split(' ')[0];
    const p = document.createElement('p');
    p.classList.add('log-entry', `log-${type}`);
    p.innerHTML = `[${time}] ${message}`;
    
    if (elements.logOutput.firstChild) {
        elements.logOutput.insertBefore(p, elements.logOutput.firstChild);
    } else {
        elements.logOutput.appendChild(p);
    }
    
    while (elements.logOutput.childElementCount > 50) {
        elements.logOutput.removeChild(elements.logOutput.lastChild);
    }
}

/**
 * Actualiza la UI para mostrar el estado de conexión del Broker.
 * @param {boolean} isConnected 
 */
function updateConnectionStatus(isConnected) {
    if (isConnected) {
        elements.connectionIndicator.textContent = 'Online';
        elements.connectionIndicator.className = 'badge badge-online';
        elements.brokerInfo.textContent = `Broker: ${MQTT_CONFIG.host.split('//')[1].split(':')[0]}`;
        elements.brokerStatusDetail.textContent = 'Conectado';
        elements.brokerStatusDetail.className = 'status-ok';
        logEvent('Conexión MQTT establecida correctamente.', 'success');
    } else {
        elements.connectionIndicator.textContent = 'Offline';
        elements.connectionIndicator.className = 'badge badge-offline';
        elements.brokerInfo.textContent = 'Broker: Sin Conexión';
        elements.brokerStatusDetail.textContent = 'Desconectado';
        elements.brokerStatusDetail.className = 'status-critical';
        logEvent('¡ERROR! Conexión MQTT perdida o fallida.', 'error');
    }
}

/**
 * Actualiza el estado visual de la puerta.
 * @param {string} state - 'CLOSED' o 'OPEN'
 */
function updateDoorStatus(state) {
    const isClosed = state === 'CLOSED';
    elements.systemStatusLabel.textContent = isClosed ? '**PUERTA CERRADA**' : '**PUERTA ABIERTA**';
    elements.systemStatusLabel.className = isClosed ? 'status-critical' : 'status-safe';
    elements.doorState.textContent = state;
    elements.doorState.className = isClosed ? 'door-closed' : 'door-open';
    elements.systemStatusIcon.innerHTML = isClosed ? '🚨' : '✅';
    elements.systemStatusIcon.className = isClosed ? 'status-indicator icon-offline' : 'status-indicator icon-online';
    elements.systemStatusDetail.textContent = isClosed ? 'Sistema asegurado y listo.' : 'ATENCIÓN: Puerta desbloqueada.';
}

/**
 * Refresca el stream de video de la cámara.
 */
function refreshCameraStream() {
    elements.cameraStatus.textContent = 'Recargando stream...';
    
    // Usar la constante con la IP configurada (192.168.1.29)
    const newSrc = CAMERA_STREAM_URL + '?' + new Date().getTime(); 
    
    elements.cameraStream.src = newSrc;

    elements.cameraStream.onload = () => {
        elements.cameraStatus.textContent = 'Video en Vivo (Conectado)';
        logEvent('Stream de cámara recargado exitosamente.', 'success');
    };
    
    elements.cameraStream.onerror = () => {
        setTimeout(() => {
            elements.cameraStatus.textContent = 'Error de conexión: Video offline';
            logEvent('Fallo al recargar el stream de la cámara.', 'error');
        }, 5000);
    };
}


// --- 3. LÓGICA MQTT ---

// Intentar conectar
const client = mqtt.connect(MQTT_CONFIG.host, {
    clientId: MQTT_CONFIG.clientId,
    username: MQTT_CONFIG.username,
    password: MQTT_CONFIG.password,
    reconnectPeriod: 5000 
});

client.on('connect', () => {
    updateConnectionStatus(true);
    client.subscribe([MQTT_CONFIG.topicStatus, MQTT_CONFIG.topicEvents], (err) => {
        if (!err) {
            logEvent(`Suscrito a ${MQTT_CONFIG.topicStatus} y ${MQTT_CONFIG.topicEvents}`, 'system');
        } else {
            logEvent(`Fallo en la suscripción: ${err}`, 'error');
        }
    });
    updateDoorStatus('CLOSED'); 
    refreshCameraStream(); 
});

client.on('message', (topic, message) => {
    const payload = message.toString();
    console.log(`Mensaje recibido en [${topic}]: ${payload}`);

    try {
        if (topic === MQTT_CONFIG.topicStatus) {
            const status = JSON.parse(payload);
            
            if (status.doorState) {
                updateDoorStatus(status.doorState);
            }
            if (status.deviceIP) {
                elements.deviceIp.textContent = status.deviceIP;
            }

        } else if (topic === MQTT_CONFIG.topicEvents) {
            const event = JSON.parse(payload);
            let logType = 'system';
            if (event.type === 'access_granted') {
                logType = 'success';
            } else if (event.type === 'access_denied' || event.type === 'error') {
                logType = 'error';
            }
            logEvent(`[${event.source || 'Dispositivo'}] ${event.message}`, logType);
        }
    } catch (e) {
        logEvent(`Error al procesar mensaje MQTT: ${e.message}`, 'error');
    }
});

client.on('error', (err) => {
    console.error('Error MQTT:', err);
    logEvent(`Error en el cliente MQTT: ${err.message}`, 'error');
});

client.on('close', () => {
    updateConnectionStatus(false);
});

// --- 4. MANEJO DE EVENTOS DE LA UI ---

/**
 * Publica un comando MQTT.
 * @param {string} command - El comando a enviar ('open' o 'close').
 */
function sendCommand(command) {
    const payload = JSON.stringify({ command: command });
    client.publish(MQTT_CONFIG.topicCommand, payload, { qos: 0, retain: false }, (err) => {
        if (err) {
            logEvent(`Fallo al enviar comando '${command}': ${err}`, 'error');
        } else {
            logEvent(`Comando enviado: **${command.toUpperCase()} PUERTA**`, 'command');
        }
    });
}

// Botones de Abrir/Cerrar
elements.btnOpen.addEventListener('click', () => {
    sendCommand('open');
});

elements.btnClose.addEventListener('click', () => {
    sendCommand('close');
});

// Toggle de Face ID
elements.toggleFaceId.addEventListener('change', (e) => {
    const isChecked = e.target.checked;
    const command = isChecked ? 'faceid_enable' : 'faceid_disable';
    
    elements.faceidDot.className = isChecked ? 'dot dot-active' : 'dot dot-inactive';
    elements.faceidStatusLabel.textContent = isChecked ? 'Face ID: **ACTIVO**' : 'Face ID: **INACTIVO**';

    sendCommand(command);
});

// Botón de Refresco de Cámara
elements.btnRefreshStream.addEventListener('click', refreshCameraStream);


// Inicializar el estado de conexión al cargar
updateConnectionStatus(client.connected);
refreshCameraStream();