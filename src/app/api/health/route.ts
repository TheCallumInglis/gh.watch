import { NextResponse } from "next/server";
import { version, repository } from "../../../../package.json";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version,
    repository: repository?.url || null,
  });
}
