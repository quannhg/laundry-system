import { Static, Type } from '@sinclair/typebox';

export const NotificationResultDto = Type.Object({
    status: Type.String(),
});

export type NotificationResultDto = Static<typeof NotificationResultDto>;
