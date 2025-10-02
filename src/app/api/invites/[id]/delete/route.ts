import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
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
    
    const res = await fetch(`${apiUrl}/invites/${inviteId}`, {
      method: "DELETE",
      headers: { 
        "Content-Type": "application/json",
        ...(authToken && { 'Authorization': authToken })
      },
    });

    if (!res.ok) {
      let errorMessage = 'Erro ao excluir convite';
      try {
        const error = await res.json();
        errorMessage = error.message || error.error || errorMessage;
      } catch (jsonError) {
        console.warn('Erro ao fazer parse da resposta de erro:', jsonError);
      }
      return NextResponse.json({ 
        error: errorMessage
      }, { status: res.status });
    }

    const contentType = res.headers.get('content-type');
    let data = null;
    
    if (contentType && contentType.includes('application/json')) {
      try {
        data = await res.json();
      } catch (jsonError) {
        console.warn('Erro ao fazer parse da resposta JSON:', jsonError);
        return NextResponse.json({ success: true, message: 'Convite excluído com sucesso' });
      }
    }
    
    if (!data || !data.success) {
      if (res.status >= 200 && res.status < 300) {
        return NextResponse.json({ success: true, message: 'Convite excluído com sucesso' });
      }
      return NextResponse.json({ 
        error: data?.message || 'Erro ao excluir convite' 
      }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Convite excluído com sucesso' });

  } catch (error) {
    console.error('Erro ao excluir convite:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
