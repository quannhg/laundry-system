type MqttConfig = {
    host: string;
    username: string;
    password: string;
    topics: string[];
};

type MqttMessagePayload = Record<string, string | number>;

type MqttMessage = {
    type: number;
    payload: MqttMessagePayload;
};
