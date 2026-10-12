# Compass CMS SDK

[![SDK on npm](https://img.shields.io/npm/v/%40compasscms%2Fsdk?logo=npm&label=sdk)](https://www.npmjs.com/package/@compasscms/sdk)
[![Contracts on npm](https://img.shields.io/npm/v/%40compasscms%2Fcontracts?logo=npm&label=contracts)](https://www.npmjs.com/package/@compasscms/contracts)
[![SDK license](https://img.shields.io/npm/l/%40compasscms%2Fsdk)](https://www.npmjs.com/package/@compasscms/sdk)

Compass is a framework-agnostic TypeScript client for the versioned Compass CMS
HTTP API. Use the same client from Astro, Next.js, Vue, Svelte, Node.js, or any
JavaScript runtime with `fetch`—without bringing the CMS dashboard or backend
into your application.

The SDK is **Compass API-specific**, not a generic CMS client. Another CMS can
use it if it implements the [Compass API contract](packages/contracts/API-CONTRACT.md).

## Packages

| Package | What it provides |
| --- | --- |
| [`@compasscms/sdk`](https://www.npmjs.com/package/@compasscms/sdk) | Typed HTTP client for posts, collections, taxonomy, and media catalog endpoints. |
| [`@compasscms/contracts`](https://www.npmjs.com/package/@compasscms/contracts) | Shared TypeScript types, API contract, and OpenAPI specification. |

The SDK uses the contracts package as a peer dependency for its exported types.
Install both packages in TypeScript projects.

## Install

```sh
pnpm add @compasscms/sdk @compasscms/contracts
```

Or with npm:

```sh
npm install @compasscms/sdk @compasscms/contracts
```

## Quick start

Create a client using your CMS API base URL. The SDK appends versioned paths
such as `/v1/posts` to this URL.

```ts
import { Compass } from "@compasscms/sdk";

const compass = new Compass({
	baseUrl: process.env.CMS_API_URL ?? "https://cms.example.com/api",
	apiKey: process.env.CMS_API_KEY,
});

const { items: posts, pageCount } = await compass.posts.list({
	status: "published",
	pageSize: 10,
	tags: ["engineering"],
});

const post = await compass.posts.get("getting-started", { format: "markdown" });
console.log(post.title, pageCount);
```

`baseUrl` is the API root, commonly `https://cms.example.com/api`. Do not add
`/v1` when your API is mounted under `/api`; the SDK adds `/v1` itself. If a
backend mounts `/v1` at the host root, use the host root as `baseUrl`.

## Use it from any framework

The core package has no React, Vue, Svelte, or Astro dependency. It makes
standard HTTP requests and returns promises and async iterators; use it wherever
you normally call a service or API.

For example, in an Astro server-rendered page:

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

Vue and Svelte applications can use the same client from a server load function,
server route, or browser code when calling public, read-only endpoints. The SDK
does not currently provide framework-specific hooks or reactive stores.

## Authentication and API keys

Published content may be readable without a key if the CMS deployment allows
public reads. Otherwise, set `apiKey`; the SDK sends it as
`Authorization: Bearer <key>`. Keys are created in the CMS dashboard and scoped
to a project.

Typical API key scopes are:

- `content:read` — read protected content.
- `content:read:drafts` — read drafts when requested explicitly.
- `content:write` — create, update, publish, and delete content.
- `collections:read` — discover collection schemas.

Treat write-capable keys as secrets: keep them in server-side environment
variables and never bundle them into a browser app. A read-only public key can
be used client-side if exposing it is acceptable for your deployment. Direct
browser requests also require the CMS API to allow your site’s CORS origin.

## Client options

`new Compass(options)` accepts:

| Option | Default | Purpose |
| --- | --- | --- |
| `baseUrl` | Required | API root; the SDK appends `/v1/...` paths. |
| `apiKey` | None | Optional bearer token. |
| `timeoutMs` | `15000` | Timeout for each request attempt. |
| `retries` | `2` | Number of retries for reads after transient failures. |
| `retryDelayMs` | `250` | Base retry delay in milliseconds; delays grow exponentially. |
| `fetch` | `globalThis.fetch` | Optional compatible fetch implementation. |

Only read requests are retried automatically for network errors, HTTP 429, and
HTTP 5xx responses. Mutations are not retried, to avoid accidentally repeating
a write.

## Available resources

| Resource | Methods |
| --- | --- |
| `compass.posts` | `list`, `all`, `get`, `create`, `update`, `delete`, `publish`, `unpublish` |
| `compass.collections` | `list`, `all`, `get` |
| `compass.collection(id)` | `get`, `list`, `all`, `getEntry`, `create`, `update`, `delete` |
| `compass.authors`, `compass.categories`, `compass.tags` | `list`, `all`, `get` (read-only) |
| `compass.media` | `list`, `all`, `get`, `delete` |

`list` methods return a typed page with `items`, `total`, `page`, `pageSize`,
and `pageCount`. Use `all` to iterate through every page without writing the
pagination loop yourself:

```ts
for await (const entry of compass.collection("docs").all()) {
	console.log(entry.title);
}
```

Media upload is not part of the public media catalog API; uploads use the CMS
dashboard’s authenticated storage flow. Authors, categories, and tags are
read-only through this SDK.

## Types and errors

The SDK re-exports API types from `@compasscms/contracts`:

```ts
import type { Collection, Page, Post } from "@compasscms/sdk";
import { CompassError, isCompassError } from "@compasscms/sdk";
```

Failed HTTP responses throw `CompassError`, which includes `status`, `code`, and
`details` when supplied by the API. Network failures use status `0`.

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

## API contract and compatibility

The SDK expects a backend implementing the versioned `/v1` routes in the
[human-readable API contract](packages/contracts/API-CONTRACT.md). The
[OpenAPI document](packages/contracts/openapi.json) and TypeScript types are
published in `@compasscms/contracts`. The contract is the boundary between this
client and the CMS backend; the SDK does not include or deploy the backend.

## Small install footprint

`@compasscms/sdk@0.1.0` has no runtime dependencies and ships as a **21.1 kB
packed npm tarball** (**69.9 kB unpacked**). The required
`@compasscms/contracts@0.1.0` package adds **17.6 kB packed** (**60.0 kB
unpacked**). Measurements include documentation and license files and can
change between releases.

## Agent skill

Agent guidance for using the SDK lives in the open
[Agent Skills for Cracked Devs and Designers](https://github.com/ramo-dev/skills)
collection.

## Development

Requires Node.js 20+ and pnpm 10. From this repository:

```sh
pnpm install
pnpm check
pnpm test
```

For npm releases, publish `@compasscms/contracts` before an SDK release that
depends on a new contracts version. GitHub pushes and releases can contain
either package or both in any order.

## License

The repository and both packages are licensed under the GNU Affero General
Public License v3.0 only. See [LICENSE](LICENSE).
