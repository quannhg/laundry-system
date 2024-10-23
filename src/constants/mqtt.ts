export const MQTT_TO_SERVER_TOPIC = 'laundry/system/server';
export const MQTT_TO_HARDWARE_TOPIC = 'laundry/system/hardware';

export enum MESSAGE_TYPE {
    REQ_ADD_MACHINE,
    RES_ADD_MACHINE,
    REQ_REMOVE_MACHINE,
    RES_REMOVE_MACHINE
}
