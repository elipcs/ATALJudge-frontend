import { useState } from 'react';
import { Question } from '@/types';
import { questionsApi, CreateQuestionRequest } from '@/services/questions';

export function useQuestionActions(listId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createQuestion = async (questionData: Partial<CreateQuestionRequest>) => {
    try {
      setLoading(true);
      setError(null);
      
      const questionDataWithListId = {
        ...questionData,
        listId: listId
      };
      
      console.log('🔍 [useQuestionActions] Criando questão com dados:', questionDataWithListId);
      
      const newQuestion = await questionsApi.create(questionDataWithListId as CreateQuestionRequest);
      
      console.log('📦 [useQuestionActions] Questão criada e adicionada à lista:', newQuestion);
      
      if (!newQuestion || !newQuestion.id) {
        throw new Error('Questão criada mas sem ID válido');
      }
      
      return newQuestion;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateQuestion = async (questionId: string, questionData: Partial<CreateQuestionRequest>) => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedQuestion = await questionsApi.update(questionId, questionData);
      
      return updatedQuestion;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteQuestion = async (questionId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await questionsApi.removeFromList(listId, questionId);
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const generateTestCasesForQuestion = async (questionId: string, referenceCode: string, language: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const testCases = await questionsApi.generateTestCases(questionId, referenceCode, language);
      
      return testCases;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    generateTestCases: generateTestCasesForQuestion
  };
}
