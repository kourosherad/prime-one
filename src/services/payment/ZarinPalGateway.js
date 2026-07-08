/**
 * ZarinPal gateway implementation (v4 REST API).
 *
 * Sandbox: when ZARINPAL_SANDBOX=true, ZarinPal's merchant "00000000-..." flow
 * is used and the sandbox gateway URL (zarin.link) is returned.
 *
 * Docs: https://docs.zarinpal.com/payment-gateway/integration/
 */
const axios = require('axios');
const PaymentGateway = require('./PaymentGateway');
const env = require('../../config/env');
const logger = require('../../config/logger');

class ZarinPalGateway extends PaymentGateway {
  constructor(cfg = env.zarinpal) {
    super();
    this.cfg = cfg;
    this.client = axios.create({ timeout: 15000 });
  }

  get name() {
    return 'zarinpal';
  }

  get merchantId() {
    return this.cfg.sandbox ? '00000000-0000-0000-0000-000000000000' : this.cfg.merchantId;
  }

  get gatewayBase() {
    return this.cfg.sandbox ? 'https://zarin.link/pv/' : this.cfg.gateway;
  }

  async createPayment({ amount, description, callbackUrl, mobile, email }) {
    const body = {
      merchant_id: this.merchantId,
      amount: Math.round(Number(amount)),
      description: description || 'Prime One payment',
      callback_url: callbackUrl,
      ...(mobile ? { mobile } : {}),
      ...(email ? { email } : {}),
    };

    logger.debug(`[zarinpal] createPayment request amount=${body.amount}`);
    const { data } = await this.client.post(this.cfg.requestUrl, body, {
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });

    // ZarinPal v4 returns { data: { code, authority, ... }, errors }
    const result = data?.data || {};
    const code = result.code;
    const authority = result.authority;

    // code 100 = OK (created)
    if (code !== 100 || !authority) {
      const errMsg = (data?.errors && JSON.stringify(data.errors)) || 'unknown error';
      throw new Error(`ZarinPal createPayment failed: code=${code} errors=${errMsg}`);
    }

    return {
      authority,
      gatewayUrl: `${this.gatewayBase}${authority}`,
      raw: data,
    };
  }

  async verifyPayment({ authority, amount }) {
    const body = {
      merchant_id: this.merchantId,
      amount: Math.round(Number(amount)),
      authority,
    };
    const { data } = await this.client.post(this.cfg.verifyUrl, body, {
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });

    const result = data?.data || {};
    // code 100 = verified; 101 = already verified (still success)
    const success = result.code === 100 || result.code === 101;
    return {
      success,
      referenceId: success ? String(result.ref_id || result.reference_id || '') : null,
      code: result.code,
      raw: data,
    };
  }

  // Refund is not supported via the public REST API in the same way; this is a
  // structural placeholder. Real refunds go through the merchant dashboard or
  // the (separate) reversal endpoint, which requires elevated credentials.
  async refundPayment() {
    return { success: false, supported: false, message: 'Use ZarinPal dashboard for refunds.' };
  }
}

module.exports = ZarinPalGateway;
