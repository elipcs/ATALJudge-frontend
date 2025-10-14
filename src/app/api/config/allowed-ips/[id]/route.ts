import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS } from "../../../../../config/api";

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    let authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    if (authHeader) {
      const match = authHeader.match(/^Bearer(.+)$/i);
      if (match) {
        authHeader = `Bearer ${match[1]}`;
      }
    }
    const hasBearer = authHeader ? /^[Bb]earer\s+/.test(authHeader) : false;
    if (!authHeader || !hasBearer) {
      return NextResponse.json({ error: "Token de autenticação não fornecido" }, { status: 401 });
    }
    const token = authHeader.replace(/^[Bb]earer\s+/, '');
        
    const res = await fetch(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.ENDPOINTS.CONFIG.ALLOWED_IPS_BY_ID(params.id)}`, {
      method: "DELETE",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });

    const toCamel = (s: string) => s.replace(/_([a-z])/g, g => g[1].toUpperCase());
    const convertKeys = (obj: any): any => {
      if (Array.isArray(obj)) return obj.map(convertKeys);
      if (obj && typeof obj === 'object') {
        return Object.fromEntries(Object.entries(obj).map(([k, v]) => [toCamel(k), convertKeys(v)]));
      }
      return obj;
    };

    const data = await res.json();
    const camelData = convertKeys(data);

    if (!res.ok) {
      return NextResponse.json({ 
        error: camelData.error || camelData.message || "Erro ao remover IP" 
      }, { status: res.status });
    }
    return NextResponse.json(camelData);
    
  } catch (error) {
    console.error("Erro ao remover IP:", error);
    return NextResponse.json({ 
      error: "Erro interno do servidor ao remover IP" 
    }, { status: 500 });
  }
}