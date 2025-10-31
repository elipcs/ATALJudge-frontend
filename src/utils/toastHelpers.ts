/**
 * Helpers para exibição de toasts de forma consistente
 */

import { toast as toastFn } from "@/hooks/use-toast";
import { ApiError } from "@/config/api";

/**
 * Exibe um toast de erro
 * @param error Erro a ser exibido (pode ser string, Error, ApiError, etc)
 * @param title Título do toast (opcional)
 */
export function toastError(error: unknown, title = "Erro"): void {
  let description = "Ocorreu um erro inesperado";

  if (error instanceof ApiError) {
    description = error.message;
  } else if (error instanceof Error) {
    description = error.message;
  } else if (typeof error === "string") {
    description = error;
  }

  toastFn({
    title,
    description,
    variant: "destructive",
  });
}

/**
 * Exibe um toast de sucesso
 * @param message Mensagem de sucesso
 * @param title Título do toast (opcional)
 */
export function toastSuccess(message: string, title = "Sucesso"): void {
  toastFn({
    title,
    description: message,
  });
}

/**
 * Exibe um toast de informação
 * @param message Mensagem informativa
 * @param title Título do toast (opcional)
 */
export function toastInfo(message: string, title = "Informação"): void {
  toastFn({
    title,
    description: message,
  });
}

/**
 * Helper para executar uma ação assíncrona com tratamento de erro automático via toast
 * @param action Função assíncrona a ser executada
 * @param successMessage Mensagem de sucesso (opcional)
 * @param errorTitle Título do toast de erro (opcional)
 * @returns Promise com o resultado da ação ou undefined em caso de erro
 */
export async function executeWithToast<T>(
  action: () => Promise<T>,
  successMessage?: string,
  errorTitle = "Erro"
): Promise<T | undefined> {
  try {
    const result = await action();
    
    if (successMessage) {
      toastSuccess(successMessage);
    }
    
    return result;
  } catch (error) {
    toastError(error, errorTitle);
    return undefined;
  }
}

