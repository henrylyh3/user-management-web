import { NextRequest } from "next/server";
import { proxyAdminUserMutation } from "@/lib/api/admin-user-proxy";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	return proxyAdminUserMutation(request, id, "unlock", "POST");
}
