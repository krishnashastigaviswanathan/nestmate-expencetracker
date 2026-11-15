export async function GET() {
  return Response.json({ ok: true, service: "nestmate-api" });
}