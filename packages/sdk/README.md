# `@compasscms/sdk`

[![npm version](https://img.shields.io/npm/v/%40compasscms%2Fsdk?logo=npm)](https://www.npmjs.com/package/@compasscms/sdk)
[![npm license](https://img.shields.io/npm/l/%40compasscms%2Fsdk)](https://www.npmjs.com/package/@compasscms/sdk)

Framework-agnostic TypeScript client for the versioned Compass CMS HTTP API.
Use it from Astro, Next.js, Vue, Svelte, Node.js, or any JavaScript runtime with
`fetch`. It talks to the public API; it does not bundle the CMS dashboard or
backend. A different CMS can use the client if it implements the
[Compass API contract](https://github.com/ramo-dev/compasscms-sdk/blob/main/packages/contracts/API-CONTRACT.md).

## Install

Install the SDK and its contracts peer package:

```sh
pnpm add @compasscms/sdk @compasscms/contracts
```

```sh
npm install @compasscms/sdk @compasscms/contracts
```

The contracts package supplies the types re-exported by the SDK and publishes
the [OpenAPI document](https://github.com/ramo-dev/compasscms-sdk/blob/main/packages/contracts/openapi.json).

## Quick start

```ts
import { Compass } from "@compasscms/sdk";

const compass = new Compass({
	baseUrl: process.env.CMS_API_URL ?? "https://cms.example.com/api",
	apiKey: process.env.CMS_API_KEY,
});

const { items: posts } = await compass.posts.list({
	status: "published",
	pageSize: 10,
	tags: ["engineering"],
});

const post = await compass.posts.get("getting-started", { format: "markdown" });
console.log(post.title);
```

`baseUrl` is the API root. The SDK appends `/v1/...` paths, so use
`https://cms.example.com/api` when the API is mounted under `/api`; do not add
`/v1` yourself. If your backend serves `/v1` at the host root, use the host root
as `baseUrl`.

## Frameworks and runtimes

The client is framework-agnostic: it has no React, Vue, Svelte, or Astro runtime
dependency. Use the same `Compass` instance in server load functions, route
handlers, server-rendered pages, or browser code calling public read endpoints.
Framework-specific hooks and reactive stores are not included.

For example, an Astro server-rendered page can use the client directly:

```astro
---
import { Compass } from "@compasscms/sdk";

const compass = new Compass({
	baseUrl: import.meta.env.CMS_API_URL,
	apiKey: import.meta.env.CMS_API_KEY,
});
const { items: posts } = await compass.posts.list({ status: "published" });
---

<main>
	{posts.map((post) => <h2><a href={`/blog/${post.slug}`}>{post.title}</a></h2>)}
</main>
```

## Authentication and keys

Published content can be read without a key when the CMS deployment allows
public reads. Otherwise, provide `apiKey`; requests send it as
`Authorization: Bearer <key>`. Create API keys in the CMS dashboard. Keys are
scoped to a project and can have `content:read`, `content:read:drafts`,
`content:write`, or `collections:read` permissions.

Keep write-capable keys in server-side environment variables—never bundle them
into a browser application. A read-only public key may be used client-side if
that exposure is acceptable. Browser requests also require the API deployment
to allow your site’s CORS origin.

## Client options

| Option | Default | Description |
| --- | --- | --- |
| `baseUrl` | Required | API root; the SDK appends `/v1/...`. |
| `apiKey` | None | Optional bearer token. |
| `org` | None | Organization slug; set with `project` for project-scoped requests. |
| `project` | None | Project slug; set with `org` for project-scoped requests. |
| `timeoutMs` | `15000` | Timeout per request attempt. |
| `retries` | `2` | Retries for transient read failures. |
| `retryDelayMs` | `250` | Base delay in milliseconds; grows exponentially. |
| `fetch` | `globalThis.fetch` | Optional compatible fetch implementation. |

Read requests retry network failures, HTTP 429, and HTTP 5xx responses. Mutating
requests are never retried automatically.

## Resources

| Resource | Methods |
| --- | --- |
| `compass.posts` | `list`, `all`, `get`, `create`, `update`, `delete`, `publish`, `unpublish` |
| `compass.collections` | `list`, `all`, `get` |
| `compass.collection(id)` | `get`, `list`, `all`, `getEntry`, `create`, `update`, `delete` |
| `compass.authors`, `compass.categories`, `compass.tags` | `list`, `all`, `get` (read-only) |
| `compass.media` | `list`, `all`, `get`, `delete` |

List methods return a page containing `items`, `total`, `page`, `pageSize`, and
`pageCount`. The `all` methods return async iterators for consuming all pages:

```ts
for await (const entry of compass.collection("docs").all()) {
	console.log(entry.title);
}
```

Media uploads use the CMS dashboard’s authenticated storage flow and are not
handled by the public media catalog resource.

## Types and errors

The SDK re-exports types from `@compasscms/contracts`:

```ts
import type { Collection, Page, Post } from "@compasscms/sdk";
import { CompassError, isCompassError } from "@compasscms/sdk";
```

Failed HTTP responses throw `CompassError`, with `status`, `code`, and `details`
when provided by the API. Network failures use status `0`.

```ts
try {
	const post = await compass.posts.get("missing-post");
	console.log(post.title);
} catch (error) {
	if (isCompassError(error)) {
		console.error(error.status, error.code, error.message, error.details);
	}
}
```

## Package size

Version `0.2.0` has no runtime dependencies and ships as a **21.1 kB packed npm
tarball** (**69.9 kB unpacked**). The required `@compasscms/contracts@0.2.0`
package adds **17.6 kB packed** (**60.0 kB unpacked**). These sizes include
documentation and license files and may change between releases.

## License

Licensed under the GNU Affero General Public License v3.0 only. See
[LICENSE](./LICENSE).
