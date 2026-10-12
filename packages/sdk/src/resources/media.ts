import { paginate } from "../pagination.js";
import { toQuery } from "../query.js";
import { type RequesterOptions, request } from "../request.js";
import type { MediaAsset, MediaQuery, Page } from "../types.js";

export class MediaResource {
	constructor(private readonly options: RequesterOptions) {}

	list(query: MediaQuery = {}): Promise<Page<MediaAsset>> {
		return request<Page<MediaAsset>>(this.options, `/v1/media?${toQuery(query)}`);
	}

	all(query: MediaQuery = {}) {
		return paginate((page) => this.list({ ...query, page }));
	}

	get(id: string): Promise<MediaAsset> {
		return request<MediaAsset>(this.options, `/v1/media/${encodeURIComponent(id)}`);
	}

	delete(id: string): Promise<void> {
		return request<void>(this.options, `/v1/media/${encodeURIComponent(id)}`, {
			method: "DELETE",
		});
	}
}
