// Proxy de verificação de token de reset Next.js para backend Python
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const res = await fetch(`${apiUrl}/auth/verify-reset-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    return NextResponse.json({ 
      error: data.message || data.error || "Token inválido" 
    }, { status: res.status });
  }
  
  // Verificar se a resposta tem o formato esperado com success
  if (!data.success) {
    return NextResponse.json({ 
      error: data.message || "Token inválido" 
    }, { status: 400 });
  }
  
  return NextResponse.json(data);
}
