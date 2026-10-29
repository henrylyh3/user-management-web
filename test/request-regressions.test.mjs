import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { createContext, SourceTextModule, SyntheticModule } from "node:vm";
import { NextRequest, NextResponse } from "next/server.js";
import ts from "typescript";

async function loadSource(file, dependencies = {}) {
	const context = createContext({ Headers, Response, URL, console });
	const source = await readFile(new URL(`../${file}`, import.meta.url), "utf8");
	const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
	const sourceModule = new SourceTextModule(code, { context });
	await sourceModule.link((name) => {
		const exports = dependencies[name];
		if (!exports) throw new Error(`Unexpected dependency: ${name}`);
		return new SyntheticModule(Object.keys(exports), function () {
			for (const [key, value] of Object.entries(exports)) this.setExport(key, value);
		}, { context });
	});
	await sourceModule.evaluate();
	return sourceModule.namespace;
}

async function csrfRoute() {
	const calls = [];
	const route = await loadSource("src/app/api/auth/csrf/route.ts", {
		"next/server": { NextRequest, NextResponse },
		"@/lib/api/auth-proxy": {
			getAuthCookieHeader: () => "antiforgery=fixture-cookie",
			copySetCookieHeaders: () => {},
			fetchAuthApi: async (path, init) => {
				calls.push({ path, headers: new Headers(init.headers) });
				return Response.json({ token: "fixture-csrf-token" });
			},
		},
	});
	return { route, calls };
}

test("Protected CSRF requests use the same Bearer identity as the mutation", async () => {
	const { route, calls } = await csrfRoute();
	const request = new NextRequest("https://example.test/api/auth/csrf?authenticated=true", { headers: { Cookie: "session=fixture-access-token" } });
	const response = await route.GET(request);
	assert.equal(response.status, 200);
	assert.equal(calls[0].headers.get("Authorization"), "Bearer fixture-access-token");
	assert.equal(calls[0].headers.get("Cookie"), "antiforgery=fixture-cookie");
});

test("Refresh and current signout keep anonymous CSRF context even with an access cookie", async () => {
	const { route, calls } = await csrfRoute();
	const request = new NextRequest("https://example.test/api/auth/csrf", { headers: { Cookie: "session=fixture-access-token" } });
	assert.equal((await route.GET(request)).status, 200);
	assert.equal(calls[0].headers.get("Authorization"), null);
});

test("Authenticated CSRF preparation rejects a missing access session", async () => {
	const { route, calls } = await csrfRoute();
	assert.equal((await route.GET(new NextRequest("https://example.test/api/auth/csrf?authenticated=true"))).status, 401);
	assert.equal(calls.length, 0);
});

test("Account timestamps use Malaysia time regardless of server timezone", async () => {
	const { formatDateTime } = await loadSource("src/lib/date-time.ts");
	assert.equal(formatDateTime("2026-10-29T05:28:21Z"), "29 Oct 2026, 1:28:21 pm");
	assert.equal(formatDateTime("invalid"), "Unknown");
});

test("Signin forwards the browser user agent for session device metadata", async () => {
	let forwarded;
	const route = await loadSource("src/app/api/auth/signin/route.ts", {
		"next/server": { NextRequest, NextResponse },
		"@/features/auth/services/auth.service": { getCurrentUser: () => {} },
		"@/lib/session": { getUserHomePath: () => {}, setSessionCookie: () => {} },
		"@/lib/api/auth-proxy": {
			copySetCookieHeaders: () => {}, parseAuthResponse: () => {},
			fetchAuthApi: async (_path, init) => {
				forwarded = new Headers(init.headers);
				return Response.json({ message: "Fixture rejection" }, { status: 401 });
			},
		},
	});
	const request = new NextRequest("https://example.test/api/auth/signin", {
		method: "POST", headers: { "Content-Type": "application/json", "User-Agent": "Chrome fixture" },
		body: JSON.stringify({ email: "fixture@example.test", password: "short", keepMeSignedIn: false }),
	});
	assert.equal((await route.POST(request)).status, 401);
	assert.equal(forwarded.get("User-Agent"), "Chrome fixture");
});
