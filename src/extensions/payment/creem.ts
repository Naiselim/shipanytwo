import {
  PaymentProvider,
  PaymentConfigs,
  PaymentRequest,
  PaymentStatus,
  PaymentSession,
  PaymentWebhookResult,
} from ".";

/**
 * Creem payment provider configs
 * @docs https://docs.creem.io/
 */
export interface CreemConfigs extends PaymentConfigs {
  apiKey: string;
  webhookSecret?: string;
  environment?: "sandbox" | "production";
}

/**
 * Creem payment provider implementation
 * @website https://creem.io/
 */
export class CreemProvider implements PaymentProvider {
  readonly name = "creem";
  configs: CreemConfigs;

  private baseUrl: string;

  constructor(configs: CreemConfigs) {
    this.configs = configs;
    this.baseUrl =
      configs.environment === "production"
        ? "https://api.creem.io"
        : "https://test-api.creem.io";
  }

  // create payment
  async createPayment(request: PaymentRequest): Promise<PaymentSession> {
    try {
      if (!request.productId) {
        throw new Error("productId is required");
      }

      // build payment payload
      const payload: any = {
        product_id: request.productId,
        request_id: request.requestId || undefined,
        units: 1,
        discount_code: request.discount
          ? {
              code: request.discount.code,
            }
          : undefined,
        customer: request.customer
          ? {
              id: request.customer.id,
              email: request.customer.email,
            }
          : undefined,
        custom_fields: request.customFields
          ? request.customFields.map((customField) => ({
              type: customField.type,
              key: customField.name,
              label: customField.label,
              optional: !customField.isRequired,
              text: customField.metadata,
            }))
          : undefined,
        success_url: request.successUrl,
        metadata: request.metadata,
      };

      const result = await this.makeRequest("/v1/checkouts", "POST", payload);

      // create payment failed
      if (result.error) {
        throw new Error(result.error.message || "create payment failed");
      }

      // create payment success
      return {
        success: true,
        provider: this.name,
        checkoutParams: payload,
        checkoutInfo: {
          sessionId: result.id,
          checkoutUrl: result.checkout_url,
        },
        checkoutResult: result,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "create payment failed",
        provider: this.name,
      };
    }
  }

  // get payment by session id
  // @docs https://docs.creem.io/api-reference/endpoint/get-checkout
  async getPayment({
    sessionId,
  }: {
    sessionId: string;
  }): Promise<PaymentSession> {
    try {
      if (!sessionId) {
        throw new Error("sessionId is required");
      }

      // retrieve payment
      const result = await this.makeRequest(
        `/v1/checkouts?checkout_id=${sessionId}`,
        "GET"
      );

      if (result.error) {
        throw new Error(result.error.message || "get payment failed");
      }

      // get payment success
      return {
        success: true,
        provider: this.name,
        paymentStatus: this.mapCreemStatus(result.status),
        paymentInfo: {
          discountCode: "",
          discountAmount: undefined,
          discountCurrency: undefined,
          paymentAmount: result.amount || 0,
          paymentCurrency: result.currency,
          paymentEmail: result.customer_email,
          paidAt: result.created ? new Date(result.created * 1000) : undefined,
        },
        paymentResult: result,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "get payment failed",
        provider: this.name,
      };
    }
  }

  async handleWebhook({
    rawBody,
    signature,
    headers,
  }: {
    rawBody: string | Buffer;
    signature?: string;
    headers?: Record<string, string>;
  }): Promise<PaymentWebhookResult> {
    try {
      if (!this.configs.webhookSecret) {
        throw new Error("webhookSecret not configured");
      }

      // parse the webhook payload
      const payload =
        typeof rawBody === "string"
          ? JSON.parse(rawBody)
          : JSON.parse(rawBody.toString());

      // Verify webhook signature if provided
      if (signature && this.configs.webhookSecret) {
        const crypto = require("crypto");
        const expectedSignature = crypto
          .createHmac("sha256", this.configs.webhookSecret)
          .update(rawBody)
          .digest("hex");

        if (signature !== expectedSignature) {
          throw new Error("Invalid webhook signature");
        }
      }

      // Process the webhook event
      console.log(`Creem webhook event: ${payload.event_type}`, payload.data);

      return {
        success: true,
        acknowledged: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        acknowledged: false,
      };
    }
  }

  private async makeRequest(endpoint: string, method: string, data?: any) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      "x-api-key": this.configs.apiKey,
      "Content-Type": "application/json",
    };

    const config: RequestInit = {
      method,
      headers,
    };

    if (data) {
      config.body = JSON.stringify(data);
    }

    const response = await fetch(url, config);
    if (!response.ok) {
      throw new Error(`request failed with status: ${response.status}`);
    }

    return await response.json();
  }

  private mapCreemStatus(status: string): PaymentStatus {
    switch (status) {
      case "pending":
        return PaymentStatus.PROCESSING;
      case "processing":
        return PaymentStatus.PROCESSING;
      case "completed":
      case "paid":
        return PaymentStatus.SUCCESS;
      case "failed":
        return PaymentStatus.FAILED;
      case "cancelled":
      case "expired":
        return PaymentStatus.CANCELLED;
      default:
        throw new Error(`Unknown Creem status: ${status}`);
    }
  }
}

/**
 * Create Creem provider with configs
 */
export function createCreemProvider(configs: CreemConfigs): CreemProvider {
  return new CreemProvider(configs);
}
