/**
 * Payment gateway abstraction. Each gateway implements this interface:
 *   - createPayment({ amount, description, callbackUrl, ... }) -> { authority, gatewayUrl }
 *   - verifyPayment({ authority, amount }) -> { success, referenceId, raw }
 *   - refundPayment({ referenceId, amount }) -> { success, raw }   (structure only)
 *
 * Adding a new gateway = create a class implementing these methods and register
 * it in the factory (./index.js).
 */
class PaymentGateway {
  get name() {
    return 'base';
  }

  // eslint-disable-next-line no-unused-vars
  async createPayment({ amount, description, callbackUrl, mobile, email }) {
    throw new Error('createPayment() not implemented');
  }

  // eslint-disable-next-line no-unused-vars
  async verifyPayment({ authority, amount }) {
    throw new Error('verifyPayment() not implemented');
  }

  // eslint-disable-next-line no-unused-vars
  async refundPayment({ referenceId, amount, reason }) {
    // Default: not supported. Override in gateways that support refunds.
    return { success: false, supported: false };
  }
}

module.exports = PaymentGateway;
