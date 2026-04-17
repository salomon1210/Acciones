import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig } from "axios";
import axiosRetry from "axios-retry";
import PQueue from "p-queue";

type ClientOptions = {
  name: string;
  baseURL: string;
  concurrency?: number;
  intervalMs?: number;
  intervalCap?: number;
  retries?: number;
  timeoutMs?: number;
};

const instances = new Map<string, AxiosInstance>();
const queues = new Map<string, PQueue>();

export function getClient(opts: ClientOptions): { http: AxiosInstance; queue: PQueue } {
  if (!instances.has(opts.name)) {
    const http = axios.create({
      baseURL: opts.baseURL,
      timeout: opts.timeoutMs ?? 15000,
    });
    axiosRetry(http, {
      retries: opts.retries ?? 3,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (err) =>
        axiosRetry.isNetworkOrIdempotentRequestError(err) ||
        (err.response?.status ? err.response.status >= 500 : false),
    });
    instances.set(opts.name, http);
  }
  if (!queues.has(opts.name)) {
    queues.set(
      opts.name,
      new PQueue({
        concurrency: opts.concurrency ?? 4,
        interval: opts.intervalMs ?? 1000,
        intervalCap: opts.intervalCap ?? 8,
      })
    );
  }
  return { http: instances.get(opts.name)!, queue: queues.get(opts.name)! };
}

export async function queuedGet<T>(
  clientName: string,
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const inst = instances.get(clientName);
  const q = queues.get(clientName);
  if (!inst || !q) throw new Error(`http client "${clientName}" not initialized`);
  const result = await q.add(async () => {
    const res = await inst.get<T>(url, config);
    return res.data;
  });
  return result as T;
}

export function isMissingKeyError(e: unknown): boolean {
  const err = e as AxiosError | undefined;
  return err?.response?.status === 401 || err?.response?.status === 403;
}

export function humanizeHttpError(err: unknown, providerLabel: string): string {
  const e = err as AxiosError<{ message?: string; error?: string } | undefined> | undefined;
  const status = e?.response?.status;
  if (status === 401 || status === 403) return `No pude autenticarme con ${providerLabel}. Revisá la API key en .env.local.`;
  if (status === 429) return `${providerLabel} devolvió rate limit (429). Reintenta en unos segundos.`;
  if (status && status >= 500) return `${providerLabel} caído (${status}). Usando fallback.`;
  if (e?.code === "ECONNABORTED") return `${providerLabel} tardó demasiado. Usando fallback.`;
  if (status === 404) return `${providerLabel} no tiene datos para este recurso.`;
  return `No se pudo conectar con ${providerLabel}.`;
}
