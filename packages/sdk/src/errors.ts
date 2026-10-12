export interface APIErrorBody {
	error?: string;
	code?: string;
	details?: unknown;
}

export class CompassError extends Error {
	readonly status: number;
	readonly code?: string;
	readonly details?: unknown;

	constructor(message: string, status: number, body?: APIErrorBody) {
		super(message);
		this.name = "CompassError";
		this.status = status;
		this.code = body?.code;
		this.details = body?.details;
	}
}

export function isCompassError(error: unknown): error is CompassError {
	return error instanceof CompassError;
}
