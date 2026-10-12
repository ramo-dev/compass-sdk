import type { RequesterOptions } from "./request.js";
import { CollectionResource } from "./resources/collection.js";
import { CollectionsResource } from "./resources/collections.js";
import { MediaResource } from "./resources/media.js";
import { PostsResource } from "./resources/posts.js";
import { StandardResource } from "./resources/standard.js";
import type { Author, Category, Tag } from "./types.js";

export interface CompassOptions {
	baseUrl: string;
	apiKey?: string;
	timeoutMs?: number;
	retries?: number;
	retryDelayMs?: number;
	fetch?: typeof globalThis.fetch;
}

/** Framework-neutral public SDK for the Compass CMS API. */
export class Compass {
	readonly posts: PostsResource;
	readonly collections: CollectionsResource;
	readonly authors: StandardResource<Author>;
	readonly categories: StandardResource<Category>;
	readonly tags: StandardResource<Tag>;
	readonly media: MediaResource;

	private readonly requester: RequesterOptions;

	constructor(options: CompassOptions) {
		this.requester = options;
		this.posts = new PostsResource(this.requester);
		this.collections = new CollectionsResource(this.requester);
		this.authors = new StandardResource(this.requester, "v1/authors");
		this.categories = new StandardResource(this.requester, "v1/categories");
		this.tags = new StandardResource(this.requester, "v1/tags");
		this.media = new MediaResource(this.requester);
	}

	collection(id: string): CollectionResource {
		return new CollectionResource(this.requester, id);
	}
}

export * from "./errors.js";
export * from "./pagination.js";
export * from "./resources/collection.js";
export * from "./resources/collections.js";
export * from "./resources/media.js";
export * from "./resources/posts.js";
export * from "./resources/standard.js";
export * from "./types.js";
