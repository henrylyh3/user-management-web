import { NextRequest, NextResponse } from "next/server";
import { proxyAdminUserMutation } from "@/lib/api/admin-user-proxy";

function isRoleRequest(value: unknown): value is { role: "User" | "Admin" } {
	return typeof value === "object" && value !== null && "role" in value && (value.role === "User" || value.role === "Admin");
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	let body: unknown;

	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ message: "The role update request is invalid." }, { status: 400 });
	}

	if (!isRoleRequest(body)) return NextResponse.json({ message: "The role update request is invalid." }, { status: 400 });
	return proxyAdminUserMutation(request, id, "role", "PATCH", body);
}
