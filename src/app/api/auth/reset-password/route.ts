// Proxy de reset de senha Next.js para backend Python
import { NextResponse } from "next/server";
import { API_ENDPOINTS } from "../../../../config/api";

export async function POST(req: Request) {
  const body = await req.json();
  const res = await fetch(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.ENDPOINTS.AUTH.RESET_PASSWORD}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json({
      error: data.message || data.error || "Erro ao redefinir senha"
    }, { status: res.status });
  }

  return NextResponse.json(data);

}
