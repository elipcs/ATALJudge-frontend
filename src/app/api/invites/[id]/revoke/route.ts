import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: inviteId } = await params;

    if (!inviteId) {
      return NextResponse.json({ error: 'ID do convite não fornecido' }, { status: 400 });
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    
    const authToken = request.headers.get('authorization');
    
    
    const res = await fetch(`${apiUrl}/invites/revoke/${inviteId}`, {
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
    
    if (!revokeData.success) {
      return NextResponse.json({ 
        error: revokeData.message || 'Erro ao revogar convite' 
      }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Convite revogado com sucesso' });

  } catch (error) {
    console.error('Erro ao revogar convite:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
