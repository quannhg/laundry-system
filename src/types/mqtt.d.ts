type MqttConfig = {
    topics: string[];
};

type MqttMessagePayload = Record<string, string | number>;

type MqttMessage = {
    type: number;
    payload: MqttMessagePayload;
};
