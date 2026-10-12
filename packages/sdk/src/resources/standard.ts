import { paginate } from "../pagination.js";
import { toQuery } from "../query.js";
import { type RequesterOptions, request } from "../request.js";
import type { NamedResourceQuery, Page } from "../types.js";

export interface NamedResource {
	id: string;
	slug: string;
	name: string;
	description?: string;
}

export class StandardResource<T extends NamedResource> {
	constructor(
		private readonly options: RequesterOptions,
		private readonly path: string,
	) {}

	list(query: NamedResourceQuery = {}): Promise<Page<T>> {
		return request<Page<T>>(this.options, `/${this.path}?${toQuery(query)}`);
	}

	all(query: NamedResourceQuery = {}) {
		return paginate((page) => this.list({ ...query, page }));
	}

	get(idOrSlug: string): Promise<T> {
		return request<T>(this.options, `/${this.path}/${encodeURIComponent(idOrSlug)}`);
	}
}
