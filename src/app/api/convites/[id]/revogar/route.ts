import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conviteId } = await params;

    if (!conviteId) {
      return NextResponse.json({ error: 'ID do convite não fornecido' }, { status: 400 });
    }

    // TODO: Pegar token de autenticação do professor logado
    const authToken = request.headers.get('authorization');

    // Revogar convite no backend
    const response = await fetch(`${BACKEND_URL}/api/convites/${conviteId}/revogar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { 'Authorization': authToken })
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({ error: error.message || 'Erro ao revogar convite' }, { status: response.status });
    }

    return NextResponse.json({ success: true, message: 'Convite revogado com sucesso' });

  } catch (error) {
    console.error('Erro ao revogar convite:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
