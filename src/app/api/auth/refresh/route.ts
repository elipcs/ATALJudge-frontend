// Proxy de refresh token Next.js para backend Python
import { NextResponse } from "next/server";
import { API_ENDPOINTS } from "../../../../config/api";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const refreshToken = body.refreshToken;
    
    if (!refreshToken) {
      return NextResponse.json({ error: "Token de refresh não fornecido" }, { status: 401 });
    }
    
    const res = await fetch(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.ENDPOINTS.AUTH.REFRESH}`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        refresh_token: refreshToken
      }),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      return NextResponse.json({ 
        error: data.message || data.error || "Falha ao renovar token" 
      }, { status: res.status });
    }
    
    const responseData = {
      accessToken: data.data.access_token
    };
    
    return NextResponse.json({ data: responseData });
  } catch (error) {
    console.error("Erro ao renovar token:", error);
    return NextResponse.json({ 
      error: "Erro interno do servidor ao renovar token" 
    }, { status: 500 });
  }
}
