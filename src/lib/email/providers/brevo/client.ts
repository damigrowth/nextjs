/**
 * Brevo API Client
 *
 * Native fetch-based client for Brevo API (no Axios/SDK dependency)
 */

import { BrevoConfig } from './types';

const BREVO_API_URL = 'https://api.brevo.com/v3';

class BrevoClient {
  private static instance: BrevoClient;
  private config: BrevoConfig;
  private isInitialized: boolean = false;

  private constructor() {
    // Initialize config from environment
    this.config = {
      apiKey: process.env.BREVO_API_KEY || '',
      defaultSender: {
        name: process.env.BREVO_SENDER_NAME || 'Doulitsa',
        email: process.env.BREVO_SENDER_EMAIL || 'noreply@doulitsa.gr',
      },
      environment:
        (process.env.NODE_ENV as 'production' | 'development') || 'development',
    };
  }

  public static getInstance(): BrevoClient {
    if (!BrevoClient.instance) {
      BrevoClient.instance = new BrevoClient();
    }
    return BrevoClient.instance;
  }

  /**
   * Initialize the Brevo client with API credentials
   */
  public initialize(): void {
    if (this.isInitialized) {
      return;
    }

    if (!this.config.apiKey) {
      console.warn(
        'Brevo API key not configured. Email features will be limited.',
      );
      return;
    }

    this.isInitialized = true;
    console.log('Brevo client initialized');
  }

  /**
   * Check if Brevo client is properly configured
   */
  public isConfigured(): boolean {
    return !!(this.config.apiKey && this.isInitialized);
  }

  /**
   * Send transactional email via Brevo API
   */
  public async sendTransactionalEmail(params: {
    to: Array<{ email: string; name?: string }>;
    sender: { email: string; name: string };
    subject: string;
    htmlContent: string;
    textContent?: string;
    replyTo?: { email: string };
    tags?: string[];
  }): Promise<{ messageId: string }> {
    this.ensureInitialized();

    const response = await fetch(`${BREVO_API_URL}/smtp/email`, {
      method: 'POST',
      headers: {
        'api-key': this.config.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Brevo API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`
      );
    }

    const result = await response.json();
    return result;
  }

  /**
   * Get the default sender configuration
   */
  public getDefaultSender(): { name: string; email: string } {
    return this.config.defaultSender;
  }

  /**
   * Get the current environment
   */
  public getEnvironment(): string {
    return this.config.environment || 'development';
  }

  /**
   * Test the Brevo connection
   */
  public async testConnection(): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      this.ensureInitialized();

      const response = await fetch(`${BREVO_API_URL}/account`, {
        method: 'GET',
        headers: {
          'api-key': this.config.apiKey,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }

      const account = await response.json();

      return {
        success: true,
        message: `Connected to Brevo account: ${account.companyName || account.email}`,
      };
    } catch (error) {
      console.error('Brevo connection test failed:', error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Failed to connect to Brevo',
      };
    }
  }

  /**
   * Ensure the client is initialized before making API calls
   */
  private ensureInitialized(): void {
    if (!this.isInitialized) {
      this.initialize();
    }

    if (!this.isConfigured()) {
      throw new Error(
        'Brevo client is not properly configured. Check your API credentials.',
      );
    }
  }

  /**
   * Get account information
   */
  public async getAccountInfo(): Promise<any> {
    try {
      this.ensureInitialized();

      const response = await fetch(`${BREVO_API_URL}/account`, {
        method: 'GET',
        headers: {
          'api-key': this.config.apiKey,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get Brevo account info:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const brevoClient = BrevoClient.getInstance();

// Try to initialize on module load, but don't fail if it errors
// The client will try again when actually used
try {
  brevoClient.initialize();
} catch (error) {
  console.warn('Brevo client initialization deferred:', error);
}
