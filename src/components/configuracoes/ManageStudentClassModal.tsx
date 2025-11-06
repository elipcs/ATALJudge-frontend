import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Dropdown } from "../ui/dropdown";

interface Student {
  id: string;
  name: string;
  email: string;
  studentRegistration?: string;
  classId?: string;
  className?: string;
}

interface Class {
  id: string;
  name: string;
}

interface ManageStudentClassModalProps {
  isOpen: boolean;
  student: Student | null;
  classes: Class[];
  onClose: () => void;
  onSave: (studentId: string, classId: string | null) => Promise<void>;
}

export default function ManageStudentClassModal({
  isOpen,
  student,
  classes,
  onClose,
  onSave,
}: ManageStudentClassModalProps) {
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (student) {
      setSelectedClassId(student.classId || null);
    }
    setError(null);
  }, [student]);

  const handleSave = async () => {
    if (!student) return;

    setSaving(true);
    setError(null);

    try {
      await onSave(student.id, selectedClassId);
      onClose();
    } catch (err: any) {
      setError(err.message || "Erro ao atualizar turma do estudante");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Gerenciar Turma
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6">
          <div className="bg-slate-50 rounded-xl p-4 mb-4">
            <p className="text-sm text-slate-600 mb-1">Estudante:</p>
            <p className="font-semibold text-slate-900">{student.name}</p>
            <p className="text-sm text-slate-600">{student.email}</p>
            {student.studentRegistration && (
              <p className="text-sm text-slate-600">Matrícula: {student.studentRegistration}</p>
            )}
          </div>

          <div className="mb-4">
            <p className="text-sm text-slate-600 mb-2">Turma Atual:</p>
            <p className="font-semibold text-slate-900">
              {student.className || "Sem turma atribuída"}
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Selecionar Nova Turma:
            </label>
            <Dropdown
              value={selectedClassId || ""}
              onChange={(value) => setSelectedClassId(value || null)}
              options={[
                { value: "", label: "Remover da turma" },
                ...classes.map((cls) => ({
                  value: cls.id,
                  label: cls.name
                }))
              ]}
              placeholder="Selecione uma turma"
              className="w-full"
            />
            <p className="text-xs text-slate-500 mt-2">
              Deixe em branco para remover o estudante de qualquer turma
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            disabled={saving}
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2"></div>
                Salvando...
              </>
            ) : (
              "Salvar"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
