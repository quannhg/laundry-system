import mqtt from 'mqtt';
import { setupMessageHandler } from './messageHandler';

export const mqttClient = mqtt.connect('mqtt://14.225.192.183:1884', {
    username: 'python_test',
    password: 'secretpassword',
});

// Setup message handling
setupMessageHandler(mqttClient);
