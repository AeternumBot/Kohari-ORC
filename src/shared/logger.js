/**
 * Logger - Sistema de logs con niveles
 * Kohari TOOLS - Modular Architecture
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

class Logger {
  constructor(minLevel = LOG_LEVELS.INFO) {
    this.minLevel = minLevel;
    this.logs = [];
    this.maxLogs = 500; // Mantener los últimos 500 logs en memoria
  }

  /**
   * Cambia el nivel mínimo de logging
   * @param {string|number} level - 'debug', 'info', 'warn', 'error' o número
   */
  setLevel(level) {
    if (typeof level === 'string') {
      this.minLevel = LOG_LEVELS[level.toUpperCase()] || LOG_LEVELS.INFO;
    } else {
      this.minLevel = level;
    }
  }

  /**
   * Log genérico
   * @private
   * @param {string} level - Nivel del log
   * @param {any} args - Argumentos a loguear
   */
  _log(level, ...args) {
    const logLevel = LOG_LEVELS[level.toUpperCase()];
    if (logLevel == null || logLevel < this.minLevel) return;

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level}]`;

    // Formatear mensaje
    const message = args.map(arg => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg);
        } catch {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ');

    // Mostrar en consola
    const consoleMethod = {
      DEBUG: 'debug',
      INFO: 'info',
      WARN: 'warn',
      ERROR: 'error'
    }[level] || 'log';

    console[consoleMethod](`${prefix} ${message}`);

    // Guardar en historial
    this.logs.push({
      timestamp,
      level,
      message,
      args
    });

    // Limitar tamaño del historial
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  debug(...args) {
    this._log('DEBUG', ...args);
  }

  info(...args) {
    this._log('INFO', ...args);
  }

  warn(...args) {
    this._log('WARN', ...args);
  }

  error(...args) {
    this._log('ERROR', ...args);
  }

  /**
   * Obtiene el historial de logs
   * @param {string} level - Filtrar por nivel (opcional)
   * @param {number} limit - Cantidad de logs a retornar
   * @returns {Array}
   */
  getHistory(level = null, limit = 50) {
    let logs = this.logs;

    if (level) {
      const levelUpper = level.toUpperCase();
      logs = logs.filter(l => l.level === levelUpper);
    }

    return logs.slice(-limit);
  }

  /**
   * Exporta logs como JSON
   * @returns {string}
   */
  exportJSON() {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Limpia el historial de logs
   */
  clear() {
    this.logs = [];
  }

  /**
   * Obtiene estadísticas de logs
   * @returns {Object}
   */
  getStats() {
    const stats = {
      total: this.logs.length,
      DEBUG: 0,
      INFO: 0,
      WARN: 0,
      ERROR: 0
    };

    this.logs.forEach(log => {
      stats[log.level]++;
    });

    return stats;
  }
}

export default new Logger(LOG_LEVELS.INFO);
