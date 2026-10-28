import { NextRequest, NextResponse } from "next/server";
import { fetchAccountApi, getErrorMessage } from "@/lib/api/auth-proxy";
import { clearSessionCookie } from "@/lib/session";

export async function GET(request: NextRequest) {
	const accessToken = request.cookies.get("session")?.value;

	if (!accessToken) return NextResponse.json({ message: "Please sign in again." }, { status: 401 });

	try {
		const backendResponse = await fetchAccountApi("export", { headers: { Authorization: `Bearer ${accessToken}` } });

		if (!backendResponse.ok) {
			const response = NextResponse.json({ message: await getErrorMessage(backendResponse, "Unable to export account data.") }, { status: backendResponse.status });
			if (backendResponse.status === 401) clearSessionCookie(response);
			return response;
		}

		return new NextResponse(await backendResponse.text(), { status: 200, headers: { "Content-Type": "application/json; charset=utf-8", "Content-Disposition": "attachment; filename=personal-data.json", "Cache-Control": "no-store" } });
	} catch {
		return NextResponse.json({ message: "Unable to reach the account server." }, { status: 502 });
	}
}
