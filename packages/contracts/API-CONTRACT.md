# Compass API Contract

Compass uses a versioned, framework-neutral HTTP contract. Backends are
replaceable as long as they satisfy this contract.

## Base URL

```text
https://cms.example.com/api
```

The SDK appends versioned paths such as `/v1/posts` to this base URL. If a
backend serves `/v1` at its host root, use that root as `baseUrl` instead.

## Authentication

Send the API key in the `Authorization` header:

```http
Authorization: Bearer mpk_public_read_key
```

Keys are created in the CMS dashboard and scoped to one project. Published
content can be read without a key when the deployment allows public reads.
Protected operations require the matching scope: `content:read`,
`content:read:drafts`, `content:write`, or `collections:read` (schema discovery).

## Resources

```text
GET    /v1/posts
GET    /v1/posts/:id-or-slug
POST   /v1/posts
PATCH  /v1/posts/:id-or-slug
DELETE /v1/posts/:id-or-slug

GET    /v1/authors
GET    /v1/authors/:id-or-slug
GET    /v1/categories
GET    /v1/categories/:id-or-slug
GET    /v1/tags
GET    /v1/tags/:id-or-slug

GET    /v1/media
GET    /v1/media/:id
DELETE /v1/media/:id

GET    /v1/collections
GET    /v1/collections/:id
GET    /v1/collections/:id/entries
GET    /v1/collections/:id/entries/:entry-id-or-slug
POST   /v1/collections/:id/entries
PATCH  /v1/collections/:id/entries/:entry-id-or-slug
DELETE /v1/collections/:id/entries/:entry-id-or-slug
```

The current public API exposes authors, categories, and tags as read-only
resources. Media uploads use the authenticated storage flow rather than the
public media catalog API.

List endpoints accept `page`, `pageSize`, and `search`. Post and collection
entry lists also accept `status`, `sort`, `order`, `category`, and repeated
`tags` parameters. Media lists accept `folder` and `mimeType`.

## List responses

Every list endpoint returns the same envelope:

```json
{
  "items": [],
  "total": 0,
  "page": 1,
  "pageSize": 20,
  "pageCount": 1
}
```

## Public defaults

- Published content is returned by default.
- Drafts require the `content:read:drafts` scope and explicit `status=draft` or `status=all`.
- Private fields are omitted from public responses.
- IDs and slugs are accepted for resource lookup.
- Mutating requests are never retried automatically by Compass.
- Published reads may be public. Protected operations require a dashboard-issued
  key with the corresponding content, draft, or collection-discovery scope.
- Mutating public API requests without a valid key fail with `401 unauthorized`.

## Errors

```json
{
  "error": "API key missing required scope: content:write",
  "code": "forbidden",
  "details": { "scope": "content:write" }
}
```

The SDK exposes these as `CompassError` with `status`, `code` and `details`.
