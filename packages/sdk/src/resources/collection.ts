import { paginate } from "../pagination.js";
import { toQuery } from "../query.js";
import { type RequesterOptions, request } from "../request.js";
import type {
	Collection,
	CreatePostInput,
	ListQuery,
	Page,
	Post,
	UpdatePostInput,
} from "../types.js";

export class CollectionResource {
	constructor(
		private readonly options: RequesterOptions,
		readonly id: string,
	) {}

	get(): Promise<Collection> {
		return request<Collection>(this.options, `/v1/collections/${encodeURIComponent(this.id)}`);
	}

	list(query: ListQuery = {}): Promise<Page<Post>> {
		return request<Page<Post>>(
			this.options,
			`/v1/collections/${this.id}/entries?${toQuery(query)}`,
		);
	}

	all(query: ListQuery = {}) {
		return paginate((page) => this.list({ ...query, page }));
	}

	getEntry(idOrSlug: string): Promise<Post> {
		return request<Post>(
			this.options,
			`/v1/collections/${this.id}/entries/${encodeURIComponent(idOrSlug)}`,
		);
	}

	create(input: CreatePostInput): Promise<Post> {
		return request<Post>(this.options, `/v1/collections/${this.id}/entries`, {
			method: "POST",
			body: JSON.stringify(input),
		});
	}

	update(idOrSlug: string, input: UpdatePostInput): Promise<Post> {
		return request<Post>(
			this.options,
			`/v1/collections/${this.id}/entries/${encodeURIComponent(idOrSlug)}`,
			{ method: "PATCH", body: JSON.stringify(input) },
		);
	}

	delete(idOrSlug: string): Promise<void> {
		return request<void>(
			this.options,
			`/v1/collections/${this.id}/entries/${encodeURIComponent(idOrSlug)}`,
			{ method: "DELETE" },
		);
	}
}
