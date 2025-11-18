/**
 * API Client for INHOST API Gateway
 * CONTRATO ESTRICTO - Endpoints de Simulación
 *
 * Endpoints:
 * - POST /simulate/client-message
 * - POST /simulate/client-toggle
 * - POST /simulate/extension-toggle
 * - PATCH /simulate/extension-latency
 * - GET /simulate/status
 * - GET /health
 *
 * Base URL: http://localhost:3000
 * Proxy: /api -> http://localhost:3000 (via Vite)
 */

import type {
  ApiResponse,
  HealthStatus,
  SimulationStatus,
  ClientMessageRequest,
  ClientMessageResponse,
  ClientToggleRequest,
  ClientToggleResponse,
  ExtensionToggleRequest,
  ExtensionToggleResponse,
  ExtensionLatencyRequest,
  ExtensionLatencyResponse,
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

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SIMULATION ENDPOINTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * POST /simulate/client-message
   * Simula un mensaje entrante desde un cliente externo
   *
   * Broadcast WebSocket automático:
   * - message_received (mensaje original)
   * - message_processing (durante procesamiento)
   * - extension_response (por cada respuesta de extensión)
   */
  async sendClientMessage(
    request: ClientMessageRequest
  ): Promise<ClientMessageResponse> {
    const response = await fetch(`${this.baseUrl}/simulate/client-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const json: ApiResponse = await response.json().catch(() => ({}));
      throw new Error(
        json.error?.message || `Failed to send message: ${response.statusText}`
      );
    }

    const json: ApiResponse<ClientMessageResponse> = await response.json();

    if (!json.success || !json.data) {
      throw new Error(json.error?.message || 'Failed to send message');
    }

    return json.data;
  }

  /**
   * POST /simulate/client-toggle
   * Conectar/desconectar un cliente simulado
   *
   * Broadcast WebSocket automático:
   * - client_toggle
   */
  async toggleClient(
    request: ClientToggleRequest
  ): Promise<ClientToggleResponse> {
    const response = await fetch(`${this.baseUrl}/simulate/client-toggle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const json: ApiResponse = await response.json().catch(() => ({}));
      throw new Error(
        json.error?.message || `Failed to toggle client: ${response.statusText}`
      );
    }

    const json: ApiResponse<ClientToggleResponse> = await response.json();

    if (!json.success || !json.data) {
      throw new Error(json.error?.message || 'Failed to toggle client');
    }

    return json.data;
  }

  /**
   * POST /simulate/extension-toggle
   * Activar/desactivar una extensión
   *
   * Broadcast WebSocket automático:
   * - extension_toggle
   */
  async toggleExtension(
    request: ExtensionToggleRequest
  ): Promise<ExtensionToggleResponse> {
    const response = await fetch(`${this.baseUrl}/simulate/extension-toggle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const json: ApiResponse = await response.json().catch(() => ({}));
      throw new Error(
        json.error?.message || `Failed to toggle extension: ${response.statusText}`
      );
    }

    const json: ApiResponse<ExtensionToggleResponse> = await response.json();

    if (!json.success || !json.data) {
      throw new Error(json.error?.message || 'Failed to toggle extension');
    }

    return json.data;
  }

  /**
   * PATCH /simulate/extension-latency
   * Actualizar latencia simulada de una extensión
   */
  async updateExtensionLatency(
    request: ExtensionLatencyRequest
  ): Promise<ExtensionLatencyResponse> {
    const response = await fetch(`${this.baseUrl}/simulate/extension-latency`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const json: ApiResponse = await response.json().catch(() => ({}));
      throw new Error(
        json.error?.message || `Failed to update latency: ${response.statusText}`
      );
    }

    const json: ApiResponse<ExtensionLatencyResponse> = await response.json();

    if (!json.success || !json.data) {
      throw new Error(json.error?.message || 'Failed to update latency');
    }

    return json.data;
  }

  /**
   * GET /simulate/status
   * Obtener estado completo del sistema de simulación
   */
  async getSimulationStatus(): Promise<SimulationStatus> {
    const response = await fetch(`${this.baseUrl}/simulate/status`);

    if (!response.ok) {
      throw new Error(`Failed to get simulation status: ${response.statusText}`);
    }

    const json: ApiResponse<SimulationStatus> = await response.json();

    if (!json.success || !json.data) {
      throw new Error(json.error?.message || 'Failed to get simulation status');
    }

    return json.data;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // UTILITIES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Helper: Manejar errores de API con información detallada
   */
  private handleApiError(error: unknown, context: string): never {
    if (error instanceof Error) {
      throw new Error(`${context}: ${error.message}`);
    }
    throw new Error(`${context}: Unknown error`);
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT SINGLETON
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const apiClient = new ApiClient(API_BASE);
