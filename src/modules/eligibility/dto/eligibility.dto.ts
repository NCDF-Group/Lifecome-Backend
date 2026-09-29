import { createZodDto } from '../../../common/validation/zod-dto';
import { PaginationQuerySchema } from '../../../common/dto/pagination.dto';
import { z } from 'zod';

export const EligibilityStatusSchema = z.enum([
  'covered',
  'co_pay',
  'pre_authorisation_required',
  'excluded',
  'benefit_limit_reached',
  'payer_unavailable',
]);

export const ListEligibilityChecksQuerySchema = PaginationQuerySchema.extend({
  status: EligibilityStatusSchema.optional(),
});
export class ListEligibilityChecksQueryDto extends createZodDto(ListEligibilityChecksQuerySchema) {}

export const CheckEligibilitySchema = z.object({
  membershipId: z.uuid(),
  clinicalServiceCode: z.string().min(1),
});
export class CheckEligibilityDto extends createZodDto(CheckEligibilitySchema) {}
