import { useState, useEffect } from 'react';
import { useUserRole } from './useUserRole';
import { useCurrentUser } from './useHomeData';
import { useUserClasses, useCreateClass, useEditClass, useDeleteClass, useClassStudents } from './useClassesData';
import { Class, Student } from '@/types';

export function useClassPage() {
  const { userRole, isLoading: userRoleLoading } = useUserRole();
  const { data: currentUser } = useCurrentUser();
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [classDetails, setClassDetails] = useState<{ cls: Class; students: Student[] } | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [createClassModal, setCreateClassModal] = useState(false);
  const [editClassModal, setEditClassModal] = useState(false);
  const [deleteClassModal, setDeleteClassModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const { classes, loading: classesLoading, error: classesError, refetch: refetchClasses } = useUserClasses(currentUser?.id || '', userRole || 'student');
  const { createClass, loading: createLoading, error: createError } = useCreateClass();
  const { editClass, loading: editLoading, error: editError } = useEditClass();
  const { deleteClass, loading: deleteLoading, error: deleteError } = useDeleteClass();
  const { students, loading: studentsLoading } = useClassStudents(selectedClassId || '');

  useEffect(() => {
    if (userRole === 'student' && classes.length > 0 && !selectedClassId) {
      setSelectedClassId(classes[0].id);
    }
  }, [userRole, classes.length, selectedClassId]);

  const isStudentDataReady = userRole === 'student' && classes.length > 0 && selectedClassId && !studentsLoading;

  useEffect(() => {
    if (userRole === 'student' && selectedClassId && !studentsLoading && classes.length > 0) {
      const classData = classes.find(cls => cls.id === selectedClassId);
      if (classData) {
        const studentsToUse = students.length > 0 ? students : (classData.students || []);
        
        setClassDetails({
          cls: classData,
          students: studentsToUse
        });
        setShowDetails(true);
      }
    }
  }, [userRole, selectedClassId, studentsLoading, classes.length, students.length]);

  useEffect(() => {
    if ((userRole === 'professor' || userRole === 'assistant') && selectedClassId && !studentsLoading && classes.length > 0) {
      const classData = classes.find(cls => cls.id === selectedClassId);
      if (classData) {
        const studentsToUse = students.length > 0 ? students : (classData.students || []);
        
        setClassDetails({
          cls: classData,
          students: studentsToUse
        });
      }
    }
  }, [userRole, selectedClassId, studentsLoading, classes.length, students.length]);

  const handleCreateClass = async (nameClass: string) => {
    if (!nameClass.trim()) {
      setError('Nome da turma é obrigatório');
      return;
    }

    setError("");
    setSuccess("");

    try {
      const newClass = await createClass({
        name: nameClass.trim(),
        professorId: currentUser?.id ?? '',
        professorName: currentUser?.name ?? ''
      });
      
      if (newClass) {
        setSuccess('Turma criada com sucesso!');
        setCreateClassModal(false);
        refetchClasses();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(createError || 'Erro ao criar turma');
      }
    } catch (error: unknown) {
      setError((error as Error).message || 'Erro ao criar turma');
    }
  };

  const handleViewClassDetails = (cls: Class) => {
    setSelectedClassId(cls.id);
    setShowDetails(true);
  };

  const handleBackToList = () => {
    setShowDetails(false);
    setClassDetails(null);
    setSelectedClassId(null);
  };

  const isLoading = userRoleLoading || classesLoading || (!currentUser && (userRole === 'professor' || userRole === 'assistant'));
  const isStudentLoading = userRole === 'student' && !isStudentDataReady;

  const handleEditClass = async (id: string, data: { name: string }): Promise<boolean> => {
    if (userRole !== 'professor') {
      setError("Apenas professores podem editar turmas");
      return false;
    }

    try {
      setError("");
      const result = await editClass(id, data);
      
      if (result) {
        setSuccess("Turma editada com sucesso!");
        setEditClassModal(false);
        setSelectedClass(null);
        refetchClasses();
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao editar turma");
      return false;
    }
  };

  const handleDeleteClass = async (id: string): Promise<boolean> => {
    if (userRole !== 'professor') {
      setError("Apenas professores podem excluir turmas");
      return false;
    }

    try {
      setError("");
      const result = await deleteClass(id);
      
      if (result) {
        setSuccess("Turma excluída com sucesso!");
        setDeleteClassModal(false);
        setSelectedClass(null);
        refetchClasses();
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir turma");
      return false;
    }
  };

  const handleOpenEditModal = (cls: Class) => {
    if (userRole !== 'professor') {
      setError("Apenas professores podem editar turmas");
      return;
    }
    
    setSelectedClass(cls);
    setEditClassModal(true);
    setError("");
  };

  const handleOpenDeleteModal = (cls: Class) => {
    if (userRole !== 'professor') {
      setError("Apenas professores podem excluir turmas");
      return;
    }
    
    setSelectedClass(cls);
    setDeleteClassModal(true);
    setError("");
  };

  return {
    userRole,
    currentUser,
    classes,
    classDetails,
    students,
    error,
    success,
    showDetails,
    createClassModal,
    editClassModal,
    deleteClassModal,
    selectedClass,
    selectedClassId,
    isLoading,
    isStudentLoading,
    studentsLoading,
    createLoading,
    editLoading,
    deleteLoading,
    classesError,
    handleCreateClass,
    handleViewClassDetails,
    handleBackToList,
    handleEditClass,
    handleDeleteClass,
    handleOpenEditModal,
    handleOpenDeleteModal,
    setCreateClassModal,
    setEditClassModal,
    setDeleteClassModal,
    setError,
    setSuccess
  };
}
