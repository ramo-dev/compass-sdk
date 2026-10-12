import type { ListQuery } from "./types.js";

/** Serialises list filters, repeating array values instead of joining them. */
export function toQuery(query: ListQuery): string {
	const params = new URLSearchParams();

	for (const [key, value] of Object.entries(query)) {
		if (value === undefined) continue;
		if (Array.isArray(value)) {
			value.forEach((item) => {
				params.append(key, item);
			});
			continue;
		}
		params.set(key, String(value));
	}

	return params.toString();
}
