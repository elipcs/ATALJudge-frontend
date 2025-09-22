import { NextRequest, NextResponse } from 'next/server';
import users from '@/mocks/users.json';

// Simulação de diferentes tipos de usuários logados
function getCurrentUserId(tipo: 'professor' | 'aluno' | 'monitor' = 'professor'): string {
  // Exemplos de usuários do mock por tipo
  const usersByType = {
    professor: "6500000000000000002001", // Melina Mongiovi
    aluno: "6500000000000000001001",     // João da Silva
    monitor: "6500000000000000003001"    // Bob Monitor
  };
  
  return usersByType[tipo];
}

export async function GET(request: NextRequest) {
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

    const user = users.find(u => u._id.$oid === userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Dados específicos por tipo de usuário
    const getInstituicaoByType = (role: string) => {
      return role === 'teacher' ? 'Universidade Federal de Campina Grande' : 
             role === 'monitor' ? 'Universidade Federal de Campina Grande' :
             'Universidade Federal de Campina Grande';
    };

    const getDepartamentoByType = (role: string) => {
      return role === 'teacher' ? 'Departamento de Sistemas e Computação' : 
             role === 'monitor' ? 'Departamento de Sistemas e Computação' :
             'Ciência da Computação';
    };

    const getTituloByType = (role: string) => {
      return role === 'teacher' ? 'Professor Doutor' : 
             role === 'monitor' ? 'Monitor' :
             'Estudante';
    };

    const getBiografiaByType = (role: string) => {
      return role === 'teacher' ? 'Professor experiente em algoritmos e programação, apaixonado por ensinar e orientar estudantes.' : 
             role === 'monitor' ? 'Monitor dedicado, ajudando colegas com exercícios e projetos de programação.' :
             'Estudante de Ciência da Computação, interessado em desenvolvimento de software e algoritmos.';
    };

    // Transformar os dados do mock para o formato esperado pela interface
    const userData = {
      id: user._id.$oid,
      nome: user.name,
      email: user.email,
      tipo: user.role as 'professor' | 'aluno' | 'monitor',
      avatar: user.avatar,
      biografia: getBiografiaByType(user.role),
      instituicao: getInstituicaoByType(user.role),
      departamento: getDepartamentoByType(user.role),
      titulo: getTituloByType(user.role),
      criadoEm: '2025-01-01T00:00:00.000Z',
      ultimoLogin: new Date().toISOString()
    };

    return NextResponse.json(userData);
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    const { nome, biografia, instituicao, departamento, titulo } = body;

    // Em uma implementação real, aqui você salvaria no banco de dados
    // Por enquanto, vamos apenas simular uma resposta de sucesso
    
    // Validações básicas
    if (!nome || nome.trim().length === 0) {
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
        { status: 400 }
      );
    }

    console.log('Dados recebidos para atualização:', {
      userId,
      tipoUsuario,
      nome,
      biografia,
      instituicao,
      departamento,
      titulo
    });

    // Simular salvamento bem-sucedido
    return NextResponse.json({
      message: 'Perfil atualizado com sucesso',
      data: {
        nome,
        biografia,
        instituicao,
        departamento,
        titulo
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}