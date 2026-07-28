import { forwardToCentralArchive } from "../../../lib/central-wish-api";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      visitorId?: string;
      wish?: string;
    };
    const visitorId = payload.visitorId?.trim() ?? "";
    const wish = payload.wish?.trim() ?? "";

    if (!/^[a-zA-Z0-9-]{20,64}$/.test(visitorId)) {
      return Response.json({ error: "invalid visitor id" }, { status: 400 });
    }

    if (!wish || wish.length > 80) {
      return Response.json({ error: "invalid wish" }, { status: 400 });
    }

    return forwardToCentralArchive("wishes", { visitorId, wish });
  } catch {
    return Response.json({ error: "wish unavailable" }, { status: 500 });
  }
}
