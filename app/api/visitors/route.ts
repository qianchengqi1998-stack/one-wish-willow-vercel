import { forwardToCentralArchive } from "../../../lib/central-wish-api";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { visitorId?: string };
    const visitorId = payload.visitorId?.trim() ?? "";

    if (!/^[a-zA-Z0-9-]{20,64}$/.test(visitorId)) {
      return Response.json({ error: "invalid visitor id" }, { status: 400 });
    }

    return forwardToCentralArchive("visitors", { visitorId });
  } catch {
    return Response.json(
      { error: "visitor count unavailable" },
      { status: 500 },
    );
  }
}
