import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS } from "../../../../../config/api";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: inviteId } = await params;

    if (!inviteId) {
      return NextResponse.json({ error: 'ID do convite não fornecido' }, { status: 400 });
    }

    const authToken = request.headers.get('authorization');
    const res = await fetch(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.ENDPOINTS.INVITES.REVOKE(inviteId)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { 'Authorization': authToken })
      },
    });

    if (!res.ok) {
      const error = await res.json();
      return NextResponse.json({
        error: error.message || error.error || 'Erro ao revogar convite'
      }, { status: res.status });
    }

    const revokeData = await res.json();

    return NextResponse.json({ success: true, message: 'Convite revogado com sucesso' });

  } catch (error) {
    console.error('Erro ao revogar convite:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}