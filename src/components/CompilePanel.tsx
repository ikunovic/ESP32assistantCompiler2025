import React, { useState } from 'react';
import { CompilationResult } from '@/types';
import axios from 'axios';

interface CompilePanelProps {
    code: string;
    onCompilationComplete: (result: CompilationResult) => void;
}

export const CompilePanel: React.FC<CompilePanelProps> = ({ code, onCompilationComplete }) => {
    const [isCompiling, setIsCompiling] = useState(false);
    const [result, setResult] = useState<CompilationResult | null>(null);

    const handleCompile = async () => {
        if (!code.trim()) {
            alert('Please write some code first!');
            return;
        }

        setIsCompiling(true);
        setResult(null);

        try {
            const response = await axios.post('/api/compile', {
                code,
                board: 'esp32:esp32:esp32'
            });

            const compilationResult: CompilationResult = {
                success: response.data.success,
                output: response.data.output,
                errors: response.data.errors || [],
                warnings: response.data.warnings || [],
                binaryData: response.data.binaryData
            };

            setResult(compilationResult);
            onCompilationComplete(compilationResult);
        } catch (error: any) {
            const errorResult: CompilationResult = {
                success: false,
                output: '',
                errors: [error.response?.data?.error || 'Compilation failed. Please check if Arduino CLI is installed.']
            };
            setResult(errorResult);
            onCompilationComplete(errorResult);
        } finally {
            setIsCompiling(false);
        }
    };

    return (
        <div className="card">
            <div className="flex items-center gap-md mb-md">
                <span style={{ fontSize: '1.5rem' }}>🔨</span>
                <h3 style={{ margin: 0 }}>Compilation</h3>
            </div>

            <button
                className={`btn ${result?.success ? 'btn-success' : 'btn-primary'} w-full mb-md`}
                onClick={handleCompile}
                disabled={isCompiling}
            >
                {isCompiling ? (
                    <>
                        <span className="animate-spin">⚙️</span>
                        Compiling...
                    </>
                ) : result?.success ? (
                    <>✓ Compiled Successfully</>
                ) : (
                    <>🔨 Compile Code</>
                )}
            </button>

            {result && (
                <div className="animate-fade-in">
                    {result.success ? (
                        <div style={{
                            padding: 'var(--spacing-md)',
                            borderRadius: 'var(--radius-md)',
                            background: 'hsla(145, 65%, 55%, 0.15)',
                            border: '1px solid var(--color-success)'
                        }}>
                            <div className="flex items-center gap-sm mb-sm">
                                <span style={{ fontSize: '1.5rem' }}>✅</span>
                                <strong>Compilation Successful!</strong>
                            </div>
                            <p className="text-sm opacity-70" style={{ margin: 0 }}>
                                Binary ready for upload to ESP32
                            </p>
                            {result.warnings && result.warnings.length > 0 && (
                                <details className="mt-sm">
                                    <summary className="text-sm" style={{ cursor: 'pointer', color: 'var(--color-warning)' }}>
                                        ⚠️ {result.warnings.length} warning(s)
                                    </summary>
                                    <div className="code-block mt-sm" style={{ fontSize: '0.8rem', maxHeight: '150px', overflowY: 'auto' }}>
                                        {result.warnings.join('\n')}
                                    </div>
                                </details>
                            )}
                        </div>
                    ) : (
                        <div style={{
                            padding: 'var(--spacing-md)',
                            borderRadius: 'var(--radius-md)',
                            background: 'hsla(5, 85%, 60%, 0.15)',
                            border: '1px solid var(--color-error)'
                        }}>
                            <div className="flex items-center gap-sm mb-sm">
                                <span style={{ fontSize: '1.5rem' }}>❌</span>
                                <strong>Compilation Failed</strong>
                            </div>

                            {result.errors && result.errors.length > 0 && (
                                <div>
                                    <p className="text-sm font-semibold mb-sm">Errors:</p>
                                    <div className="code-block" style={{
                                        fontSize: '0.8rem',
                                        maxHeight: '200px',
                                        overflowY: 'auto',
                                        background: 'var(--color-bg-primary)'
                                    }}>
                                        {result.errors.map((error, index) => (
                                            <div key={index} style={{ marginBottom: '0.5rem', color: 'var(--color-error)' }}>
                                                {error}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <p className="text-sm opacity-70 mt-sm" style={{ margin: 0 }}>
                                💡 Tip: Ask the AI Tutor for help with these errors!
                            </p>
                        </div>
                    )}

                    {result.output && (
                        <details className="mt-md">
                            <summary className="text-sm" style={{ cursor: 'pointer', opacity: 0.7 }}>
                                📄 Show full output
                            </summary>
                            <div className="code-block mt-sm" style={{
                                fontSize: '0.75rem',
                                maxHeight: '200px',
                                overflowY: 'auto'
                            }}>
                                {result.output}
                            </div>
                        </details>
                    )}
                </div>
            )}

            <div className="mt-md p-md" style={{
                background: 'var(--color-bg-tertiary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)'
            }}>
                <p className="text-sm opacity-70" style={{ margin: 0 }}>
                    <strong>ℹ️ Note:</strong> Arduino CLI must be installed with ESP32 core.
                    <br />
                    Run: <code>arduino-cli core install esp32:esp32</code>
                </p>
            </div>
        </div>
    );
};
