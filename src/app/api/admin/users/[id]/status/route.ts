import { NextRequest, NextResponse } from "next/server";
import { proxyAdminUserMutation } from "@/lib/api/admin-user-proxy";

function isStatusRequest(value: unknown): value is { status: "Active" | "Disabled" } {
	return typeof value === "object" && value !== null && "status" in value && (value.status === "Active" || value.status === "Disabled");
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	let body: unknown;

	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ message: "The account-status request is invalid." }, { status: 400 });
	}

	if (!isStatusRequest(body)) return NextResponse.json({ message: "The account-status request is invalid." }, { status: 400 });
	return proxyAdminUserMutation(request, id, "status", "PATCH", body);
}
