const CENTRAL_API_BASE =
  "https://one-wish-willow.qianchengqi1998.chatgpt.site";

type CentralRequest = {
  visitorId: string;
  wish?: string;
};

function authorizationHeaders() {
  const token = process.env.CENTRAL_ARCHIVE_TOKEN;
  if (!token) {
    throw new Error("CENTRAL_ARCHIVE_TOKEN is unavailable");
  }

  return {
    "OAI-Sites-Authorization": `Bearer ${token}`,
  };
}

export async function checkCentralArchive() {
  const response = await fetch(`${CENTRAL_API_BASE}/api/wishes`, {
    headers: authorizationHeaders(),
    cache: "no-store",
  });
  const data = await response.json();
  return Response.json(data, {
    status: response.status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function forwardToCentralArchive(
  route: "visitors" | "wishes",
  payload: CentralRequest,
) {
  const response = await fetch(`${CENTRAL_API_BASE}/api/${route}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authorizationHeaders(),
    },
    body: JSON.stringify({ ...payload, source: "vercel" }),
    cache: "no-store",
  });

  const data = await response.json();
  return Response.json(data, {
    status: response.status,
    headers: { "Cache-Control": "no-store" },
  });
}
