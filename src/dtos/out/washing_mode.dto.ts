import { Static, Type } from '@sinclair/typebox';

export const WashingModeDto = Type.Object({
  id: Type.String(),
  name: Type.String(),
  duration: Type.Number(),
  capacity: Type.Number(),
  price: Type.Number(),
  isActive: Type.Boolean(),
});

export const WashingModeListDto = Type.Object({
  washingModes: Type.Array(WashingModeDto),
  pagination: Type.Object({
    total: Type.Number(),
    page: Type.Number(),
    limit: Type.Number(),
    totalPages: Type.Number(),
  }),
});

export type WashingModeDto = Static<typeof WashingModeDto>;
export type WashingModeListDto = Static<typeof WashingModeListDto>; 