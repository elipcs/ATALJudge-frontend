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

export default function TextEditorWithLatex({
  value,
  onChange,
  placeholder = 'Cole o conteúdo aqui...',
  className = '',
  showPreview = false,
}: TextEditorWithLatexProps) {
  const shouldShowPreview = showPreview && value.length > 0;

  const markdownToHtml = useCallback((markdown: string): string => {
    if (!markdown) return '';

    let html = markdown;

    const formulas: { [key: string]: string } = {};
    let formulaIndex = 0;

    html = html.replace(/\$([^\$]+)\$/g, (match: string, content: string) => {
      const placeholder = `__FORMULA_${formulaIndex}__`;
      formulas[placeholder] = content;
      formulaIndex++;
      return placeholder;
    });

    html = html.replace(/\*\*([^\*]+)\*\*/g, (match: string, content: string) => `<strong>${content}</strong>`);
    html = html.replace(/\*([^\*]+)\*/g, (match: string, content: string) => `<em>${content}</em>`);
    html = html.replace(/`([^`]+)`/g, (match: string, content: string) => `<code>${content}</code>`);

    const lines = html.split('\n');
    let result = '';
    let inList = false;

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed.startsWith('#### ')) {
        if (inList) {
          result += '</ul>';
          inList = false;
        }
        const content = trimmed.substring(5).trim();
        result += `<h4>${content}</h4>`;
      } else if (trimmed.startsWith('### ')) {
        if (inList) {
          result += '</ul>';
          inList = false;
        }
        const content = trimmed.substring(4).trim();
        result += `<h3>${content}</h3>`;
      } else if (trimmed.startsWith('## ')) {
        if (inList) {
          result += '</ul>';
          inList = false;
        }
        const content = trimmed.substring(3).trim();
        result += `<h2>${content}</h2>`;
      } else if (trimmed.startsWith('# ')) {
        if (inList) {
          result += '</ul>';
          inList = false;
        }
        const content = trimmed.substring(2).trim();
        result += `<h1>${content}</h1>`;
      } else if (trimmed.startsWith('- ')) {
        if (!inList) {
          result += '<ul>';
          inList = true;
        }
        const content = trimmed.substring(2).trim();
        result += `<li><p>${content}</p></li>`;
      } else {
        if (inList) {
          result += '</ul>';
          inList = false;
        }

        if (trimmed) {
          result += `<p>${trimmed}</p>`;
        }
      }
    }

    if (inList) result += '</ul>';

    Object.entries(formulas).forEach(([placeholder, formula]) => {
      const highlighted = `<mark style="background: #dbeafe; color: #1e40af; padding: 2px 6px; border-radius: 4px;">$${formula}$</mark>`;
      result = result.replace(new RegExp(placeholder, 'g'), highlighted);
    });

    return result;
  }, []);

  const htmlToMarkdown = useCallback((html: string): string => {
    if (!html) return '';

    let result = html;

    result = result.replace(/<mark[^>]*>\$([^<]+)\$<\/mark>/g, (match: string, content: string) => {
      return `$${content}$`;
    });

    result = result.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/g, (match: string, content: string) => {
      return `**${content.trim()}**`;
    });
    result = result.replace(/<b[^>]*>([\s\S]*?)<\/b>/g, (match: string, content: string) => {
      return `**${content.trim()}**`;
    });
    result = result.replace(/<em[^>]*>([\s\S]*?)<\/em>/g, (match: string, content: string) => {
      return `*${content.trim()}*`;
    });
    result = result.replace(/<i[^>]*>([\s\S]*?)<\/i>/g, (match: string, content: string) => {
      return `*${content.trim()}*`;
    });
    result = result.replace(/<code[^>]*>([\s\S]*?)<\/code>/g, (match: string, content: string) => {
      return `\`${content.trim()}\``;
    });

    result = result.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/g, (match: string, content: string) => {
      return `# ${content.trim()}\n`;
    });
    result = result.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/g, (match: string, content: string) => {
      return `## ${content.trim()}\n`;
    });
    result = result.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/g, (match: string, content: string) => {
      return `### ${content.trim()}\n`;
    });
    result = result.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/g, (match: string, content: string) => {
      return `#### ${content.trim()}\n`;
    });

    result = result.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/g, (match: string, content: string) => {
      let listContent = content.replace(/<li[^>]*>([\s\S]*?)<\/li>/g, (liMatch: string, liContent: string) => {
        let itemText = liContent.replace(/<p[^>]*>/g, '').replace(/<\/p>/g, '').trim();
        return `- ${itemText}\n`;
      });
      return listContent;
    });

    result = result.replace(/<p[^>]*>([\s\S]*?)<\/p>/g, (match: string, content: string) => {
      return `${content.trim()}\n`;
    });

    result = result.replace(/<[^>]+>/g, '');

    result = result.replace(/\n\n\n+/g, '\n\n');
    result = result.trim();

    return result;
  }, []);


  const cleanLatexDuplication = useCallback((text: string): string => {
    // Remove duplicações típicas do ChatGPT onde o conteúdo aparece 3 vezes:
    // "texto1 \comando texto2 texto1" -> "texto1 \comando texto2"

    // Padrão 1: "1≤T≤101 \le T \le 101≤T≤10" -> "1 \le T \le 10"
    // Detecta quando temos: [símbolos][comandos LaTeX][símbolos novamente]
    let cleaned = text;

    // Remove duplicações de expressões matemáticas completas
    // Padrão: número+símbolo+variável+símbolo+número comandos_latex número+símbolo+variável+símbolo+número
    const mathDuplicationPattern = /(\d+[≤≥<>]\w+[≤≥<>]\d+\^?\d*)\s*(\\[a-z]+\s+\w+\s+\\[a-z]+\s+\d+\^?\d*)\s*(\d+[≤≥<>]\w+[≤≥<>]\d+\^?\d*)/g;

    cleaned = cleaned.replace(mathDuplicationPattern, (match, prefix, latexPart, suffix) => {
      // Usa a parte LaTeX normalizada
      return latexPart;
    });

    // Normaliza comandos LaTeX para símbolos Unicode
    const latexReplacements: { [key: string]: string } = {
      '\\le': '≤',
      '\\ge': '≥',
      '\\leq': '≤',
      '\\geq': '≥',
      '\\lt': '<',
      '\\gt': '>',
      '\\ne': '≠',
      '\\neq': '≠',
      '\\times': '×',
      '\\div': '÷',
      '\\pm': '±',
      '\\mp': '∓',
      '\\cdot': '·',
      '\\ldots': '…',
      '\\infty': '∞',
      '\\text': '',
    };

    // Substitui comandos LaTeX por símbolos
    Object.entries(latexReplacements).forEach(([latex, symbol]) => {
      const regex = new RegExp(latex.replace(/\\/g, '\\\\'), 'g');
      cleaned = cleaned.replace(regex, symbol);
    });

    // Normaliza expoentes: "10^4" ou "10^41" -> "10⁴" ou mantém "10^41"
    const superscriptMap: { [key: string]: string } = {
      '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
      '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹'
    };

    cleaned = cleaned.replace(/\^(\d+)/g, (match, digits) => {
      // Apenas converte expoentes de 1 dígito para Unicode
      if (digits.length === 1) {
        return superscriptMap[digits] || match;
      }
      // Para múltiplos dígitos, mantém a notação original ou converte cada dígito
      return digits.split('').map((d: string) => superscriptMap[d] || d).join('');
    });

    // Normaliza subscritos: "a_i" -> "aᵢ"
    const subscriptMap: { [key: string]: string } = {
      '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
      '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
      'i': 'ᵢ', 'j': 'ⱼ', 'k': 'ₖ', 'n': 'ₙ', 'a': 'ₐ',
      'e': 'ₑ', 'o': 'ₒ', 'x': 'ₓ'
    };

    cleaned = cleaned.replace(/_([a-z0-9])/gi, (match, char) => {
      return subscriptMap[char.toLowerCase()] || match;
    });

    // Remove espaços múltiplos
    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    // Remove padrões residuais de duplicação
    // Ex: "1≤T≤10 1≤T≤10" -> "1≤T≤10"
    const lines = cleaned.split('\n');
    const uniqueLines: string[] = [];

    lines.forEach(line => {
      const trimmed = line.trim();
      // Detecta se a linha tem repetição exata
      const halfLength = Math.floor(trimmed.length / 2);
      const firstHalf = trimmed.substring(0, halfLength);
      const secondHalf = trimmed.substring(halfLength);

      if (firstHalf === secondHalf && firstHalf.length > 0) {
        uniqueLines.push(firstHalf);
      } else {
        uniqueLines.push(trimmed);
      }
    });

    return uniqueLines.join('\n');
  }, []);

  const transformPastedText = useCallback((text: string): string => {
    // Aplica limpeza de LaTeX no texto puro
    const cleaned = cleanLatexDuplication(text);
    console.log('[PASTE] Text before clean:', text.substring(0, 200));
    console.log('[PASTE] Text after clean:', cleaned.substring(0, 200));
    return cleaned;
  }, [cleanLatexDuplication]);

  const transformPastedHTML = useCallback((html: string): string => {
    console.log('[PASTE] Original HTML:', html.substring(0, 500));

    try {
      // Usa DOMParser para processar o HTML corretamente
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Primeiro, processa elementos KaTeX que o ChatGPT cola
      const katexElements = doc.querySelectorAll('.katex');
      // Função recursiva para limpar text nodes
      const cleanTextNodes = (node: Node): void => {
        if (node.nodeType === Node.TEXT_NODE) {
          // É um text node - aplica limpeza de LaTeX
          const originalText = node.textContent || '';
          if (originalText.trim()) {
            const cleanedText = cleanLatexDuplication(originalText);

            if (originalText !== cleanedText) {
              console.log('[PASTE] Cleaned text node:', originalText.trim().substring(0, 100), '->', cleanedText.substring(0, 100));
              node.textContent = cleanedText;
            }
          }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          // É um elemento - remove atributos e processa filhos
          const element = node as Element;

          // Remove atributos indesejados do ChatGPT
          element.removeAttribute('style');
          element.removeAttribute('class');
          element.removeAttribute('data-start');
          element.removeAttribute('data-end');
          element.removeAttribute('xmlns');
          element.removeAttribute('aria-hidden');

          // Remove spans desnecessários movendo seu conteúdo para o pai
          if (element.tagName.toLowerCase() === 'span') {
            const parent = element.parentNode;
            if (parent) {
              while (element.firstChild) {
                parent.insertBefore(element.firstChild, element);
              }
              parent.removeChild(element);
              return; // Não processa filhos pois o span foi removido
            }
          }

          // Processa filhos recursivamente
          const childNodes = Array.from(element.childNodes);
          childNodes.forEach(cleanTextNodes);
        }
      };

      // Processa o body do documento
      if (doc.body) {
        cleanTextNodes(doc.body);
        const result = doc.body.innerHTML;
        console.log('[PASTE] Processed HTML:', result.substring(0, 500));
        return result;
      }
    } catch (error) {
      console.error('[PASTE] Error processing HTML:', error);
    }

    // Fallback: retorna HTML original se houver erro
    console.log('[PASTE] Using fallback - returning original HTML');
    return html;
  }, [cleanLatexDuplication]);

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
                className={`px-2 py-1 text-xs rounded transition-colors ${editor.isActive('bold') ? 'bg-slate-200 text-slate-900' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                title="Negrito (Ctrl+B)"
              >
                <strong>B</strong>
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`px-2 py-1 text-xs rounded transition-colors ${editor.isActive('italic') ? 'bg-slate-200 text-slate-900' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                title="Itálico (Ctrl+I)"
              >
                <em>I</em>
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`px-2 py-1 text-xs rounded transition-colors ${editor.isActive('bulletList') ? 'bg-slate-200 text-slate-900' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                title="Lista com bullets"
              >
                • Lista
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleCode().run()}
                className={`px-2 py-1 text-xs rounded transition-colors ${editor.isActive('code') ? 'bg-slate-200 text-slate-900' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                title="Código inline"
              >
                {'</>'}
              </button>
              <div className="w-px h-6 bg-slate-300 mx-1" />
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`px-2 py-1 text-xs rounded transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-slate-200 text-slate-900' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                title="Título 1"
              >
                H1
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`px-2 py-1 text-xs rounded transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-slate-200 text-slate-900' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                title="Título 2"
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={`px-2 py-1 text-xs rounded transition-colors ${editor.isActive('heading', { level: 3 }) ? 'bg-slate-200 text-slate-900' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                title="Título 3"
              >
                H3
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
        .ProseMirror h1 {
          font-size: 2rem;
          font-weight: 700;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          color: #0f172a;
          line-height: 1.2;
        }
        .ProseMirror h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
          color: #1e293b;
          line-height: 1.3;
        }
        .ProseMirror h3 {
          font-size: 1.25rem;
          font-weight: 700;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
          color: #1e293b;
          line-height: 1.4;
        }
        .ProseMirror h4 {
          font-size: 1rem;
          font-weight: 700;
          margin-top: 0.75rem;
          margin-bottom: 0.5rem;
          color: #1e293b;
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
}
