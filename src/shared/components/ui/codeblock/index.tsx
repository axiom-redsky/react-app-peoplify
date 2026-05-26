import { useState, useCallback } from 'react';
import { codeToHtml } from 'shiki';
import { useEffect, useRef } from 'react';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/shared/utils/cn'; // 프로젝트 cn 유틸 경로에 맞게 수정
export type CodeLanguage =
  | 'tsx'
  | 'ts'
  | 'js'
  | 'jsx'
  | 'json'
  | 'css'
  | 'html'
  | 'bash'
  | 'md'
  | 'python';
export type CodeTheme =
  | 'github-dark'
  | 'github-light'
  | 'one-dark-pro'
  | 'dracula'
  | 'vitesse-dark'
  | 'vitesse-light';
interface CodeBlockProps {
  code: string;
  lang?: CodeLanguage;
  theme?: CodeTheme;
  showCopy?: boolean;
  showLang?: boolean;
  className?: string;
  filename?: string;
}
export function CodeBlock({
  code,
  lang = 'tsx',
  theme = 'github-dark',
  showCopy = true,
  showLang = true,
  className,
  filename,
}: CodeBlockProps) {
  const [html, setHtml] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    codeToHtml(code, { lang, theme }).then((result) => {
      if (isMounted.current) setHtml(result);
    });
    return () => {
      isMounted.current = false;
    };
  }, [code, lang, theme]);
  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }, [code]);
  const labelText = filename ?? lang.toUpperCase();
  return (
    <div
      className={cn(
        'relative rounded-xl border border-gray-700/60 overflow-hidden',
        className,
      )}
    >
      {/* 상단 툴바 */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-700/60">
        <div className="flex items-center gap-2">
          {/* VSCode 스타일 신호등 dots */}
          <span className="w-3 h-3 rounded-full bg-red-500/70" />
          <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
          <span className="w-3 h-3 rounded-full bg-green-500/70" />
          {showLang && (
            <span className="ml-2 text-xs font-mono text-gray-400 tracking-wide">
              {labelText}
            </span>
          )}
        </div>
        {showCopy && (
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-200 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-green-400" />
                <span className="text-green-400">복사됨!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                복사
              </>
            )}
          </button>
        )}
      </div>
      {/* Shiki 렌더링 영역 */}
      {html ? (
        <div
          className="text-xs leading-relaxed [&>pre]:p-4 [&>pre]:overflow-x-auto [&>pre]:m-0"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: shiki output is safe
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        // 로딩 스켈레톤 (초기 렌더 전 깜빡임 방지)
        <pre className="px-4 py-4 text-xs font-mono text-gray-500 bg-gray-950 overflow-x-auto">
          {code}
        </pre>
      )}
    </div>
  );
}