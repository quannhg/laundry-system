export const MQTT_TO_SERVER_TOPIC = 'laundry/system/server';
export const MQTT_TO_HARDWARE_TOPIC = 'laundry/system/hardware';

export enum MESSAGE_TYPE {
    ADD_MACHINE,
    REMOVE_MACHINE,
    UPDATE_MACHINE_STATUS,
    SEND_AUTHENTICATION_CODE
}
