/**
 * Persistent Logger Service
 * Almacena logs en IndexedDB para debugging de fallos
 *
 * Niveles de log:
 * - debug: Información detallada para debugging
 * - info: Eventos importantes del sistema
 * - warn: Situaciones inesperadas pero manejables
 * - error: Errores que requieren atención
 * - critical: Fallos críticos del sistema
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

export interface LogEntry {
  id: string; // UUID
  timestamp: string; // ISO 8601
  level: LogLevel;
  category: string; // 'websocket', 'api', 'db', 'ui', 'store'
  message: string;
  context?: {
    messageId?: string;
    conversationId?: string;
    event?: string;
    userId?: string;
    [key: string]: unknown;
  };
  stack?: string; // Stack trace for errors
}

interface LoggerDB extends DBSchema {
  logs: {
    key: string;
    value: LogEntry;
    indexes: {
      timestamp: string;
      level: LogLevel;
      category: string;
    };
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LOGGER SERVICE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class Logger {
  private db: IDBPDatabase<LoggerDB> | null = null;
  private initPromise: Promise<void> | null = null;
  private consoleEnabled = true;
  private maxLogs = 10000; // Maximum logs to keep in IndexedDB

  /**
   * Initialize IndexedDB for logs
   */
  async init(): Promise<void> {
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        this.db = await openDB<LoggerDB>('inhost-logs', 1, {
          upgrade(db) {
            // Create logs store with indexes
            const logsStore = db.createObjectStore('logs', { keyPath: 'id' });
            logsStore.createIndex('timestamp', 'timestamp');
            logsStore.createIndex('level', 'level');
            logsStore.createIndex('category', 'category');
          },
        });

        console.log('✅ Logger IndexedDB initialized');
      } catch (error) {
        console.error('❌ Failed to initialize logger DB:', error);
        throw error;
      }
    })();

    return this.initPromise;
  }

  /**
   * Log a message
   */
  private async log(
    level: LogLevel,
    category: string,
    message: string,
    context?: LogEntry['context']
  ): Promise<void> {
    // Ensure DB is initialized
    if (!this.db) {
      await this.init();
    }

    if (!this.db) {
      console.error('Logger DB not available');
      return;
    }

    const entry: LogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      context,
    };

    // Capture stack trace for errors
    if (level === 'error' || level === 'critical') {
      entry.stack = new Error().stack;
    }

    try {
      // Store in IndexedDB
      await this.db.add('logs', entry);

      // Clean up old logs if exceeding max
      await this.cleanup();

      // Also log to console if enabled
      if (this.consoleEnabled) {
        this.logToConsole(entry);
      }
    } catch (error) {
      console.error('Failed to persist log:', error);
    }
  }

  /**
   * Log to console with formatting
   */
  private logToConsole(entry: LogEntry): void {
    const prefix = `[${entry.category.toUpperCase()}]`;
    const contextStr = entry.context ? ` ${JSON.stringify(entry.context)}` : '';
    const fullMessage = `${prefix} ${entry.message}${contextStr}`;

    switch (entry.level) {
      case 'debug':
        console.debug(fullMessage);
        break;
      case 'info':
        console.info(fullMessage);
        break;
      case 'warn':
        console.warn(fullMessage);
        break;
      case 'error':
      case 'critical':
        console.error(fullMessage, entry.stack);
        break;
    }
  }

  /**
   * Clean up old logs if exceeding maxLogs
   */
  private async cleanup(): Promise<void> {
    if (!this.db) return;

    try {
      const count = await this.db.count('logs');

      if (count > this.maxLogs) {
        // Get oldest logs and delete them
        const tx = this.db.transaction('logs', 'readwrite');
        const index = tx.store.index('timestamp');
        const oldLogs = await index.getAll(undefined, count - this.maxLogs);

        for (const log of oldLogs) {
          await tx.store.delete(log.id);
        }

        await tx.done;
        console.log(`🗑️ Cleaned up ${oldLogs.length} old logs`);
      }
    } catch (error) {
      console.error('Failed to cleanup logs:', error);
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PUBLIC METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  debug(category: string, message: string, context?: LogEntry['context']): void {
    this.log('debug', category, message, context);
  }

  info(category: string, message: string, context?: LogEntry['context']): void {
    this.log('info', category, message, context);
  }

  warn(category: string, message: string, context?: LogEntry['context']): void {
    this.log('warn', category, message, context);
  }

  error(category: string, message: string, context?: LogEntry['context']): void {
    this.log('error', category, message, context);
  }

  critical(category: string, message: string, context?: LogEntry['context']): void {
    this.log('critical', category, message, context);
  }

  /**
   * Get logs with filters
   */
  async getLogs(filters?: {
    level?: LogLevel;
    category?: string;
    limit?: number;
    since?: string; // ISO timestamp
  }): Promise<LogEntry[]> {
    if (!this.db) {
      await this.init();
    }

    if (!this.db) return [];

    try {
      let logs: LogEntry[];

      if (filters?.level) {
        logs = await this.db.getAllFromIndex('logs', 'level', filters.level);
      } else if (filters?.category) {
        logs = await this.db.getAllFromIndex('logs', 'category', filters.category);
      } else {
        logs = await this.db.getAll('logs');
      }

      // Filter by timestamp if provided
      if (filters?.since) {
        logs = logs.filter((log) => log.timestamp >= filters.since!);
      }

      // Sort by timestamp descending (newest first)
      logs.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

      // Limit results
      if (filters?.limit) {
        logs = logs.slice(0, filters.limit);
      }

      return logs;
    } catch (error) {
      console.error('Failed to get logs:', error);
      return [];
    }
  }

  /**
   * Clear all logs
   */
  async clearLogs(): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    if (!this.db) return;

    try {
      await this.db.clear('logs');
      console.log('✅ All logs cleared');
    } catch (error) {
      console.error('Failed to clear logs:', error);
    }
  }

  /**
   * Export logs as JSON
   */
  async exportLogs(): Promise<string> {
    const logs = await this.getLogs();
    return JSON.stringify(logs, null, 2);
  }

  /**
   * Enable/disable console logging
   */
  setConsoleEnabled(enabled: boolean): void {
    this.consoleEnabled = enabled;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT SINGLETON
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const logger = new Logger();
