import { createZodDto } from '../../../common/validation/zod-dto';
import { z } from 'zod';

export const RequestInsuranceQuoteSchema = z.object({
  productId: z.string().uuid().optional(),
  productCode: z.string().optional(),
  age: z.number().int().min(18).max(100),
  postcode: z.string().min(2).max(20),
  coverageLevel: z.enum(['individual', 'couple', 'family']).default('individual'),
  email: z.string().email(),
  phone: z.string().optional(),
});
export class RequestInsuranceQuoteDto extends createZodDto(RequestInsuranceQuoteSchema) {}

export const LinkInsurancePolicySchema = z.object({
  providerName: z.string().min(2).max(100),
  policyNumber: z.string().min(3).max(100),
  policyHolderName: z.string().min(2).max(100),
  dateOfBirth: z.string().optional(),
  postalCode: z.string().optional(),
});
export class LinkInsurancePolicyDto extends createZodDto(LinkInsurancePolicySchema) {}

export const CheckServiceCoverSchema = z.object({
  policyId: z.string().uuid(),
  serviceCode: z.string().min(2).max(100), // e.g. 'gp-consultation', 'care-assessment', 'menopause-review'
});
export class CheckServiceCoverDto extends createZodDto(CheckServiceCoverSchema) {}
