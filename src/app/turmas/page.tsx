"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import PageHeader from "@/components/PageHeader";
import LoadingSpinner from "@/components/LoadingSpinner";

import classesData from "@/mocks/classes.json";
import studentsData from "@/mocks/students.json";

export interface classesMock {
  id: string;
  name: string;
  professorId: string;
  professorName: string;
  created_at: string;
  studentsCount: number;
}

export interface studentsMock {
  id: string;
  name: string;
  email: string;
  studentID: string;
  class_id: string;
  grades?: number[];
  created_at: string;
}

// Dados dos mocks
const mockClasses: classesMock[] = (classesData as any[]).map((cls) => ({
  id: cls._id?.$oid || "",
  name: cls.name,
  professorId: cls.teacher_id?.$oid || "",
  professorName: cls.teacher_name,
  created_at: cls.created_at,
  studentsCount: Array.isArray(cls.students) ? cls.students.length : 0,
}));
const mockStudents: studentsMock[] = (studentsData as any[]).map((student) => ({
  id: student._id?.$oid || "",
  name: student.name,
  email: student.email,
  studentID: student.studentID,
  class_id: student.class_id?.$oid || "",
  grades: Array.isArray(student.grades) ? student.grades.map((g: any) => g.score) : [],
  created_at: student.created_at,
}));

// Funções auxiliares
function getClassById(id: string): classesMock | undefined {
  return mockClasses.find(cls => cls.id === id);
}

function getStudentsByClassId(class_id: string): studentsMock[] {
  return mockStudents.filter(student => student.class_id === class_id);
}

function createMockClass(name: string, professorId: string, professorName: string): classesMock {
  const id = (mockClasses.length + 1).toString();
  const codigo = name.replace(/\s+/g, '').substring(0, 6).toUpperCase() + new Date().getFullYear();
  
  return {
    id,
    name,
    professorId,
    professorName,
    created_at: new Date().toISOString(),
    studentsCount: 0,
  };
}

interface Class {
  id: string;
  name: string;
  professorId: string;
  created_at: string;
  studentsCount: number;
}

interface Student {
  id: string;
  name: string;
  email: string;
  studentID: string;
  grades?: number[];
  created_at: string;
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [nameClass, setNameClass] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [classDetails, setClassDetails] = useState<{ cls: Class; students: Student[] } | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [createClassModal, setCreateClassModal] = useState(false);
  const [userRole, setuserRole] = useState('professor');
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Detectar tipo de usuário e reagir a mudanças
  useEffect(() => {
    const detectAndSetuserRole = () => {
      let detecteduserRole = 'professor';
      if (typeof window !== 'undefined') {
        const manualuserRole = localStorage.getItem('manual-userRole');
        if (manualuserRole) detecteduserRole = manualuserRole;
        else {
          const token = localStorage.getItem('token');
          if (token) {
            try {
              const payload = JSON.parse(atob(token.split('.')[1]));
              detecteduserRole = payload.role || payload.userRole || 'professor';
            } catch {}
          } else {
            const saveduserRole = localStorage.getItem('userRole');
            if (saveduserRole) detecteduserRole = saveduserRole;
          }
        }
      }
      
      if (detecteduserRole !== userRole) {
        setuserRole(detecteduserRole);
        // Limpar dados para recarregar com novo tipo
        setClasses([]);
        setClassDetails(null);
        setShowDetails(false);
      }
    };

    detectAndSetuserRole();

    // Observar mudanças no localStorage
    const handleStorageChange = () => {
      detectAndSetuserRole();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Também verificar periodicamente para mudanças no mesmo tab
    const interval = setInterval(detectAndSetuserRole, 500);

    // Escutar evento customizado de mudança de tipo de usuário
    const handleuserRoleChange = (event: CustomEvent) => {
      const newuserRole = event.detail;
      if (newuserRole !== userRole) {
        setuserRole(newuserRole);
        setClasses([]);
        setClassDetails(null);
        setShowDetails(false);
      }
    };

    window.addEventListener('userRoleChanged', handleuserRoleChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userRoleChanged', handleuserRoleChange as EventListener);
      clearInterval(interval);
    };
  }, [userRole]);

  // Carregar dados baseado no tipo de usuário
  useEffect(() => {
    if (userRole === 'student') {
      // Buscar aluno pelo email/studentID do localStorage
      const userEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null;
      const userstudentID = typeof window !== 'undefined' ? localStorage.getItem('userstudentID') : null;
      let student = null;
      if (userEmail || userstudentID) {
        student = mockStudents.find((a: any) => a.email === userEmail || a.studentID === userstudentID);
      }
      // Se não encontrar por email/studentID, usar um aluno padrão para demonstração
      if (!student) {
        student = mockStudents[0]; // João da Silva
      }
      if (student) {
        // Buscar turma
        const cls = mockClasses.find((c: any) => c.id === student.class_id);
        if (cls) {
          // Buscar alunos da turma
          const studentsMock = mockStudents.filter((a: any) => a.class_id === cls.id);
          setClassDetails({
            cls: {
              id: cls.id,
              name: cls.name,
              professorId: cls.professorId,
              created_at: cls.created_at,
              studentsCount: cls.studentsCount
            },
            students: studentsMock.map((student: Student) => ({
              id: student.id,
              name: student.name,
              email: student.email,
              studentID: student.studentID,
              grades: student.grades,
              created_at: student.created_at
            }))
          });
        }
      }
    } else {
      // Professor e Monitor carregam todas as turmas
      loadClasses();
    }
  }, [userRole]); // Dependência no userRole para recarregar quando mudar

  useEffect(() => {
    loadClasses();
  }, []);

  async function loadClasses() {
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Usar mocks em vez de API real
      const formattedClasses = mockClasses.map(cls => ({
        id: cls.id,
        name: cls.name,
        professorId: cls.professorId,
        created_at: cls.created_at,
        studentsCount: cls.studentsCount
      }));
      
      setClasses(formattedClasses);
    } catch (error) {
      console.error('Erro ao carregar turmas:', error);
    }
  }

