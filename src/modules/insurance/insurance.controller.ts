import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentPatientAccount, PatientAuthGuard, type PatientAccountToken } from '../../common/auth/common-auth.module';
import {
  CheckServiceCoverDto,
  LinkInsurancePolicyDto,
  RequestInsuranceQuoteDto,
} from './dto/insurance.dto';
import { InsuranceService } from './insurance.service';

@ApiTags('insurance')
@Controller('insurance')
export class InsuranceController {
  constructor(private readonly insurance: InsuranceService) {}

  /** Insurance service overview (I01). */
  @Get('overview')
  getPublicOverview() {
    return this.insurance.getOverview();
  }

  /** Authenticated insurance overview with user's policy count. */
  @UseGuards(PatientAuthGuard)
  @Get('overview/me')
  getMyOverview(@CurrentPatientAccount() account: PatientAccountToken) {
    return this.insurance.getOverview(account.sub);
  }

  /** Available insurance products to explore (I02). */
  @Get('products')
  listProducts() {
    return this.insurance.listProducts();
  }

  /** Specific insurance product details. */
  @Get('products/:id')
  getProductById(@Param('id', ParseUUIDPipe) id: string) {
    return this.insurance.getProductById(id);
  }

  /** Request a quote and continuation to authorized underwriter. */
  @Post('quotes')
  requestQuote(@Body() body: RequestInsuranceQuoteDto) {
    return this.insurance.requestQuote(body);
  }

  /** List supported insurance providers for policy linking. */
  @Get('providers')
  listProviders() {
    return this.insurance.listProviders();
  }

  /** Link an existing policy to account (I03). */
  @UseGuards(PatientAuthGuard)
  @Post('policies/link')
  linkPolicy(
    @CurrentPatientAccount() account: PatientAccountToken,
    @Body() body: LinkInsurancePolicyDto,
  ) {
    return this.insurance.linkPolicy(account.sub, body);
  }

  /** Check whether a service is funded by a linked policy (I03). */
  @UseGuards(PatientAuthGuard)
  @Post('check-cover')
  checkCover(
    @CurrentPatientAccount() account: PatientAccountToken,
    @Body() body: CheckServiceCoverDto,
  ) {
    return this.insurance.checkCoverForService(account.sub, body);
  }

  /** List patient's linked policies (I04). */
  @UseGuards(PatientAuthGuard)
  @Get('my-policies')
  listMyPolicies(@CurrentPatientAccount() account: PatientAccountToken) {
    return this.insurance.listMyPolicies(account.sub);
  }

  /** Get details of a linked policy (I04). */
  @UseGuards(PatientAuthGuard)
  @Get('my-policies/:id')
  getMyPolicyById(
    @CurrentPatientAccount() account: PatientAccountToken,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.insurance.getMyPolicyById(account.sub, id);
  }

  /** Unlink a policy. */
  @UseGuards(PatientAuthGuard)
  @Delete('my-policies/:id')
  unlinkPolicy(
    @CurrentPatientAccount() account: PatientAccountToken,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.insurance.unlinkPolicy(account.sub, id);
  }

  /** Claims guidance and provider contact directory. */
  @Get('claims-support')
  getClaimsSupport() {
    return this.insurance.getClaimsSupport();
  }
}
