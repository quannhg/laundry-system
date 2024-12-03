import mqtt from 'mqtt';

export const mqttClient = mqtt.connect('mqtt://14.225.192.183:1884', {
    username: 'python_test',
    password: 'secretpassword',
});
