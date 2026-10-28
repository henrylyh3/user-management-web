"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

type TurnstileApi = {
	render: (container: HTMLElement, options: Record<string, unknown>) => string;
	reset: (widgetId: string) => void;
	remove: (widgetId: string) => void;
};

declare global {
	interface Window {
		turnstile?: TurnstileApi;
	}
}

const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

export default function TurnstileWidget({ action, onToken, resetSignal }: { action: string; onToken: (token: string) => void; resetSignal: number }) {
	const containerRef = useRef<HTMLDivElement>(null);
	const widgetIdRef = useRef<string | null>(null);
	const onTokenRef = useRef(onToken);
	const [ready, setReady] = useState(false);

	useEffect(() => { onTokenRef.current = onToken; }, [onToken]);

	useEffect(() => {
		if (!ready || !siteKey || !containerRef.current || !window.turnstile || widgetIdRef.current) return;

		widgetIdRef.current = window.turnstile.render(containerRef.current, {
			sitekey: siteKey,
			action,
			theme: "auto",
			size: "flexible",
			callback: (token: string) => onTokenRef.current(token),
			"expired-callback": () => onTokenRef.current(""),
			"error-callback": () => onTokenRef.current(""),
		});

		return () => {
			if (widgetIdRef.current && window.turnstile) window.turnstile.remove(widgetIdRef.current);
			widgetIdRef.current = null;
		};
	}, [action, ready]);

	useEffect(() => {
		if (resetSignal > 0 && widgetIdRef.current && window.turnstile) {
			onTokenRef.current("");
			window.turnstile.reset(widgetIdRef.current);
		}
	}, [resetSignal]);

	if (!siteKey) return <p className="alert alert-danger" role="alert">Human verification is unavailable.</p>;

	return (
		<div className="mb-3">
			<Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" onReady={() => setReady(true)} />
			<div ref={containerRef} />
		</div>
	);
}
