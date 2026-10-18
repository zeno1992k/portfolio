import { useMemo, type ReactNode } from 'react';
import { Prism, type EnvConfig } from 'prism-react-renderer';
import type { Term } from '../data/terms';

type SyntaxToken = ReturnType<typeof Prism.tokenize>[number];

function renderText(text: string, key: string, blankToken?: string): ReactNode {
  if (!blankToken || !text.includes(blankToken)) return text;
  return text.split(blankToken).flatMap<ReactNode>((part, index) => index === 0 ? [part] : [
    <span className="code-blank" key={`${key}.blank.${index}`}>
      <span className="code-blank-label">빈칸</span><span aria-hidden="true">____</span>
    </span>, part,
  ]);
}

function renderTokens(tokens: SyntaxToken[], parentKey = '', blankToken?: string): ReactNode[] {
  return tokens.map((token, index) => {
    const key = `${parentKey}${index}`;
    if (typeof token === 'string') return renderText(token, key, blankToken);
    const aliases = token.alias ? (Array.isArray(token.alias) ? token.alias : [token.alias]) : [];
    const content = typeof token.content === 'string'
      ? renderText(token.content, key, blankToken)
      : renderTokens(Array.isArray(token.content) ? token.content : [token.content], `${key}.`, blankToken);
    return <span className={['token', token.type, ...aliases].join(' ')} key={key}>{content}</span>;
  });
}

export function CodeExample({ code, language = 'text', blankToken }: { code: string; language?: Term['codeLanguage']; blankToken?: string }) {
  const content = useMemo(() => {
    const syntax = language === 'html' ? 'markup' : language;
    const grammar = Prism.languages[syntax];
    if (!grammar) return renderText(code, 'plain', blankToken);
    // JSX/TSX hooks distinguish child text from JavaScript expressions.
    const environment: EnvConfig = { code, grammar, language: syntax, tokens: [] };
    Prism.hooks.run('before-tokenize', environment);
    environment.tokens = Prism.tokenize(environment.code, environment.grammar);
    Prism.hooks.run('after-tokenize', environment);
    return renderTokens(environment.tokens, '', blankToken);
  }, [code, language, blankToken]);

  return <pre className="term-code" data-language={language}><code>{content}</code></pre>;
}
