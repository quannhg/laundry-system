import { Static, Type } from '@sinclair/typebox';

export const CreateWashingModeDto = Type.Object({
  name: Type.String(),
  duration: Type.Number(),
  capacity: Type.Number(),
  price: Type.Number(),

  isActive: Type.Optional(Type.Boolean()),
});

export const UpdateWashingModeDto = Type.Object({
  name: Type.Optional(Type.String()),
  duration: Type.Optional(Type.Number()),
  capacity: Type.Optional(Type.Number()),
  price: Type.Optional(Type.Number()),

  isActive: Type.Optional(Type.Boolean()),
});

export const WashingModeQueryDto = Type.Object({
  search: Type.Optional(Type.String()),
  minDuration: Type.Optional(Type.Number()),
  maxDuration: Type.Optional(Type.Number()),
  minCapacity: Type.Optional(Type.Number()),
  maxCapacity: Type.Optional(Type.Number()),
  minPrice: Type.Optional(Type.Number()),
  maxPrice: Type.Optional(Type.Number()),
  isActive: Type.Optional(Type.Boolean()),
  page: Type.Optional(Type.Number()),
  limit: Type.Optional(Type.Number()),
  sortBy: Type.Optional(Type.String()),
  sortOrder: Type.Optional(Type.String()),
});

export type CreateWashingModeDto = Static<typeof CreateWashingModeDto>;
export type UpdateWashingModeDto = Static<typeof UpdateWashingModeDto>;
export type WashingModeQueryDto = Static<typeof WashingModeQueryDto>; 