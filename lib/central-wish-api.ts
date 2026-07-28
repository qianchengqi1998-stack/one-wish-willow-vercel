const CENTRAL_API_BASE =
  "https://one-wish-willow.qianchengqi1998.chatgpt.site";

type CentralRequest = {
  visitorId: string;
  wish?: string;
};

export async function checkCentralArchive() {
  const response = await fetch(`${CENTRAL_API_BASE}/api/wishes`, {
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
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, source: "vercel" }),
    cache: "no-store",
  });

  const data = await response.json();
  return Response.json(data, {
    status: response.status,
    headers: { "Cache-Control": "no-store" },
  });
}