  async function createClass() {
    if (!nameClass.trim()) {
      setError('Nome da turma é obrigatório');
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Criar turma usando mock
      const newClass = createMockClass(nameClass.trim(), "6500000000000000002001", "Melina Mongiovi");
      const formattedClass = {
        id: newClass.id,
        name: newClass.name,
        professorId: newClass.professorId,
        created_at: newClass.created_at,
        studentsCount: newClass.studentsCount
      };
      
      // Adicionar ao mock global (simulação)
      mockClasses.push(newClass);
      
      setClasses(prev => [formattedClass, ...prev]);
      setNameClass("");
      setSuccess('Turma criada com sucesso!');
      setCreateClassModal
      (false); // Fechar modal
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (error: any) {
      setError(error.message || 'Erro ao criar turma');
    } finally {
      setLoading(false);
    }
  }

  async function viewDetails(cls: Class) {
    setLoadingDetails(true);
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // Buscar alunos usando mock
      const studentsMock = getStudentsByClassId(cls.id);
      const formattedStudents = studentsMock.map(student => ({
        id: student.id,
        name: student.name,
        email: student.email,
        studentID: student.studentID,
        grades: student.grades || [],
        created_at: student.created_at
      }));
      
      setClassDetails({ cls, students: formattedStudents });
    } catch (error) {
      console.error('Erro ao carregar alunos:', error);
    } finally {
      setLoadingDetails(false);
    }
  }

