import CoralPage from "@/components/coral-page";

export default function Loading() {
	return <CoralPage title="Loading…" variant="status"><p className="visually-hidden" role="status">Loading…</p></CoralPage>;
}
