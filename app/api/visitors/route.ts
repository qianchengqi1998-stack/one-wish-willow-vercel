import { neon } from "@neondatabase/serverless";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { visitorId?: string };
    const visitorId = payload.visitorId?.trim() ?? "";

    if (!/^[a-zA-Z0-9-]{20,64}$/.test(visitorId)) {
      return Response.json({ error: "invalid visitor id" }, { status: 400 });
    }

    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error("DATABASE_URL is unavailable");
    }

    const sql = neon(databaseUrl);
    await sql`
      CREATE TABLE IF NOT EXISTS visitors (
        visitor_id TEXT PRIMARY KEY,
        first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    await sql`
      INSERT INTO visitors (visitor_id)
      VALUES (${visitorId})
      ON CONFLICT (visitor_id) DO NOTHING
    `;
    const [result] = await sql`
      SELECT COUNT(*)::int AS total
      FROM visitors
    `;

    return Response.json(
      { visitors: Number(result?.total ?? 0) },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch {
    return Response.json(
      { error: "visitor count unavailable" },
      { status: 500 },
    );
  }
}
