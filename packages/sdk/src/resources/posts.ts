import { paginate } from "../pagination.js";
import { toQuery } from "../query.js";
import { type RequesterOptions, request } from "../request.js";
import type { CreatePostInput, ListQuery, Page, Post, UpdatePostInput } from "../types.js";

export class PostsResource {
	constructor(private readonly options: RequesterOptions) {}

	list(query: ListQuery = {}): Promise<Page<Post>> {
		return request<Page<Post>>(this.options, `/v1/posts?${toQuery(query)}`);
	}

	all(query: ListQuery = {}) {
		return paginate((page) => this.list({ ...query, page }));
	}

	get(idOrSlug: string, query: Pick<ListQuery, "format" | "status"> = {}): Promise<Post> {
		const suffix = toQuery(query);
		return request<Post>(
			this.options,
			`/v1/posts/${encodeURIComponent(idOrSlug)}${suffix ? `?${suffix}` : ""}`,
		);
	}

	create(input: CreatePostInput): Promise<Post> {
		return request<Post>(this.options, "/v1/posts", {
			method: "POST",
			body: JSON.stringify(input),
		});
	}

	update(idOrSlug: string, input: UpdatePostInput): Promise<Post> {
		return request<Post>(this.options, `/v1/posts/${encodeURIComponent(idOrSlug)}`, {
			method: "PATCH",
			body: JSON.stringify(input),
		});
	}

	delete(idOrSlug: string): Promise<void> {
		return request<void>(this.options, `/v1/posts/${encodeURIComponent(idOrSlug)}`, {
			method: "DELETE",
		});
	}

	publish(idOrSlug: string): Promise<Post> {
		return this.update(idOrSlug, { status: "published" });
	}

	unpublish(idOrSlug: string): Promise<Post> {
		return this.update(idOrSlug, { status: "draft" });
	}
}
