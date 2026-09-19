// supabase/functions/_shared/sap.ts
// Reusable SAP Service Layer client for Edge Functions

export class SAPServiceLayerClient {
  private baseUrl: string;
  private companyDb: string;
  private username: string;
  private password: string;
  private sessionId: string | null = null;
  private sessionTimeout: number | null = null;

  constructor() {
    this.baseUrl = (Deno.env.get("SAP_SERVICE_LAYER_URL") || "").replace(/\/$/, "");
    this.companyDb = Deno.env.get("SAP_COMPANY_DB") || "";
    this.username = Deno.env.get("SAP_USERNAME") || "";
    this.password = Deno.env.get("SAP_PASSWORD") || "";
  }

  public async login(): Promise<boolean> {
    const loginUrl = `${this.baseUrl}/Login`;
    const payload = {
      CompanyDB: this.companyDb,
      UserName: this.username,
      Password: this.password,
    };

    try {
      const response = await fetch(loginUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // Do not log the full raw error to avoid exposing secrets
        console.error(`SAP login failed with status: ${response.status}`);
        throw new Error(`SAP login failed with status: ${response.status}`);
      }

      // Extract B1SESSION cookie from headers
      // Note: Fetch API combines multiple set-cookie headers into one string separated by commas.
      const setCookieHeader = response.headers.get("set-cookie");
      if (!setCookieHeader) {
        throw new Error("No session cookie received from SAP");
      }

      // Parse B1SESSION
      const b1Match = setCookieHeader.match(/B1SESSION=([^;,\s]+)/);
      if (b1Match && b1Match[1]) {
        this.sessionId = b1Match[1];
        // Valid for 30 minutes, refresh at 25
        this.sessionTimeout = Date.now() + 25 * 60 * 1000;
        return true;
      } else {
        throw new Error("B1SESSION cookie not found in response");
      }
    } catch (error) {
      console.error("SAP login encountered a network/fetch error:", error);
      throw error;
    }
  }

  private async ensureSession(): Promise<void> {
    // In Edge Functions, instances are usually per-request, 
    // so this will typically trigger a login-per-request.
    // If instance is cached globally, it acts as an in-memory cache for the cold start.
    if (this.sessionId && this.sessionTimeout && Date.now() < this.sessionTimeout) {
      return;
    }
    await this.login();
  }

  private getHeaders(): HeadersInit {
    if (!this.sessionId) {
      throw new Error("No active session");
    }
    return {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Cookie": `B1SESSION=${this.sessionId}`,
      "Prefer": "odata.maxpagesize=100",
    };
  }

  public async get(endpoint: string, params?: Record<string, string | number>): Promise<any> {
    await this.ensureSession();

    let url = `${this.baseUrl}/${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        searchParams.append(key, String(value));
      }
      url += `?${searchParams.toString()}`;
    }

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.sessionId = null; // Force re-login on next request
        }
        // Return a safe error message without exposing SAP stack traces
        console.error(`SAP GET failed with status: ${response.status}`);
        throw new Error(`SAP request error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("SAP GET network/fetch error");
      throw error;
    }
  }
}
