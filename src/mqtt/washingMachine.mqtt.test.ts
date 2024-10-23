import { MqttClient } from 'mqtt';
import { addMachine, removeMachine } from './washingMachine.mqtt';
import { prisma } from '@repositories';
import { MESSAGE_TYPE, MQTT_TO_HARDWARE_TOPIC } from '@constants';
import { LaundryStatus } from '@prisma/client';

jest.mock('mqtt');
jest.mock('@repositories');
jest.mock('@utils');

describe('Washing Machine MQTT Handlers', () => {
    let client: MqttClient;

    beforeEach(() => {
        client = { publish: jest.fn() } as unknown as MqttClient;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('addMachine', () => {
        it('should add a machine and publish success message', async () => {
            const machine = { id: 'machine1' };
            prisma.washingMachine.create = jest.fn().mockResolvedValue({ id: 'machine1', status: LaundryStatus.IDLE });

            await addMachine(client, machine);

            expect(prisma.washingMachine.create).toHaveBeenCalledWith({
                data: {
                    id: 'machine1',
                    status: LaundryStatus.IDLE
                }
            });
            expect(client.publish).toHaveBeenCalledWith(
                MQTT_TO_HARDWARE_TOPIC,
                JSON.stringify({
                    type: MESSAGE_TYPE.ADD_MACHINE,
                    payload: { status: 'success', id: 'machine1' }
                })
            );
        });

        it('should publish error message if adding machine fails', async () => {
            const machine = { id: 'machine1' };
            const error = new Error('Failed to add machine');
            prisma.washingMachine.create = jest.fn().mockRejectedValue(error);

            await addMachine(client, machine);

            expect(prisma.washingMachine.create).toHaveBeenCalledWith({
                data: {
                    id: 'machine1',
                    status: LaundryStatus.IDLE
                }
            });
            expect(client.publish).toHaveBeenCalledWith(
                MQTT_TO_HARDWARE_TOPIC,
                JSON.stringify({
                    type: MESSAGE_TYPE.ADD_MACHINE,
                    payload: { status: 'error', id: 'machine1', message: error.message }
                })
            );
        });
    });

    describe('removeMachine', () => {
        it('should remove a machine and publish success message', async () => {
            const machine = { id: 'machine1' };
            prisma.washingMachine.delete = jest.fn().mockResolvedValue({ id: 'machine1' });

            await removeMachine(client, machine);

            expect(prisma.washingMachine.delete).toHaveBeenCalledWith({
                where: {
                    id: 'machine1'
                }
            });
            expect(client.publish).toHaveBeenCalledWith(
                MQTT_TO_HARDWARE_TOPIC,
                JSON.stringify({
                    type: MESSAGE_TYPE.REMOVE_MACHINE,
                    payload: { status: 'success', id: 'machine1' }
                })
            );
        });

        it('should publish error message if removing machine fails', async () => {
            const machine = { id: 'machine1' };
            const error = new Error('Failed to remove machine');
            prisma.washingMachine.delete = jest.fn().mockRejectedValue(error);

            await removeMachine(client, machine);

            expect(prisma.washingMachine.delete).toHaveBeenCalledWith({
                where: {
                    id: 'machine1'
                }
            });
            expect(client.publish).toHaveBeenCalledWith(
                MQTT_TO_HARDWARE_TOPIC,
                JSON.stringify({
                    type: MESSAGE_TYPE.REMOVE_MACHINE,
                    payload: { status: 'error', id: 'machine1', message: error.message }
                })
            );
        });
    });
});
