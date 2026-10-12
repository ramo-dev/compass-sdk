import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { Compass, CompassError } from "./index.js";

function json(body: unknown, status = 200): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { "content-type": "application/json" },
	});
}

describe("Compass", () => {
	it("sends the API key and repeated tag filters", async () => {
		const compass = new Compass({
			baseUrl: "https://cms.example.com/",
			apiKey: "mpk_test",
			retries: 0,
			fetch: async (input, init) => {
				assert.equal(
					String(input),
					"https://cms.example.com/v1/posts?status=published&tags=engineering&tags=release",
				);
				assert.equal(new Headers(init?.headers).get("Authorization"), "Bearer mpk_test");
				return json({
					items: [{ id: "1", slug: "hello", title: "Hello", status: "published" }],
					total: 1,
					page: 1,
					pageSize: 20,
					pageCount: 1,
				});
			},
		});

		const page = await compass.posts.list({
			status: "published",
			tags: ["engineering", "release"],
		});
		assert.equal(page.items[0]?.title, "Hello");
	});

	it("exposes typed API errors", async () => {
		const compass = new Compass({
			baseUrl: "https://cms.example.com",
			retries: 0,
			fetch: async () => json({ error: "missing scope", code: "forbidden" }, 403),
		});

		await assert.rejects(
			() => compass.posts.get("missing"),
			(error: unknown) => {
				assert.ok(error instanceof CompassError);
				assert.equal(error.status, 403);
				assert.equal(error.code, "forbidden");
				return true;
			},
		);
	});

	it("walks every page of a custom collection", async () => {
		const compass = new Compass({
			baseUrl: "https://cms.example.com",
			retries: 0,
			fetch: async (input) => {
				const page = new URL(String(input)).searchParams.get("page") ?? "1";
				return json({
					items: [{ id: page, slug: `item-${page}`, title: `Item ${page}`, status: "published" }],
					total: 2,
					page: Number(page),
					pageSize: 1,
					pageCount: 2,
				});
			},
		});

		const titles = [];
		for await (const entry of compass.collection("docs").all({ pageSize: 1 })) {
			titles.push(entry.title);
		}
		assert.deepEqual(titles, ["Item 1", "Item 2"]);
	});
});
