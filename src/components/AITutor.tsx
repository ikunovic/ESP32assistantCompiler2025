import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, LearningLevel, CompilationResult } from '@/types';
import axios from 'axios';

interface AITutorProps {
    tutorialId?: string;
    stepId?: string;
    currentCode?: string;
    learningLevel?: LearningLevel;
    compilationResult?: CompilationResult | null;
}

export const AITutor: React.FC<AITutorProps> = ({ tutorialId, stepId, currentCode, learningLevel = 'intermediate', compilationResult }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Auto-help for compilation errors (Advanced level)
    useEffect(() => {
        if (learningLevel === 'advanced' && compilationResult && !compilationResult.success) {
            const errorMsg = compilationResult.errors ? compilationResult.errors.join('\n') : 'Unknown compilation error';
            const autoMessage = `I'm getting this compilation error:\n\`\`\`\n${errorMsg}\n\`\`\`\nCan you help me fix it?`;

            // Only send if the last message wasn't already this error (prevent loops)
            const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
            if (lastUserMsg?.content !== autoMessage) {
                setInput(autoMessage);
                // We can't easily auto-send here because sendMessage relies on state that might not be fresh or requires user interaction policy
                // But we can pre-fill input or just simulate it. 
                // Let's just set input for now, or if we want to be aggressive, call a separate function.
                // For safety, let's just pre-fill and maybe show a "Get AI Help" toast?
                // Actually, the requirement says "Auto-trigger". Let's try to call an internal helper.
                handleAutoSend(autoMessage);
            }
        }
    }, [compilationResult, learningLevel]);

    const handleAutoSend = async (content: string) => {
        if (isLoading) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: content,
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await axios.post('/api/ai/chat', {
                messages: messages.concat(userMessage).map(m => ({
                    role: m.role,
                    content: m.content
                })),
                context: {
                    tutorialId,
                    stepId,
                    currentCode,
                    learningLevel
                }
            });

            const assistantMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response.data.message,
                timestamp: Date.now()
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Failed to send message:', error);
            // Error handling...
        } finally {
            setIsLoading(false);
        }
    };

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await axios.post('/api/ai/chat', {
                messages: messages.concat(userMessage).map(m => ({
                    role: m.role,
                    content: m.content
                })),
                context: {
                    tutorialId,
                    stepId,
                    currentCode,
                    learningLevel
                }
            });

            const assistantMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response.data.message,
                timestamp: Date.now()
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Failed to send message:', error);
            const errorMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: '❌ Sorry, I encountered an error. Please check your API key configuration.',
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="flex items-center gap-md mb-md">
                <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem'
                }}>
                    🤖
                </div>
                <div>
                    <h3 style={{ margin: 0 }}>AI Tutor</h3>
                    <p className="text-sm opacity-70" style={{ margin: 0 }}>Ask me anything about ESP32!</p>
                </div>
            </div>

            <div style={{
                flex: 1,
                overflowY: 'auto',
                marginBottom: 'var(--spacing-md)',
                minHeight: '300px',
                maxHeight: '500px'
            }}>
                {messages.length === 0 && (
                    <div className="text-center opacity-50" style={{ padding: 'var(--spacing-xl)' }}>
                        <p>👋 Hi! I'm your ESP32 AI tutor. Ask me questions about the tutorial or ESP32 programming!</p>
                    </div>
                )}

                {messages.map((message) => (
                    <div
                        key={message.id}
                        className="animate-fade-in"
                        style={{
                            marginBottom: 'var(--spacing-md)',
                            display: 'flex',
                            justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start'
                        }}
                    >
                        <div
                            style={{
                                maxWidth: '80%',
                                padding: 'var(--spacing-sm) var(--spacing-md)',
                                borderRadius: 'var(--radius-md)',
                                background: message.role === 'user'
                                    ? 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))'
                                    : 'var(--color-bg-tertiary)',
                                border: message.role === 'assistant' ? '1px solid var(--color-border)' : 'none'
                            }}
                        >
                            <div
                                style={{
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word'
                                }}
                                dangerouslySetInnerHTML={{
                                    __html: message.content
                                        .replace(/```([\s\S]*?)```/g, '<pre class="code-block" style="margin: 0.5rem 0;">$1</pre>')
                                        .replace(/`([^`]+)`/g, '<code>$1</code>')
                                }}
                            />
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex gap-sm items-center opacity-70">
                        <div className="animate-pulse">💭</div>
                        <span className="text-sm">AI is thinking...</span>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            <div className="flex gap-sm">
                <input
                    type="text"
                    className="input"
                    placeholder="Ask a question..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                    style={{ flex: 1 }}
                />
                <button
                    className="btn btn-primary"
                    onClick={sendMessage}
                    disabled={!input.trim() || isLoading}
                >
                    {isLoading ? '⏳' : '📤'} Send
                </button>
            </div>
        </div>
    );
};
