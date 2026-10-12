import { paginate } from "../pagination.js";
import { type RequesterOptions, request } from "../request.js";
import type { Collection, Page } from "../types.js";

export class CollectionsResource {
	constructor(private readonly options: RequesterOptions) {}

	list(): Promise<Page<Collection>> {
		return request<Page<Collection>>(this.options, "/v1/collections");
	}

	all() {
		return paginate((page) =>
			request<Page<Collection>>(this.options, `/v1/collections?page=${page}`),
		);
	}

	get(id: string): Promise<Collection> {
		return request<Collection>(this.options, `/v1/collections/${encodeURIComponent(id)}`);
	}
}
