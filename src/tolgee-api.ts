export interface TolgeeKeyImport {
  name: string;
  namespace?: string;
  description?: string;
  translations?: Record<string, string>;
  tags?: string[];
}

export class TolgeeApi {
  private readonly baseUrl: string;
  private readonly headers: Record<string, string>;

  constructor(
    apiKey: string,
    private readonly projectId: string,
    baseUrl: string,
  ) {
    this.baseUrl = `${baseUrl}/v2`;
    this.headers = {
      "X-API-Key": apiKey,
      "Content-Type": "application/json",
    };
  }

  private async request(method: string, path: string, body?: unknown): Promise<unknown> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: this.headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Tolgee API ${res.status}: ${text}`);
    }
    if (res.status === 204) return null;
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  }

  async getKeys(filterKeys?: string[], namespace?: string, languages?: string[]): Promise<unknown> {
    const params = new URLSearchParams();
    filterKeys?.forEach((key) => params.append("filterKeyName", key));
    if (namespace) params.append("filterNamespace", namespace);
    languages?.forEach((lang) => params.append("languages", lang));
    const qs = params.toString();
    return this.request("GET", `/projects/${this.projectId}/translations${qs ? `?${qs}` : ""}`);
  }

  async createKeys(keys: TolgeeKeyImport[]): Promise<unknown> {
    return this.request("POST", `/projects/${this.projectId}/keys/import`, { keys });
  }
}
