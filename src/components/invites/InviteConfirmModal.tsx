import React from "react";
import { Button } from "../ui/button";

interface InviteConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  type: "revoke" | "delete";
  invitee: string;
  loading?: boolean;
}

export default function InviteConfirmModal({
  isOpen,
  onConfirm,
  onCancel,
  type,
  invitee,
  loading = false,
}: InviteConfirmModalProps) {
  if (!isOpen) return null;
  const isDelete = type === "delete";
  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-2xl mx-4 my-8">
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-3 rounded-xl ${isDelete ? 'bg-red-100' : 'bg-yellow-100'}`}>
            <svg className={`w-6 h-6 ${isDelete ? 'text-red-600' : 'text-yellow-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
            {isDelete ? "Excluir Convite" : "Revogar Convite"}
          </h2>
        </div>
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {isDelete ? "Confirmar exclusão" : "Confirmar revogação"}
            </h3>
            <p className="text-slate-600">
              Tem certeza que deseja {isDelete ? "excluir" : "revogar"} o convite para <strong>{invitee}</strong>?
            </p>
            <p className={`text-sm font-medium mt-2 ${isDelete ? 'text-red-600' : 'text-yellow-700'}`}>
              Esta ação não pode ser desfeita.
            </p>
          </div>
          <div className="flex gap-3 mt-8 pt-6 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 h-12 border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold rounded-xl transition-all duration-200 order-1"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 h-12 bg-gradient-to-r ${isDelete ? 'from-red-600 to-red-700 hover:from-red-700 hover:to-red-800' : 'from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600'} text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed order-2`}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {isDelete ? "Excluindo..." : "Revogando..."}
                </div>
              ) : (
                isDelete ? "Sim, Excluir" : "Sim, Revogar"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
