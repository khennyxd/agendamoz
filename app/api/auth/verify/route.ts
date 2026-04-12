export const dynamic = "force-dynamic";

// Esta route já não é necessária para magic links Supabase —
// o Supabase redireciona diretamente para a URL configurada em emailRedirectTo.
// Mantida para não quebrar links antigos.
export async function GET(req: Request) {
  const url = new URL(req.url);
  return Response.redirect(new URL("/login", url));
}
