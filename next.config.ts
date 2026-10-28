import type { NextConfig } from "next";

const contentSecurityPolicy = [
	"default-src 'self'",
	"base-uri 'self'",
	"form-action 'self'",
	"frame-ancestors 'none'",
	"object-src 'none'",
	process.env.NODE_ENV === "development" ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com" : "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
	"style-src 'self' 'unsafe-inline'",
	"img-src 'self' data: blob: https:",
	"font-src 'self' data:",
	process.env.NODE_ENV === "development" ? "connect-src 'self' ws: http: https://challenges.cloudflare.com" : "connect-src 'self' https://challenges.cloudflare.com",
	"frame-src https://challenges.cloudflare.com",
	"worker-src 'self' blob:",
].join("; ");

const nextConfig: NextConfig = {
	experimental: {
		serverActions: {
			bodySizeLimit: "3mb", //2mb image + data
		},
	},
	cacheComponents: true,
	partialPrefetching: true,
	turbopack: {
		rules: {
			"*.css": {
				loaders: ["@tailwindcss/turbopack"],
				as: "*.css",
			},
		},
	},
	async headers() {
		const securityHeaders = [
			{ key: "Content-Security-Policy", value: contentSecurityPolicy },
			{ key: "Permissions-Policy", value: "camera=(), geolocation=(), microphone=()" },
			{ key: "Referrer-Policy", value: "no-referrer" },
			{ key: "X-Content-Type-Options", value: "nosniff" },
			{ key: "X-Frame-Options", value: "DENY" },
		];

		if (process.env.NODE_ENV === "production") securityHeaders.push({ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" });

		return [{ source: "/(.*)", headers: securityHeaders }];
	},
};

export default nextConfig;
