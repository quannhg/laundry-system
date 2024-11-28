import { Static, Type } from '@sinclair/typebox';

export const NotificationInputDto = Type.Object({
    token: Type.String(),
});

export type NotificationInputDto = Static<typeof NotificationInputDto>;
