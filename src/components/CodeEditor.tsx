import React, { useState } from 'react';

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  readOnly?: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ code, onChange, readOnly = false }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.split('\n');

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div className="flex justify-between items-center" style={{ 
        padding: 'var(--spacing-md)',
        background: 'var(--color-bg-tertiary)',
        borderBottom: '1px solid var(--color-border)'
      }}>
        <div className="flex items-center gap-sm">
          <span style={{ fontSize: '1.25rem' }}>💻</span>
          <h4 style={{ margin: 0 }}>Code Editor</h4>
          {readOnly && <span className="badge badge-warning">Read Only</span>}
        </div>
        <button className="btn btn-secondary" onClick={handleCopy}>
          {copied ? '✓ Copied!' : '📋 Copy'}
        </button>
      </div>

      <div style={{ 
        display: 'flex',
        maxHeight: '500px',
        overflow: 'auto'
      }}>
        {/* Line numbers */}
        <div style={{
          background: 'var(--color-bg-secondary)',
          padding: 'var(--spacing-md) var(--spacing-sm)',
          textAlign: 'right',
          color: 'var(--color-text-tertiary)',
          fontFamily: 'Consolas, Monaco, monospace',
          fontSize: '0.9rem',
          lineHeight: '1.5',
          userSelect: 'none',
          borderRight: '1px solid var(--color-border)'
        }}>
          {lines.map((_, index) => (
            <div key={index}>{index + 1}</div>
          ))}
        </div>

        {/* Code area */}
        <textarea
          value={code}
          onChange={(e) => onChange(e.target.value)}
          readOnly={readOnly}
          spellCheck={false}
          style={{
            flex: 1,
            padding: 'var(--spacing-md)',
            background: 'var(--color-bg-secondary)',
            border: 'none',
            color: 'var(--color-text-primary)',
            fontFamily: 'Consolas, Monaco, monospace',
            fontSize: '0.9rem',
            lineHeight: '1.5',
            resize: 'none',
            outline: 'none',
            whiteSpace: 'pre',
            overflowWrap: 'normal',
            overflowX: 'auto'
          }}
        />
      </div>

      <div className="flex items-center gap-sm" style={{ 
        padding: 'var(--spacing-sm) var(--spacing-md)',
        background: 'var(--color-bg-tertiary)',
        borderTop: '1px solid var(--color-border)',
        fontSize: '0.85rem',
        color: 'var(--color-text-tertiary)'
      }}>
        <span>Lines: {lines.length}</span>
        <span>•</span>
        <span>Characters: {code.length}</span>
      </div>
    </div>
  );
};
