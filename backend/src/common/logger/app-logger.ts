import { LoggerService, LogLevel } from '@nestjs/common';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { createLogger, format, transports, Logger as WinstonLogger } from 'winston';

type AppLogMeta = Record<string, unknown>;

export class AppLogger implements LoggerService {
  private readonly logger: WinstonLogger;

  constructor(logDir = path.resolve(process.cwd(), 'logs')) {
    fs.mkdirSync(logDir, { recursive: true });

    this.logger = createLogger({
      level: process.env.LOG_LEVEL ?? 'info',
      format: format.combine(format.timestamp(), format.errors({ stack: true }), format.json()),
      transports: [
        new transports.Console(),
        new transports.File({
          filename: path.join(logDir, 'app.jsonl'),
        }),
      ],
    });
  }

  log(message: unknown, context?: string) {
    this.logger.info(this.toMessage(message), { context });
  }

  error(message: unknown, trace?: string, context?: string) {
    this.logger.error(this.toMessage(message), { context, trace });
  }

  warn(message: unknown, context?: string) {
    this.logger.warn(this.toMessage(message), { context });
  }

  debug(message: unknown, context?: string) {
    this.logger.debug(this.toMessage(message), { context });
  }

  verbose(message: unknown, context?: string) {
    this.logger.verbose(this.toMessage(message), { context });
  }

  setLogLevels?(levels: LogLevel[]) {
    // Winston handles levels via `level`; keep for Nest compatibility.
    const highest = levels[0] ?? 'log';
    this.logger.level =
      highest === 'log' ? 'info' : highest === 'verbose' ? 'verbose' : highest;
  }

  child(meta: AppLogMeta) {
    const base = this.logger;
    return {
      log: (message: unknown, context?: string) =>
        base.info(this.toMessage(message), { ...meta, context }),
      error: (message: unknown, trace?: string, context?: string) =>
        base.error(this.toMessage(message), { ...meta, context, trace }),
      warn: (message: unknown, context?: string) =>
        base.warn(this.toMessage(message), { ...meta, context }),
      debug: (message: unknown, context?: string) =>
        base.debug(this.toMessage(message), { ...meta, context }),
      verbose: (message: unknown, context?: string) =>
        base.verbose(this.toMessage(message), { ...meta, context }),
    } satisfies LoggerService;
  }

  private toMessage(message: unknown) {
    if (typeof message === 'string') return message;
    try {
      return JSON.stringify(message);
    } catch {
      return String(message);
    }
  }
}

