import { NextResponse } from "next/server";
import { API_ENDPOINTS } from "../../../../../../config/api";

export async function OPTIONS(req: Request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string; questionId: string }> }) {
  try {
    const { id, questionId } = await params;
    
    console.log('🔍 [API DELETE /api/lists/{id}/questions/{questionId}] Removendo questão da lista:', { listId: id, questionId });
    
    const res = await fetch(`${API_ENDPOINTS.BASE_URL}/api/lists/${id}/questions/${questionId}`, {
      method: "DELETE",
      headers: { 
        "Content-Type": "application/json",
        ...(req.headers.get('authorization') ? { 'Authorization': req.headers.get('authorization')! } : {})
      },
    });
    
    console.log('📦 [API DELETE /api/lists/{id}/questions/{questionId}] Status da resposta:', res.status);
    
    const data = await res.json();
    console.log('📦 [API DELETE /api/lists/{id}/questions/{questionId}] Dados da resposta:', data);
    
    if (!res.ok) {
      console.error('❌ [API DELETE /api/lists/{id}/questions/{questionId}] Erro do backend:', data);
      return NextResponse.json({ 
        error: data.message || data.error || "Erro ao remover questão da lista" 
      }, { status: res.status });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ [API DELETE /api/lists/{id}/questions/{questionId}] Erro interno:', error);
    return NextResponse.json({ 
      error: `Erro interno do servidor: ${error instanceof Error ? error.message : 'Erro desconhecido'}` 
    }, { status: 500 });
  }
}