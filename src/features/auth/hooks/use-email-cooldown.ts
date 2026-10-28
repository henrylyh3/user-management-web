"use client";

import { useEffect, useState } from "react";

export function useEmailCooldown(success: string, pending: boolean, durationSeconds = 60): number {
	const [remainingSeconds, setRemainingSeconds] = useState(0);

	useEffect(() => {
		if (pending || !success) return;

		const expiresAt = Date.now() + durationSeconds * 1000;

		const updateRemainingSeconds = () => {
			const nextRemainingSeconds = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
			setRemainingSeconds(nextRemainingSeconds);

			if (nextRemainingSeconds === 0) window.clearInterval(timer);
		};

		const initialTimer = window.setTimeout(updateRemainingSeconds, 0);
		const timer = window.setInterval(updateRemainingSeconds, 1000);
		return () => {
			window.clearTimeout(initialTimer);
			window.clearInterval(timer);
		};
	}, [durationSeconds, pending, success]);

	return remainingSeconds;
}
