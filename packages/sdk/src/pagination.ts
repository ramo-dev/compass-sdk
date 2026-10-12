import type { Page } from "./types.js";

/** Async iterator for consumers that want every page without manual loops. */
export async function* paginate<T>(
	load: (page: number) => Promise<Page<T>>,
	startPage = 1,
): AsyncGenerator<T, void, undefined> {
	let page = startPage;

	while (true) {
		const result = await load(page);
		for (const item of result.items) yield item;
		if (page >= result.pageCount) return;
		page += 1;
	}
}
