import { NextRequest, NextResponse } from 'next/server';

// Simulação de diferentes tipos de usuários logados
function getCurrentUserId(tipo: 'professor' | 'aluno' | 'monitor' = 'professor'): string {
  const usersByType = {
    professor: "6500000000000000002001", // Melina Mongiovi
    aluno: "6500000000000000001001",     // João da Silva
    monitor: "6500000000000000003001"    // Bob Monitor
  };
  
  return usersByType[tipo];
}

export async function POST(request: NextRequest) {
  try {
    // Permite trocar o tipo via query parameter para teste
    const { searchParams } = new URL(request.url);
    const tipoUsuario = searchParams.get('tipo') as 'professor' | 'aluno' | 'monitor' || 'professor';
    
    const userId = getCurrentUserId(tipoUsuario);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('avatar') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo foi enviado' },
        { status: 400 }
      );
    }

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Apenas imagens são permitidas' },
        { status: 400 }
      );
    }

    // Validar tamanho (2MB máximo)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'A imagem deve ter no máximo 2MB' },
        { status: 400 }
      );
    }

    // Em uma implementação real, aqui você salvaria o arquivo
    // e retornaria a URL do avatar atualizado
    
    console.log('Upload de avatar solicitado:', {
      userId,
      tipoUsuario,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });

    // Simular upload bem-sucedido
    const avatarUrl = `/profile-default.svg?t=${Date.now()}`;

    return NextResponse.json({
      message: 'Avatar atualizado com sucesso',
      avatarUrl
    });
  } catch (error) {
    console.error('Erro ao fazer upload do avatar:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}