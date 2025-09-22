import { NextRequest, NextResponse } from 'next/server';

interface SystemNotice {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  date: string;
  priority: 'low' | 'medium' | 'high';
  targetAudience: 'all' | 'professors' | 'students';
}

const systemNotices: SystemNotice[] = [
  {
    id: '1',
    title: 'Manutenção Programada',
    message: 'O sistema ficará indisponível das 02:00 às 04:00 para manutenção preventiva dos servidores.',
    type: 'warning',
    date: '2024-09-10T02:00:00Z',
    priority: 'high',
    targetAudience: 'all'
  },
  {
    id: '2',
    title: 'Nova Funcionalidade - Exportação de Notas',
    message: 'Agora você pode exportar as notas dos alunos diretamente da página de turmas em formato CSV.',
    type: 'success',
    date: '2024-09-08T10:00:00Z',
    priority: 'medium',
    targetAudience: 'professors'
  },
  {
    id: '3',
    title: 'Backup Automático Realizado',
    message: 'Backup automático dos dados realizado com sucesso. Todos os dados estão seguros.',
    type: 'info',
    date: '2024-09-07T02:00:00Z',
    priority: 'low',
    targetAudience: 'professors'
  },
  {
    id: '4',
    title: 'Atualização de Segurança',
    message: 'Implementadas melhorias de segurança no sistema de autenticação.',
    type: 'success',
    date: '2024-09-06T16:00:00Z',
    priority: 'medium',
    targetAudience: 'all'
  },
  {
    id: '5',
    title: 'Sistema de Reset Implementado',
    message: 'Professores agora podem fazer reset controlado dos dados do sistema através da página de configurações.',
    type: 'info',
    date: '2024-09-08T14:30:00Z',
    priority: 'medium',
    targetAudience: 'professors'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const audience = searchParams.get('audience') || 'all';
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Filtrar avisos por público-alvo
    let filteredNotices = systemNotices.filter(notice => 
      notice.targetAudience === audience || notice.targetAudience === 'all'
    );
    
    // Ordenar por prioridade e data (mais recentes primeiro)
    filteredNotices.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    
    // Limitar quantidade
    filteredNotices = filteredNotices.slice(0, limit);
    
    return NextResponse.json({
      notices: filteredNotices,
      total: filteredNotices.length,
      lastUpdate: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro ao obter avisos:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Endpoint para marcar aviso como lido (futuro)
export async function POST(request: NextRequest) {
  try {
    const { noticeId, userId } = await request.json();
    
    // Em produção, salvaria no banco que o usuário leu o aviso
    console.log(`Usuário ${userId} leu o aviso ${noticeId}`);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Aviso marcado como lido' 
    });

  } catch (error) {
    console.error('Erro ao marcar aviso:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/*
// EM PRODUÇÃO, A IMPLEMENTAÇÃO SERIA MAIS ROBUSTA:
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const user = await verifyToken(token);
    
    const notices = await db.systemNotices.findMany({
      where: {
        OR: [
          { targetAudience: 'all' },
          { targetAudience: user.type },
        ],
        active: true,
        expiresAt: { gt: new Date() }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
      take: parseInt(searchParams.get('limit') || '10')
    });
    
    // Marcar avisos não lidos
    const unreadNotices = await db.noticeReads.findMany({
      where: {
        userId: user.id,
        noticeId: { in: notices.map(n => n.id) }
      }
    });
    
    const readNoticeIds = new Set(unreadNotices.map(ur => ur.noticeId));
    
    return NextResponse.json({
      notices: notices.map(notice => ({
        ...notice,
        isRead: readNoticeIds.has(notice.id)
      })),
      unreadCount: notices.filter(n => !readNoticeIds.has(n.id)).length
    });
    
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
*/
