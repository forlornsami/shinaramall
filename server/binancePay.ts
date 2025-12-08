import crypto from 'crypto';

interface BinancePayConfig {
  apiKey: string;
  secretKey: string;
  baseUrl?: string;
}

interface CreateOrderRequest {
  merchantTradeNo: string;
  orderAmount: number;
  currency: string;
  description: string;
  goodsDetails?: Array<{
    goodsType: string;
    goodsCategory: string;
    referenceGoodsId: string;
    goodsName: string;
    goodsDetail?: string;
  }>;
  returnUrl?: string;
  cancelUrl?: string;
  webhookUrl?: string;
}

interface BinancePayOrderResponse {
  status: string;
  code: string;
  data?: {
    prepayId: string;
    tradeType: string;
    expireTime: number;
    qrcodeLink?: string;
    qrContent?: string;
    checkoutUrl: string;
    deeplink?: string;
    universalUrl?: string;
  };
  errorMessage?: string;
}

export class BinancePayService {
  private apiKey: string;
  private secretKey: string;
  private baseUrl: string;

  constructor(config: BinancePayConfig) {
    this.apiKey = config.apiKey;
    this.secretKey = config.secretKey;
    this.baseUrl = config.baseUrl || 'https://bpay.binanceapi.com';
  }

  private generateNonce(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  private generateTimestamp(): string {
    return Date.now().toString();
  }

  private generateSignature(timestamp: string, nonce: string, body: string): string {
    const payload = `${timestamp}\n${nonce}\n${body}\n`;
    return crypto
      .createHmac('sha512', this.secretKey)
      .update(payload)
      .digest('hex')
      .toUpperCase();
  }

  async createOrder(orderData: CreateOrderRequest): Promise<BinancePayOrderResponse> {
    const endpoint = '/binancepay/openapi/v3/order';
    const timestamp = this.generateTimestamp();
    const nonce = this.generateNonce();
    
    const requestBody = {
      env: {
        terminalType: 'WEB'
      },
      merchantTradeNo: orderData.merchantTradeNo,
      orderAmount: orderData.orderAmount,
      currency: orderData.currency,
      description: orderData.description,
      goodsDetails: orderData.goodsDetails || [{
        goodsType: '01',
        goodsCategory: 'D000',
        referenceGoodsId: orderData.merchantTradeNo,
        goodsName: 'Eshaal Store Order',
        goodsDetail: orderData.description
      }],
      returnUrl: orderData.returnUrl,
      cancelUrl: orderData.cancelUrl,
      webhookUrl: orderData.webhookUrl
    };

    const body = JSON.stringify(requestBody);
    const signature = this.generateSignature(timestamp, nonce, body);

    const headers = {
      'Content-Type': 'application/json',
      'BinancePay-Timestamp': timestamp,
      'BinancePay-Nonce': nonce,
      'BinancePay-Certificate-SN': this.apiKey,
      'BinancePay-Signature': signature
    };

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers,
        body
      });

      const result = await response.json() as BinancePayOrderResponse;
      
      if (result.status !== 'SUCCESS' || result.code !== '000000') {
        console.error('Binance Pay API error:', result);
        throw new Error(result.errorMessage || 'Failed to create Binance Pay order');
      }

      return result;
    } catch (error) {
      console.error('Binance Pay API request failed:', error);
      throw error;
    }
  }

  verifyWebhookSignature(
    timestamp: string,
    nonce: string,
    body: string,
    signature: string
  ): boolean {
    const expectedSignature = this.generateSignature(timestamp, nonce, body);
    return expectedSignature === signature;
  }
}

export function createBinancePayService(): BinancePayService | null {
  const apiKey = process.env.BINANCE_PAY_API_KEY;
  const secretKey = process.env.BINANCE_PAY_SECRET_KEY;

  if (!apiKey || !secretKey) {
    console.warn('Binance Pay API credentials not configured');
    return null;
  }

  return new BinancePayService({
    apiKey,
    secretKey
  });
}
