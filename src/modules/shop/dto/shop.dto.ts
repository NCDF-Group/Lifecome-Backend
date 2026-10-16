import { createZodDto } from '../../../common/validation/zod-dto';
import { z } from 'zod';

export const ListProductsQuerySchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
});
export class ListProductsQueryDto extends createZodDto(ListProductsQuerySchema) {}

export const AddBasketItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1).max(99).default(1),
});
export class AddBasketItemDto extends createZodDto(AddBasketItemSchema) {}

export const UpdateBasketItemQuantitySchema = z.object({
  quantity: z.number().int().min(0).max(99),
});
export class UpdateBasketItemQuantityDto extends createZodDto(UpdateBasketItemQuantitySchema) {}

export const ShippingAddressSchema = z.object({
  recipientName: z.string().min(2).max(100),
  addressLine1: z.string().min(5).max(200),
  addressLine2: z.string().max(200).optional(),
  city: z.string().min(2).max(100),
  postcode: z.string().min(3).max(20),
  country: z.string().default('UK'),
  phone: z.string().min(5).max(30),
});
export class ShippingAddressDto extends createZodDto(ShippingAddressSchema) {}

export const CheckoutOrderSchema = z.object({
  shippingAddress: ShippingAddressSchema,
  paymentReference: z.string().optional(),
});
export class CheckoutOrderDto extends createZodDto(CheckoutOrderSchema) {}
