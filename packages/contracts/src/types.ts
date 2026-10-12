/** Public JSON payload value. */
export type JSONValue =
	| string
	| number
	| boolean
	| null
	| JSONValue[]
	| { [key: string]: JSONValue };

export type ContentStatus = "draft" | "published" | "scheduled" | "archived";

export type FieldType =
	| "text"
	| "textarea"
	| "richtext"
	| "markdown"
	| "number"
	| "boolean"
	| "date"
	| "datetime"
	| "url"
	| "email"
	| "color"
	| "select"
	| "multiselect"
	| "image"
	| "file"
	| "video"
	| "audio"
	| "tags"
	| "relation"
	| "json";

export type FieldGroup = "content" | "meta" | "seo";

export interface FieldOption {
	value: string;
	label: string;
}

/** Public collection field schema. Private fields are omitted from public responses. */
export interface FieldDefinition {
	key: string;
	label: string;
	type: FieldType;
	helpText?: string;
	placeholder?: string;
	required?: boolean;
	defaultValue?: JSONValue;
	options?: FieldOption[];
	relationTo?: string;
	inTable?: boolean;
	searchable?: boolean;
	private?: boolean;
	maxLength?: number;
	min?: number;
	max?: number;
	step?: number;
	group?: FieldGroup;
	order?: number;
	localized?: boolean;
}

export interface Collection {
	id: string;
	name: string;
	singular: string;
	description?: string;
	fields: FieldDefinition[];
	publishable: boolean;
}

export interface Post {
	id: string;
	slug: string;
	title: string;
	description?: string;
	content?: string;
	status: ContentStatus;
	coverImage?: string | null;
	publishedAt?: string | null;
	updatedAt?: string;
	authors?: Author[];
	category?: Category | null;
	tags?: Tag[];
	fields?: Record<string, JSONValue>;
}

export interface Author {
	id: string;
	slug: string;
	name: string;
	bio?: string;
	image?: string | null;
}

export interface Category {
	id: string;
	slug: string;
	name: string;
}

export interface Tag {
	id: string;
	slug: string;
	name: string;
}

export interface Page<T> {
	items: T[];
	total: number;
	page: number;
	pageSize: number;
	pageCount: number;
}

export interface ListQuery {
	page?: number;
	pageSize?: number;
	search?: string;
	status?: ContentStatus | "all";
	sort?: string;
	order?: "asc" | "desc";
	category?: string;
	tags?: string[];
	format?: "html" | "markdown";
}

/** Query options accepted by read-only author/category/tag resources. */
export type NamedResourceQuery = Pick<ListQuery, "page" | "pageSize" | "search">;

/** Query options accepted by media catalog endpoints. */
export type MediaQuery = Pick<ListQuery, "page" | "pageSize" | "search"> & {
	folder?: string;
	mimeType?: string;
};

export type CreatePostInput = Pick<Post, "title"> &
	Partial<Pick<Post, "slug" | "description" | "content" | "status" | "coverImage" | "fields">>;

export type UpdatePostInput = Partial<CreatePostInput>;

export interface MediaAsset {
	id: string;
	name: string;
	url: string;
	mimeType?: string;
	size?: number;
	width?: number;
	height?: number;
	alt?: string;
}
