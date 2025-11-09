"use client";

import React, { useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import MarkdownRenderer from '@/components/MarkdownRenderer';

interface TextEditorWithLatexProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  showPreview?: boolean;
}

/**
 * Editor WYSIWYG profissional usando TipTap
 * - Compatível com Google Docs/ChatGPT (cola preservando formatação)
 * - Listas, negrito, itálico automáticos
 * - Fórmulas matemáticas com suporte a LaTeX
 * - Conversão robusta com Markdown
 */
export default function TextEditorWithLatex({
  value,
  onChange,
  placeholder = 'Cole o conteúdo aqui...',
  className = '',
  showPreview = false,
}: TextEditorWithLatexProps) {
  const shouldShowPreview = showPreview && value.length > 0;

  /**
   * Converter Markdown para HTML para renderizar no TipTap
   * Versão simplificada e robusta
   */
  const markdownToHtml = useCallback((markdown: string): string => {
    if (!markdown) return '';

    let html = markdown;

    // Passo 1: Proteger fórmulas com placeholders
    const formulas: { [key: string]: string } = {};
    let formulaIndex = 0;

    html = html.replace(/\$([^\$]+)\$/g, (match: string, content: string) => {
      const placeholder = `__FORMULA_${formulaIndex}__`;
      formulas[placeholder] = content;
      formulaIndex++;
      return placeholder;
    });

    // Passo 2: Dividir em linhas
    const lines = html.split('\n');
    let result = '';
    let inList = false;

    for (const line of lines) {
      const trimmed = line.trim();

      // Detectar linhas de lista
      if (trimmed.startsWith('- ')) {
        if (!inList) {
          result += '<ul>';
          inList = true;
        }
        const content = trimmed.substring(2).trim();
        result += `<li><p>${content}</p></li>`;
      } else {
        // Fechar lista se estava aberta
        if (inList) {
          result += '</ul>';
          inList = false;
        }

        // Adicionar parágrafos não-vazios
        if (trimmed) {
          result += `<p>${trimmed}</p>`;
        }
      }
    }

    // Fechar lista se ainda estiver aberta
    if (inList) result += '</ul>';

    // Passo 3: Restaurar fórmulas com destaque
    Object.entries(formulas).forEach(([placeholder, formula]) => {
      const highlighted = `<mark style="background: #dbeafe; color: #1e40af; padding: 2px 6px; border-radius: 4px;">$${formula}$</mark>`;
      result = result.replace(new RegExp(placeholder, 'g'), highlighted);
    });

    // Passo 4: Processarformatação inline
    result = result.replace(/\*\*([^\*]+)\*\*/g, (match: string, content: string) => `<strong>${content}</strong>`);
    result = result.replace(/\*([^\*]+)\*/g, (match: string, content: string) => `<em>${content}</em>`);
    result = result.replace(/`([^`]+)`/g, (match: string, content: string) => `<code>${content}</code>`);

    return result;
  }, []);

  /**
   * Converter HTML do TipTap para Markdown
   * Versão robusta usando métodos estruturados
   */
  const htmlToMarkdown = useCallback((html: string): string => {
    if (!html) return '';

    let result = html;

    // Passo 1: Converter formulas - mark com $ volta a $...$
    result = result.replace(/<mark[^>]*>\$([^<]+)\$<\/mark>/g, (match: string, content: string) => {
      return `$${content}$`;
    });

    // Passo 2: Converter listas - ANTES de parágrafos!
    // Isso evita que <p> interfira com a conversão de <li>
    result = result.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/g, (match: string, content: string) => {
      // Converter cada <li> em uma linha com -
      let listContent = content.replace(/<li[^>]*>([\s\S]*?)<\/li>/g, (liMatch: string, liContent: string) => {
        // Remover tags de parágrafo dentro de li
        let itemText = liContent.replace(/<p[^>]*>/g, '').replace(/<\/p>/g, '').trim();
        return `- ${itemText}\n`;
      });
      return listContent;
    });

    // Passo 3: Converter parágrafos
    result = result.replace(/<p[^>]*>([\s\S]*?)<\/p>/g, (match: string, content: string) => {
      return `${content.trim()}\n`;
    });

    // Passo 4: Remover tags HTML restantes
    result = result.replace(/<[^>]+>/g, '');

    // Passo 5: Converter formatação inline
    // Nota: TipTap pode ter convertido para <strong>, <em>, etc
    result = result.replace(/([*]{2}|<strong>|<b>)(.+?)([*]{2}|<\/strong>|<\/b>)/g, '**$2**');
    result = result.replace(/([*]|<em>|<i>)(.+?)([*]|<\/em>|<\/i>)/g, '*$2*');
    result = result.replace(/(<code>|`)(.+?)(<\/code>|`)/g, '`$2`');

    // Passo 6: Limpar espaços em branco
    result = result.replace(/\n\n\n+/g, '\n\n');
    result = result.trim();

    return result;
  }, []);

  /**
   * Processar HTML colado do Google Docs/ChatGPT
   * Remove estilos problemáticos e detecta fórmulas
   */
  const transformPastedHTML = useCallback((html: string): string => {
    let processed = html;

    // Remover atributos style
    processed = processed.replace(/\s+style="[^"]*"/g, '');

    // Remover spans vazios
    processed = processed.replace(/<span[^>]*>\s*<\/span>/g, '');
    processed = processed.replace(/<span[^>]*>/g, '');
    processed = processed.replace(/<\/span>/g, '');

    // Converter divs em parágrafos (exceto listas)
    if (!processed.includes('<li')) {
      processed = processed.replace(/<div[^>]*>/g, '<p>');
      processed = processed.replace(/<\/div>/g, '</p>');
    }

    // Quebras de linha
    processed = processed.replace(/<br\s*\/?>/g, '\n');

    // Limpar múltiplos espaços
    processed = processed.replace(/\s{2,}/g, ' ');

    // Detectar linhas que parecem ser lista
    if (!processed.includes('<ul') && !processed.includes('<li')) {
      if (processed.includes('\n- ') || processed.includes('\n* ')) {
        const lines = processed.split('\n');
        let result = '';
        let inList = false;

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            if (!inList) {
              result += '<ul>';
              inList = true;
            }
            const content = trimmed.substring(2);
            result += `<li><p>${content}</p></li>`;
          } else if (trimmed) {
            if (inList) {
              result += '</ul>';
              inList = false;
            }
            result += `<p>${trimmed}</p>`;
          }
        }

        if (inList) result += '</ul>';
        processed = result;
      }
    }

    return processed;
  }, []);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: 'list-disc list-outside ml-6 pl-2',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'list-decimal list-outside ml-6 pl-2',
          },
        },
        listItem: {
          HTMLAttributes: {
            class: 'mb-1',
          },
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: markdownToHtml(value),
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] px-4 py-3',
      },
      transformPastedHTML,
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const markdown = htmlToMarkdown(html);
      onChange(markdown);
    },
  });

  // Sincronizar quando o valor externo muda
  useEffect(() => {
    if (editor && value) {
      const currentMarkdown = htmlToMarkdown(editor.getHTML());
      if (currentMarkdown !== value) {
        editor.commands.setContent(markdownToHtml(value));
      }
    }
  }, [value, editor, htmlToMarkdown, markdownToHtml]);

  return (
    <div className="space-y-2">
      {!shouldShowPreview && (
        <div>
          {editor && (
            <div className="flex gap-1 border border-slate-200 rounded-lg p-1 w-fit">
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  editor.isActive('bold') ? 'bg-slate-200 text-slate-900' : 'text-slate-600 hover:bg-slate-100'
                }`}
                title="Negrito (Ctrl+B)"
              >
                <strong>B</strong>
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  editor.isActive('italic') ? 'bg-slate-200 text-slate-900' : 'text-slate-600 hover:bg-slate-100'
                }`}
                title="Itálico (Ctrl+I)"
              >
                <em>I</em>
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  editor.isActive('bulletList') ? 'bg-slate-200 text-slate-900' : 'text-slate-600 hover:bg-slate-100'
                }`}
                title="Lista com bullets"
              >
                • Lista
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleCode().run()}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  editor.isActive('code') ? 'bg-slate-200 text-slate-900' : 'text-slate-600 hover:bg-slate-100'
                }`}
                title="Código inline"
              >
                {'</>'}
              </button>
            </div>
          )}
        </div>
      )}

      {shouldShowPreview ? (
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-5 border border-slate-200 overflow-auto min-h-[200px] shadow-sm">
          <div className="prose prose-sm max-w-none">
            {value ? (
              <MarkdownRenderer content={value} />
            ) : (
              <p className="text-slate-400 italic text-sm">
                Nada a visualizar ainda...
              </p>
            )}
          </div>
        </div>
      ) : (
        <div
          className={`border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-blue-400 focus-within:border-blue-400 bg-white text-slate-900 overflow-y-auto ${className}`}
        >
          <EditorContent editor={editor} />
        </div>
      )}

      <style jsx global>{`
        .ProseMirror {
          outline: none;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #94a3b8;
          pointer-events: none;
          height: 0;
        }
        .ProseMirror ul {
          margin-bottom: 0.75rem;
        }
        .ProseMirror ol {
          margin-bottom: 0.75rem;
        }
        .ProseMirror li {
          margin-bottom: 0.25rem;
        }
        .ProseMirror p {
          margin-bottom: 0.75rem;
        }
        .ProseMirror strong {
          font-weight: 600;
        }
        .ProseMirror em {
          font-style: italic;
        }
        .ProseMirror code {
          background: #f1f5f9;
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-family: monospace;
          font-size: 0.875em;
        }
        .ProseMirror mark {
          background: #dbeafe !important;
          color: #1e40af !important;
          padding: 2px 6px;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}
