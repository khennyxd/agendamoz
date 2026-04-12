export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  return Response.redirect(new URL("/login", url));
}