  async function deleteClass(id: string) {
    if (!confirm('Tem certeza que deseja excluir esta turma? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Remover do mock
      const turmaIndex = mockClasses.findIndex(c => c.id === id);
      if (turmaIndex !== -1) {
        mockClasses.splice(turmaIndex, 1);
      }

      setClasses(prev => prev.filter(c => c.id !== id));
      if (classDetails?.cls.id === id) {
        setClassDetails(null);
      }
    } catch (error) {
      console.error('Erro ao excluir turma:', error);
    }
  }

  // Função para exportar planilha
  function exportarPlanilha() {
    if (!classDetails || classDetails.students.length === 0) return;

    const dados = classDetails.students.map((student, index) => ({
      'Nº': index + 1,
      'Nome': student.name,
      'Matrícula': student.studentID,
      'Email': student.email,
      'Notas': Array.isArray(student.grades) && student.grades.length > 0
        ? student.grades.map(n => n.toFixed(1)).join(', ')
        : 'N/A',
    }));

    // Criar CSV
    const headers = Object.keys(dados[0]);
    const csvContent = [
      headers.join(','),
      ...dados.map(row => headers.map(header => `"${row[header as keyof typeof row]}"`).join(','))
    ].join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `turma_${classDetails.cls.name.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  const getPageHeaderProps = () => {
    if (userRole === 'student') {
      return {
        title: 'Minha Turma',
        description: 'Informações sobre sua turma e colegas.'
      };
    } else if (userRole === 'professor') {
      return {
        title: 'Gerenciar Turmas',
        description: 'Crie e gerencie suas turmas. Cada aluno será cadastrado em uma turma específica.'
      };
    } else {
      return {
        title: 'Turmas do Sistema',
        description: 'Visualize e monitore todas as turmas do sistema.'
      };
    }
  };

  return (
    <div className="p-6">
      {/* Header usando componente PageHeader */}
      <PageHeader {...getPageHeaderProps()}>
        {/* Botão de criar turma apenas para professor */}
        {userRole === 'professor' && (
          <Button
            onClick={() => setCreateClassModal(true)}
            className="bg-slate-800 hover:bg-slate-900 text-white"
          >
            <svg className="w-4 h-4 mr-2" fill="white" stroke="white" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nova Turma
          </Button>
        )}
      </PageHeader>

      {/* Mensagens de feedback globais */}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      {/* Lista de Turmas - para todos os tipos de usuário */}
      {userRole === 'professor' && (
        <>
          {/* Seção Minhas Turmas */}
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              Minhas Turmas ({classes.filter(c => c.professorId === "6500000000000000002001").length})
            </h2>
            {classes.filter(c => c.professorId === "6500000000000000002001").length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>Nenhuma turma criada ainda.</p>
                <p className="text-sm">Crie sua primeira turma ao lado!</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {classes.filter(c => c.professorId === "6500000000000000002001").map(cls => (
                  <div key={cls.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-medium text-gray-900">{cls.name}</h3>
                        </div>
                        <div className="text-sm text-gray-500 mb-1">
                          Professor: <span className="font-semibold text-gray-700">{mockClasses.find(c => c.id === cls.id)?.professorName || 'Desconhecido'}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          <span className="mr-4">
                            <svg className="inline w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                            </svg>
                            {cls.studentsCount} alunos
                          </span>
                          <span>
                            <svg className="inline w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                            </svg>
                            {new Date(cls.created_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => viewDetails(cls)}
                          className="text-xs"
                        >
                          Ver Alunos
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteClass(cls.id)}
                          className="text-red-600 hover:text-red-700 hover:border-red-300 text-xs"
                        >
                          Excluir
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}

      {userRole !== 'professor' && (
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {userRole === 'monitor' ? 'Todas as Turmas' : 'Minha Turma'} ({userRole === 'student' && classDetails ? 1 : classes.length})
          </h2>
        {userRole === 'student' && classDetails ? (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div key={classDetails.cls.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-medium text-gray-900">{classDetails.cls.name}</h3>
                  </div>
                  <div className="text-sm text-gray-500 mb-1">
                    Professor: <span className="font-semibold text-gray-700">{mockClasses.find(c => c.id === classDetails.cls.id)?.professorName || 'Desconhecido'}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    <span className="mr-4">
                      <svg className="inline w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                      </svg>
                      {classDetails.cls.studentsCount} alunos
                    </span>
                    <span>
                      <svg className="inline w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                      </svg>
                      {new Date(classDetails.cls.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowDetails(prev => !prev)}
                    className="text-xs"
                  >
                    {showDetails ? 'Ocultar Alunos' : 'Ver Alunos'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : classes.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>Nenhuma turma {userRole === 'professor' ? 'criada' : 'encontrada'} ainda.</p>
            {userRole === 'professor' && <p className="text-sm">Crie sua primeira turma ao lado!</p>}
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {classes.map(cls => (
              <div key={cls.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-medium text-gray-900">{cls.name}</h3>
                    </div>
                    <div className="text-sm text-gray-500 mb-1">
                      Professor: <span className="font-semibold text-gray-700">{mockClasses.find(c => c.id === cls.id)?.professorName || 'Desconhecido'}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      <span className="mr-4">
                        <svg className="inline w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                        </svg>
                        {cls.studentsCount} alunos
                      </span>
                      <span>
                        <svg className="inline w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                        </svg>
                        {new Date(cls.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => viewDetails(cls)}
                      className="text-xs"
                    >
                      Ver Alunos
                    </Button>
                    {/* Botão excluir apenas para professor */}
                    {userRole === 'professor' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteClass(cls.id)}
                        className="text-red-600 hover:text-red-700 hover:border-red-300 text-xs"
                      >
                        Excluir
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
      )}

      {/* Painel de Detalhes da Turma - Embaixo */}
        {loadingDetails && (
          <Card className="p-6">
            <LoadingSpinner message="Carregando detalhes da turma..." />
          </Card>
        )}

        {classDetails && !loadingDetails && (userRole !== 'student' || showDetails) && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Alunos da Turma: {classDetails.cls.name}
                </h2>
                <p className="text-gray-600 mt-1">
                  {classDetails.students.length} alunos cadastrados • 
                  Criada em {new Date(classDetails.cls.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="flex gap-2">
                {/* Botão de exportar planilha - apenas para professor e monitor */}
                {classDetails.students.length > 0 && userRole !== 'student' && (
                  <Button
                    size="sm"
                    onClick={exportarPlanilha}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <svg className="inline w-4 h-4 mr-1" fill="white" viewBox="0 0 20 20">
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                    </svg>
                    Exportar Planilha
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (userRole === 'student') {
                      setShowDetails(false);
                    } else {
                      setClassDetails(null);
                    }
                  }}
                >
                  ✕ Fechar
                </Button>
              </div>
            </div>

            {classDetails.students.length === 0 ? (
              <div className="text-center text-gray-500 py-12 bg-gray-50 rounded-lg">
                <div className="mb-4 text-4xl">👥</div>
                <h3 className="text-lg font-medium mb-2">Nenhum aluno cadastrado ainda</h3>
                <p className="text-sm">Os alunos aparecerão aqui quando se cadastrarem usando o link de convite.</p>
                <div className="mt-6">
                  <Button
                    size="sm"
                    onClick={() => window.open('/convites', '_blank')}
                    className="text-sm"
                  >
                    🎫 Gerar Convite para esta Turma
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg border overflow-hidden">
                {/* Cabeçalho da Tabela */}
                <div className="bg-gray-50 px-6 py-3 border-b">
                  <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-600">
                    <div className="col-span-1">#</div>
                    <div className="col-span-4">Nome</div>
                    <div className="col-span-3">Matrícula</div>
                    <div className="col-span-2">Nota</div>
                    <div className="col-span-2">Data Cadastro</div>
                  </div>
                </div>
                
                {/* Lista de Alunos */}
                <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                  {classDetails.students.map((student, index) => (
                    <div key={student.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="grid grid-cols-12 gap-4 items-center">
                        {/* Número */}
                        <div className="col-span-1">
                          <div className="flex items-center">
                            <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-medium text-indigo-600">
                              {index + 1}
                            </div>
                          </div>
                        </div>
                        
                        {/* Nome */}
                        <div className="col-span-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                              {student.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{student.name}</p>
                              <p className="text-xs text-gray-500">{student.email}</p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Matrícula */}
                        <div className="col-span-3">
                          <p className="font-mono text-sm text-gray-900">{student.studentID}</p>
                        </div>
                        
                        {/* Nota */}
                        <div className="col-span-2">
                          <div className="flex flex-wrap gap-2">
                            {Array.isArray(student.grades) && student.grades.length > 0 ? (
                              student.grades.map((grade, idx) => (
                                <span
                                  key={idx}
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    grade >= 7 ? 'bg-green-100 text-green-800' :
                                    grade >= 5 ? 'bg-yellow-100 text-yellow-800' :
                                    grade >= 0 ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}
                                >
                                  {grade.toFixed(1)}
                                </span>
                              ))
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">N/A</span>
                            )}
                          </div>
                        </div>
                        
                        {/* Data Cadastro */}
                        <div className="col-span-2">
                          <p className="text-sm text-gray-600">
                            {new Date(student.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Rodapé com Estatísticas */}
                <div className="bg-gray-50 px-6 py-3 border-t">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex gap-6">
                      <span>
                        <svg className="inline w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                        </svg>
                        Total: {classDetails.students.length} alunos
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        )}

      {/* Modal de criar turma - apenas para professor */}
      {createClassModal && userRole === 'professor' && (
        <div 
          className="fixed inset-0 bg-black/5 flex items-center justify-center z-50 animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setCreateClassModal(false);
              setNameClass("");
              setError("");
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4 animate-in slide-in-from-bottom-4 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Criar Nova Turma</h2>
              <button
                onClick={() => {
                  setCreateClassModal(false);
                  setNameClass("");
                  setError("");
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Turma</label>
                <Input 
                  value={nameClass} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNameClass(e.target.value)}
                  placeholder="Ex: Algoritmos 2025.1, Estruturas de Dados..."
                  onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === 'Enter') {
                      createClass();
                    } else if (e.key === 'Escape') {
                      setCreateClassModal(false);
                      setNameClass("");
                      setError("");
                    }
                  }}
                  autoFocus
                />
              </div>
              
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}
              
              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={() => {
                    setCreateClassModal(false);
                    setNameClass("");
                    setError("");
                  }}
                  variant="outline" 
                  className="flex-1"
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={createClass} 
                  disabled={loading || !nameClass.trim()} 
                  className="flex-1"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <LoadingSpinner size="sm" message="" className="py-0" />
                      Criando...
                    </span>
                  ) : (
                    'Criar Turma'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
