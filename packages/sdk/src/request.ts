import { type APIErrorBody, CompassError } from "./errors.js";

export interface RequesterOptions {
	baseUrl: string;
	apiKey?: string;
	fetch?: typeof globalThis.fetch;
	timeoutMs?: number;
	retries?: number;
	retryDelayMs?: number;
}

export async function request<T>(
	options: RequesterOptions,
	path: string,
	init: RequestInit = {},
): Promise<T> {
	const retries = Math.max(0, options.retries ?? 2);
	const retryable = !init.method || ["GET", "HEAD", "OPTIONS"].includes(init.method.toUpperCase());
	const fetcher = options.fetch ?? globalThis.fetch;
	const headers = new Headers(init.headers);
	if (!headers.has("Accept")) headers.set("Accept", "application/json");
	if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
		headers.set("Content-Type", "application/json");
	}
	if (options.apiKey) headers.set("Authorization", `Bearer ${options.apiKey}`);

	for (let attempt = 0; attempt <= retries; attempt += 1) {
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 15_000);
		try {
			const response = await fetcher(
				`${options.baseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`,
				{ ...init, headers, signal: controller.signal },
			);
			if (response.ok) {
				if (response.status === 204) return undefined as T;
				return (await response.json()) as T;
			}
			if (retryable && attempt < retries && (response.status === 429 || response.status >= 500)) {
				await delay(options.retryDelayMs ?? 250, attempt);
				continue;
			}
			throw await responseError(response);
		} catch (error) {
			if (error instanceof CompassError) throw error;
			if (!retryable || attempt >= retries)
				throw new CompassError(
					error instanceof Error ? error.message : "Compass request failed",
					0,
				);
			await delay(options.retryDelayMs ?? 250, attempt);
		} finally {
			clearTimeout(timeout);
		}
	}
	throw new CompassError("Compass request failed", 0);
}

async function responseError(response: Response): Promise<CompassError> {
	let body: APIErrorBody | undefined;
	try {
		body = (await response.json()) as APIErrorBody;
	} catch {
		/* empty error body */
	}
	return new CompassError(
		body?.error ?? `Compass request failed (${response.status})`,
		response.status,
		body,
	);
}

function delay(base: number, attempt: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, base * 2 ** attempt));
}
