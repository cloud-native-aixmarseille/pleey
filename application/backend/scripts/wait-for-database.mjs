import { readFile } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const safeCodes = new Set(['ENOENT', 'EACCES', 'ECONNREFUSED', 'ETIMEDOUT', 'P1000', 'P1001', 'P1002', 'P1011', 'P2010']);

export class DatabaseReadiness {
  constructor({
    readSecret = (file) => readFile(file, 'utf8'),
    createClient = (connectionString, timeout) => new PrismaClient({
      adapter: new PrismaPg({
        connectionString,
        max: 1,
        connectionTimeoutMillis: timeout,
        query_timeout: timeout,
        statement_timeout: timeout,
      }),
      log: [],
    }),
    sleep = (milliseconds, signal) => delay(milliseconds, undefined, { signal }),
    now = Date.now,
    log = (message) => process.stderr.write(`${message}\n`),
  } = {}) {
    this.readSecret = readSecret;
    this.createClient = createClient;
    this.sleep = sleep;
    this.now = now;
    this.log = log;
  }

  async wait({ secretFile, timeoutMs, signal: callerSignal }) {
    if (typeof secretFile !== 'string' || !secretFile.trim() || !Number.isSafeInteger(timeoutMs) || timeoutMs < 1) {
      throw new Error('DATABASE_READINESS_INVALID_ARGUMENTS');
    }

    const started = this.now();
    const deadline = started + timeoutMs;
    const timeout = new AbortController();
    const timer = setTimeout(() => timeout.abort(), timeoutMs);
    const signal = callerSignal ? AbortSignal.any([callerSignal, timeout.signal]) : timeout.signal;
    let attempts = 0;

    try {
      while (this.now() < deadline && !signal.aborted) {
        attempts += 1;
        let client;
        let ready = false;
        try {
          const uri = (await this.bounded(this.readSecret(secretFile), signal)).trim();
          if (uri) {
            const parsed = new URL(uri);
            if (!['postgres:', 'postgresql:'].includes(parsed.protocol)) {
              throw new Error('DATABASE_URI_INVALID');
            }
            const attemptTimeout = Math.max(1, Math.min(5000, deadline - this.now()));
            client = this.createClient(uri, attemptTimeout);
            await this.bounded(client.$queryRaw`SELECT 1`, signal);
            ready = true;
          }
        } catch (error) {
          const code = safeCodes.has(error?.code) ? error.code : 'UNAVAILABLE';
          this.log(`database-readiness attempt=${attempts} status=waiting code=${code} elapsedMs=${this.now() - started}`);
        } finally {
          if (client) {
            // Start cleanup even after cancellation. The overall deadline also bounds cleanup.
            await this.bounded(client.$disconnect(), signal);
          }
        }

        if (ready && !signal.aborted && this.now() < deadline) {
          this.log(`database-readiness status=ready attempts=${attempts} elapsedMs=${this.now() - started}`);
          return;
        }
        await this.sleep(Math.min(2000, Math.max(0, deadline - this.now())), signal);
      }
      throw new Error('DATABASE_READINESS_TIMEOUT');
    } catch {
      if (callerSignal?.aborted) throw new Error('DATABASE_READINESS_CANCELLED');
      if (timeout.signal.aborted || this.now() >= deadline) throw new Error('DATABASE_READINESS_TIMEOUT');
      throw new Error('DATABASE_READINESS_FAILED');
    } finally {
      clearTimeout(timer);
    }
  }

  bounded(operation, signal) {
    return new Promise((resolve, reject) => {
      const abort = () => {
        signal.removeEventListener('abort', abort);
        reject(new Error('DATABASE_READINESS_CANCELLED'));
      };
      if (signal.aborted) abort();
      else signal.addEventListener('abort', abort, { once: true });
      Promise.resolve(operation).then(
        (value) => { signal.removeEventListener('abort', abort); resolve(value); },
        (error) => { signal.removeEventListener('abort', abort); reject(error); },
      );
    });
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const controller = new AbortController();
  const cancel = () => controller.abort();
  process.once('SIGTERM', cancel);
  process.once('SIGINT', cancel);
  let exitCode = 1;
  try {
    const { values } = parseArgs({ options: { 'secret-file': { type: 'string' }, 'timeout-ms': { type: 'string' } } });
    await new DatabaseReadiness().wait({
      secretFile: values['secret-file'],
      timeoutMs: Number(values['timeout-ms']),
      signal: controller.signal,
    });
    exitCode = 0;
  } catch {
    process.stderr.write(`database-readiness status=${controller.signal.aborted ? 'cancelled' : 'failed'}\n`);
  } finally {
    process.removeListener('SIGTERM', cancel);
    process.removeListener('SIGINT', cancel);
  }
  // Terminate any socket still pending after the bounded disconnect attempt.
  process.exit(exitCode);
}
