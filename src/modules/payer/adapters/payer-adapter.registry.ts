import { Injectable } from '@nestjs/common';

import { AppException } from '../../../common/errors/app-exception';
import { FakePayerAdapter } from './fake-payer.adapter';
import type { PayerAdapter } from './payer-adapter.interface';

/**
 * Looks up the adapter for a payer by code. A real payer's adapter is registered here the same
 * way `FakePayerAdapter` is — by injecting it and adding it to the list below — never by adding
 * conditional logic elsewhere in the codebase.
 */
@Injectable()
export class PayerAdapterRegistry {
  private readonly adapters = new Map<string, PayerAdapter>();

  constructor(fakePayerAdapter: FakePayerAdapter) {
    this.register(fakePayerAdapter);
  }

  register(adapter: PayerAdapter): void {
    this.adapters.set(adapter.payerCode, adapter);
  }

  get(payerCode: string): PayerAdapter {
    const adapter = this.adapters.get(payerCode);
    if (!adapter) {
      throw new AppException(
        'PAYER_ADAPTER_NOT_CONFIGURED',
        'This payer is not yet connected. Please pay directly, or try again later.',
        502,
      );
    }
    return adapter;
  }
}
