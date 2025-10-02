import { useState, useEffect } from 'react';

import { Class, Student } from '../types';
import { classesApi } from '../services/classes';

// Hook para buscar turmas do usuário
export const useUserClasses = (userId: string, userRole: string) => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await classesApi.getUserClasses(userId, userRole);
        setClasses(result);
      } catch (err) {
        console.error('useUserClasses: erro:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar turmas');
      } finally {
        setLoading(false);
      }
    };

    // Só executar se userId e userRole estão definidos e não são strings vazias
    if (userId && userId.trim() !== '' && userRole) {
      fetchClasses();
    } else {
      // Se não há userId válido, manter loading como true até que userId esteja disponível
      // Isso evita o flash de "nenhuma turma" antes dos dados carregarem
      if (!userId || userId.trim() === '') {
        setLoading(true);
      } else {
        setLoading(false);
      }
    }
  }, [userId, userRole]);

  return { classes, loading, error };
};

// Hook para criar turma
export const useCreateClass = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createClass = async (data: {
    name: string;
    professorId: string;
    professorName: string;
  }): Promise<Class | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await classesApi.create(data);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar turma');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createClass, loading, error };
};

// Hook para excluir turma
export const useDeleteClass = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteClass = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const result = await classesApi.delete(id);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir turma');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { deleteClass, loading, error };
};

// Hook para buscar alunos de uma turma
export const useClassStudents = (classId: string) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await classesApi.getClassStudents(classId);
        setStudents(result);
      } catch (err) {
        console.error('useClassStudents: erro:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar alunos');
        setStudents([]); // Definir array vazio em caso de erro
      } finally {
        setLoading(false);
      }
    };

    if (classId && classId.trim() !== '') {
      fetchStudents();
    } else {
      // Se não há classId, não carregar e definir loading como false
      // Log removido - problema resolvido
      setLoading(false);
      setStudents([]);
    }
  }, [classId]);

  return { students, loading, error };
};

