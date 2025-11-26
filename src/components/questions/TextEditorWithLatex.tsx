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

    // Extract both inline ($...$) and display ($$...$$) formulas
    // Handle multiline display formulas first
    html = html.replace(/\$\$([^\$]*?)\$\$/gs, (match: string, content: string) => {
      const placeholder = `__FORMULA_${formulaIndex}__`;
      formulas[placeholder] = content.trim();
      formulaIndex++;
      return `\n${placeholder}\n`;
    });

    // Then handle inline formulas with proper line break detection
    let formulaMatches = [];
    let match;
    const formulaRegex = /\$([^\$]+?)\$/g;
    while ((match = formulaRegex.exec(html)) !== null) {
      formulaMatches.push({
        index: match.index,
        match: match[0],
        content: match[1]
      });
    }

    // Process formulas in reverse order to maintain correct indices
    for (let i = formulaMatches.length - 1; i >= 0; i--) {
      const fm = formulaMatches[i];
      const placeholder = `__FORMULA_${formulaIndex}__`;
      formulas[placeholder] = fm.content;
      formulaIndex++;

      // Check if formula is on its own line
      const before = html.substring(Math.max(0, fm.index - 100), fm.index);
      const after = html.substring(fm.index + fm.match.length, Math.min(html.length, fm.index + fm.match.length + 100));
      const beforeTrimmed = before.trim();
      const afterTrimmed = after.trim();
      const isOnOwnLine = (beforeTrimmed === '' || beforeTrimmed.endsWith('\n')) &&
        (afterTrimmed === '' || afterTrimmed.startsWith('\n'));

      const replacement = isOnOwnLine ? `\n${placeholder}\n` : placeholder;
      html = html.substring(0, fm.index) + replacement + html.substring(fm.index + fm.match.length);
    }

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
      const isDisplay = formula.includes('\n') || formula.length > 50;
      const highlighted = isDisplay
        ? `<div style="background: #dbeafe; color: #1e40af; padding: 8px 12px; border-radius: 4px; margin: 12px 0; overflow-x: auto; font-family: monospace; white-space: pre-wrap; word-break: break-word;">$$${formula}$$</div>`
        : `<mark style="background: #dbeafe; color: #1e40af; padding: 2px 6px; border-radius: 4px; font-family: monospace;">$${formula}$</mark>`;
      result = result.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), highlighted);
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

    // Remove duplicate subscript notations in the final result
    result = result.replace(/[\u0301\u0300\u0302\u0303\u0304\u200B\u200C\u200D]/g, '');
    result = result.replace(/([a-zA-Z])_([0-9]+)[₀-₉]/g, '$1_$2');
    result = result.replace(/[₀-₉]/g, '');

    result = result.trim();

    return result;
  }, []);


  const transformPastedHTML = useCallback((html: string): string => {
    let processed = html;

    // First: Remove ALL Unicode subscript/superscript characters and zero-width characters
    processed = processed.replace(/[\u0301\u0300\u0302\u0303\u0304\u200B\u200C\u200D\u2060\uFEFF]/g, '');
    processed = processed.replace(/[₀₁₂₃₄₅₆₇₈₉]/g, '');
    processed = processed.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, '');

    // Remove pattern: variable followed by underscore-number AND subscript (e.g., "a_1a₁" -> "a_1")
    processed = processed.replace(/([a-zA-Z_]\d+)([a-zA-Z]+)/g, (match, latexPart, duplicatePart) => {
      // Check if duplicate part looks like it's repeating the variable
      if (duplicatePart.length <= 3 && /^[a-zA-Z]+$/.test(duplicatePart)) {
        return latexPart;
      }
      return match;
    });

    // Pattern: "formula)text" where text is duplicate without $ (common in copy-paste)
    processed = processed.replace(/(\([^)]+\))([a-zA-Z₀-₉_=\s.⋯\\]+)(?=:|\n|$)/g, '$1');

    // Remove specific pattern: "a_1 = a_2 = ... = a_na1=a2=...=an" (duplicate after formula)
    // This captures the LaTeX version and removes the plain text duplicate
    processed = processed.replace(/([a-zA-Z]_\d+\s*=\s*[a-zA-Z]_\d+[^$\n]*?)([a-zA-Z]\d+=\s*[a-zA-Z]\d+[^\n$]*?)(?=\s|$)/g, '$1');

    // More aggressive: remove any sequence of "letter+digit+=" that appears after LaTeX subscripts
    processed = processed.replace(/([a-zA-Z]_[0-9n]+)([a-zA-Z][0-9n]+=)/g, '$1 ');

    processed = processed.replace(/\s+style="[^"]*"/g, '');

    // Preserve mathematical notation with special handling
    const mathSymbols: { [key: string]: string } = {
      '≤': '≤',
      '≥': '≥',
      '≠': '≠',
      '·': '·',
      '→': '→',
      '←': '←',
      '⇒': '⇒',
      '⟺': '⟺',
      'α': 'α',
      'β': 'β',
      'γ': 'γ',
      'δ': 'δ',
      'ε': 'ε',
      'λ': 'λ',
      'μ': 'μ',
      'ν': 'ν',
      'π': 'π',
      'σ': 'σ',
      'τ': 'τ',
      'Σ': 'Σ',
      'Π': 'Π',
    };

    // Clean up duplicate subscript/superscript notations from copy-pasted content
    // Remove zero-width spaces and combining marks first
    processed = processed.replace(/[\u0301\u0300\u0302\u0303\u0304\u200B\u200C\u200D]/g, '');

    // Remove Unicode subscript numbers (₀-₉) that appear after LaTeX-style subscripts
    // Pattern: "a_1a₁" becomes "a_1"
    processed = processed.replace(/([a-zA-Z])_([0-9]+)[₀-₉]/g, '$1_$2');
    processed = processed.replace(/[a-zA-Z][₀-₉](?=[a-zA-Z]|=|\s|$)/g, (match) => match[0]); // Remove standalone subscript notation
    processed = processed.replace(/[₀-₉]/g, ''); // Final cleanup of any remaining subscript digits

    // Fix escaped LaTeX sequences
    processed = processed.replace(/\\le(?!\w)/g, '≤');
    processed = processed.replace(/\\ge(?!\w)/g, '≥');
    processed = processed.replace(/\\ne(?!\w)/g, '≠');
    processed = processed.replace(/\\cdot(?!\w)/g, '·');
    processed = processed.replace(/\\cdots(?!\w)/g, '⋯');
    processed = processed.replace(/\\alpha(?!\w)/g, 'α');
    processed = processed.replace(/\\beta(?!\w)/g, 'β');
    processed = processed.replace(/\\gamma(?!\w)/g, 'γ');
    processed = processed.replace(/\\pi(?!\w)/g, 'π');
    processed = processed.replace(/\\sigma(?!\w)/g, 'σ');
    processed = processed.replace(/\\Sigma(?!\w)/g, 'Σ');
    processed = processed.replace(/\\Pi(?!\w)/g, 'Π');

    // Remove duplicate formula lines (when same formula appears twice)
    // Pattern: "$a_1 = a_2 = \cdots = a_n$a_1 = a_2 = ... = a_n" becomes just "$a_1 = a_2 = \cdots = a_n$"
    processed = processed.replace(/(\$[^\$]+\$)\s*[a-zA-Z₀-₉_=⋯\\.\s]+(?=\n|$)/g, '$1');

    // Even more aggressive cleanup for the exact pattern you're seeing
    // Remove text like "a1=a2=⋯=an" that appears after properly formatted formulas
    processed = processed.replace(/([a-zA-Z]\d+\s*=\s*[a-zA-Z]\d+[^<\n]*?)(?=\s*<|\s*\n|\s*$)/g, '');

    // Clean up multiple spaces
    processed = processed.replace(/\s{3,}/g, ' ');

    Object.entries(mathSymbols).forEach(([symbol, latex]) => {
      let processed = html;

      // 1. Remover caracteres Unicode de sub/superscrito e caracteres invisíveis
      processed = processed.replace(/[\u0301-\u0304\u200B\u200C\u200D\u2060\uFEFF]/g, '');
      processed = processed.replace(/[₀₁₂₃₄₅₆₇₈₉]/g, '');
      processed = processed.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, '');

      // 2. Remover padrões duplicados de variáveis: "a1,a2,...,ana_1, a_2, \dots, a_na1,a2,...,an" etc
      // Remove listas duplicadas após LaTeX (ex: a_1, a_2, \ldots, a_n a1, a2, ..., an)
      processed = processed.replace(/(a_\d+,\s*a_\d+,\s*\\ldots,\s*a_\w+)[^$\n]*?(a\d+,\s*a\d+,\s*\.\.\.,\s*a\w+)/g, '$1');
      // Remove listas duplicadas após LaTeX (ex: a_1 = a_2 = ... = a_n a1=a2=...=an)
      processed = processed.replace(/([a-zA-Z]_\d+\s*=\s*[a-zA-Z]_\d+[^$\n]*?)([a-zA-Z]\d+=\s*[a-zA-Z]\d+[^
                title = "Código inline"
      // Remove qualquer lista de variáveis simples após LaTeX
      processed = processed.replace(/(\$[^\$]+\$)\s*[a-zA-Z0-9_,=\.\s…⋯]+(?=\n|$)/g, '$1');

      // 3. Remover subescritos Unicode após LaTeX
      processed = processed.replace(/([a-zA-Z])_([0-9]+)[₀-₉]/g, '$1_$2');
      processed = processed.replace(/[a-zA-Z][₀-₉](?=[a-zA-Z]|=|\s|$)/g, (match) => match[0]);
      processed = processed.replace(/[₀-₉]/g, '');

      // 4. Corrigir LaTeX escapado para símbolos
      const mathSymbols: { [key: string]: string } = {
        '≤': '≤', '≥': '≥', '≠': '≠', '·': '·', '⋯': '⋯', '→': '→', '←': '←', '⇒': '⇒', '⟺': '⟺',
        'α': 'α', 'β': 'β', 'γ': 'γ', 'δ': 'δ', 'ε': 'ε', 'λ': 'λ', 'μ': 'μ', 'ν': 'ν', 'π': 'π',
        'σ': 'σ', 'τ': 'τ', 'Σ': 'Σ', 'Π': 'Π',
      };
      processed = processed.replace(/\\le(?!\w)/g, '≤');
      processed = processed.replace(/\\ge(?!\w)/g, '≥');
      processed = processed.replace(/\\ne(?!\w)/g, '≠');
      processed = processed.replace(/\\cdot(?!\w)/g, '·');
      processed = processed.replace(/\\cdots(?!\w)/g, '⋯');
      processed = processed.replace(/\\alpha(?!\w)/g, 'α');
      processed = processed.replace(/\\beta(?!\w)/g, 'β');
      processed = processed.replace(/\\gamma(?!\w)/g, 'γ');
      processed = processed.replace(/\\pi(?!\w)/g, 'π');
      processed = processed.replace(/\\sigma(?!\w)/g, 'σ');
      processed = processed.replace(/\\Sigma(?!\w)/g, 'Σ');
      processed = processed.replace(/\\Pi(?!\w)/g, 'Π');
      Object.entries(mathSymbols).forEach(([symbol, latex]) => {
        processed = processed.replace(new RegExp(symbol, 'g'), latex);
      });

      // 5. Limpeza de HTML e listas
      processed = processed.replace(/\s+style="[^"]*"/g, '');
      processed = processed.replace(/<span[^>]*>\s*<\/span>/g, '');
      processed = processed.replace(/<span[^>]*>/g, '');
      processed = processed.replace(/<\/span>/g, '');
      if (!processed.includes('<li')) {
        processed = processed.replace(/<div[^>]*>/g, '<p>');
        processed = processed.replace(/<\/div>/g, '</p>');
      }
      processed = processed.replace(/<br\s*\/?>(?!\n)/g, '\n');

      // 6. Listas Markdown para HTML
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

      // 7. Espaços múltiplos
      processed = processed.replace(/\s{3,}/g, ' ');

      return processed;
    }, []);
              >
      { '</>'}
              </button >
              <div className="w-px h-6 bg-slate-300 mx-1" />
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  editor.isActive('heading', { level: 1 }) ? 'bg-slate-200 text-slate-900' : 'text-slate-600 hover:bg-slate-100'
                }`}
                title="Título 1"
              >
                H1
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  editor.isActive('heading', { level: 2 }) ? 'bg-slate-200 text-slate-900' : 'text-slate-600 hover:bg-slate-100'
                }`}
                title="Título 2"
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  editor.isActive('heading', { level: 3 }) ? 'bg-slate-200 text-slate-900' : 'text-slate-600 hover:bg-slate-100'
                }`}
                title="Título 3"
              >
                H3
              </button>
            </div >
          )
}
        </div >
      )}

{
  shouldShowPreview ? (
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
  )
}

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
    </div >
  );
}
