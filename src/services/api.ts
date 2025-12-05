/**
 * === DOC_START :: VERSION=1.0 :: TYPE=FILE_DOCUMENTATION ===
 *
 * IDENTITY:
 *   file: "src/services/api.ts"
 *   type: "service"
 *   layer: "frontend"
 *   domain: "api"
 *   purpose: "Cliente HTTP singleton para comunicación con backend API Gateway, maneja endpoints de simulación y health check"
 *
 * DEPENDENCIES:
 *   internal: ["@/types"]
 *   external: []
 *   infrastructure: ["fetch-api", "vite-proxy"]
 *
 * CONTRACTS:
 *   exports: ["apiClient", "ApiClient"]
 *   inputs: ["ClientMessageRequest", "ClientToggleRequest", "ExtensionToggleRequest", "ExtensionLatencyRequest"]
 *   outputs: ["HealthStatus", "SimulationStatus", "ClientMessageResponse", "ClientToggleResponse", "ExtensionToggleResponse", "ExtensionLatencyResponse"]
 *   errors: ["Error"]
 *
 * INTEGRATION:
 *   data_flow: "[UI Component] → [ApiClient method] → [fetch] → [Backend /api/*] → [ApiResponse] → [UI Component]"
 *   events_emitted: []
 *   events_consumed: []
 *
 * IMPACT:
 *   used_by: ["components/workspace", "stores/*", "hooks/*"]
 *   uses: ["types"]
 *   critical: true
 *
 * === DOC_END :: api.ts ===
 */

/**
 * API Client for INHOST API Gateway
 *
 * Endpoints:
 * - GET /health
 *
 * Base URL: http://localhost:3000
 * Proxy: /api -> http://localhost:3000 (via Vite)
 */

import type {
  ApiResponse,
  HealthStatus,
} from '@/types';

const API_BASE = '/api'; // Proxied to localhost:3000 by Vite

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// API CLIENT CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // HEALTH CHECK
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * GET /health
   * Health check detallado con verificación de servicios
   */
  async getHealth(): Promise<HealthStatus> {
    const response = await fetch(`${this.baseUrl}/health`);

    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }

    const json: ApiResponse<HealthStatus> = await response.json();

    if (!json.success || !json.data) {
      throw new Error(json.error?.message || 'Health check failed');
    }

    return json.data;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT SINGLETON
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const apiClient = new ApiClient(API_BASE);
