const formatter = new Intl.DateTimeFormat("en-MY", { dateStyle: "medium", timeStyle: "medium", timeZone: "Asia/Kuala_Lumpur" });

export function formatDateTime(value: string): string {
	const date = new Date(value);
	return Number.isFinite(date.getTime()) ? formatter.format(date) : "Unknown";
}
