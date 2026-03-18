import { useState, useCallback } from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-json';
import 'prismjs/themes/prism-tomorrow.css';

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  minHeight?: string;
}

export function JsonEditor({ value, onChange, error, minHeight = '320px' }: JsonEditorProps) {
  const [copied, setCopied] = useState(false);

  const highlight = useCallback(
    (code: string) => Prism.highlight(code, Prism.languages['json']!, 'json'),
    [],
  );

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [value]);

  return (
    <div className="json-editor-wrapper">
      <button
        className="copy-btn"
        onClick={handleCopy}
        title="Copy to clipboard"
        type="button"
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
      <Editor
        value={value}
        onValueChange={onChange}
        highlight={highlight}
        padding={20}
        className="json-editor"
        style={{ minHeight, fontFamily: 'var(--font-mono)', fontSize: '0.82rem', lineHeight: 1.65 }}
        textareaClassName="json-editor-textarea"
      />
      {error && <div className="json-error">{error}</div>}
    </div>
  );
}
