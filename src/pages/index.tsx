import React, { useState } from 'react';
import Head from 'next/head';
import { AITutor } from '@/components/AITutor';
import { QuizPanel } from '@/components/QuizPanel';
import { CodeEditor } from '@/components/CodeEditor';
import { CompilePanel } from '@/components/CompilePanel';
import { BluetoothUpload } from '@/components/BluetoothUpload';
import { blinkLedTutorial } from '@/data/tutorials/blink-led';
import { CompilationResult, LearningLevel, LEVEL_INFO } from '@/types';
import axios from 'axios';

export default function Home() {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [code, setCode] = useState(blinkLedTutorial.steps[0].codeTemplate || '');
    const [compilationResult, setCompilationResult] = useState<CompilationResult | null>(null);
    const [quizPassed, setQuizPassed] = useState(false);

    // Learning level state
    const [learningLevel, setLearningLevel] = useState<LearningLevel>('intermediate');
    const [quizScore, setQuizScore] = useState<number | null>(null);
    const [showLevelRecommendation, setShowLevelRecommendation] = useState(false);
    const [recommendedLevel, setRecommendedLevel] = useState<LearningLevel | null>(null);
    const [verifyResult, setVerifyResult] = useState<{ status: string; feedback: string; issues: string[] } | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);

    const currentStep = blinkLedTutorial.steps[currentStepIndex];
    const isLastStep = currentStepIndex === blinkLedTutorial.steps.length - 1;

    const handleQuizPassed = (score?: number) => {
        setQuizPassed(true);

        // Calculate recommended level based on quiz score
        if (score !== undefined) {
            setQuizScore(score);
            const newRecommendedLevel: LearningLevel =
                score >= 90 ? 'advanced' :
                    score >= 60 ? 'intermediate' : 'beginner';

            if (newRecommendedLevel !== learningLevel) {
                setRecommendedLevel(newRecommendedLevel);
                setShowLevelRecommendation(true);
            }
        }
    };

    const handleNextStep = () => {
        if (currentStepIndex < blinkLedTutorial.steps.length - 1) {
            const nextIndex = currentStepIndex + 1;
            setCurrentStepIndex(nextIndex);
            setQuizPassed(false);

            // Load code template for next step if available
            const nextStep = blinkLedTutorial.steps[nextIndex];
            if (nextStep.codeTemplate) {
                setCode(nextStep.codeTemplate);
            }
        }
    };

    const handleGenerateCode = async () => {
        try {
            const response = await axios.post('/api/ai/generate-code', {
                description: currentStep.title,
                requirements: currentStep.learningObjectives,
                template: currentStep.codeTemplate,
                includeComments: true,
                learningLevel
            });

            if (response.data.success) {
                setCode(response.data.code);
            }
        } catch (error) {
            console.error('Failed to generate code:', error);
            alert('Failed to generate code. Please try again.');
        }
    };

    const handleVerifyCode = async () => {
        setIsVerifying(true);
        setVerifyResult(null);
        try {
            const response = await axios.post('/api/ai/verify', {
                code,
                requirements: currentStep.learningObjectives
            });
            setVerifyResult(response.data);
        } catch (error) {
            console.error('Verification failed:', error);
            alert('Failed to verify code.');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleAutoFix = async () => {
        if (!verifyResult || !verifyResult.issues) return;

        const fixPrompt = `I have this code:\n\`\`\`cpp\n${code}\n\`\`\`\n\nIt has these issues:\n${verifyResult.issues.join('\n')}\n\nPlease fix the code for me.`;

        // Use the AI Tutor to generate the fix
        // We can simulate a user message asking for a fix
        // But since we want to REPLACE the code, maybe we should use generate-code endpoint?
        // Let's use generate-code with the fix prompt as description

        try {
            const response = await axios.post('/api/ai/generate-code', {
                description: `Fix the following code issues:\n${verifyResult.issues.join('\n')}`,
                template: code,
                includeComments: true,
                learningLevel: 'beginner' // Force beginner friendly fix
            });

            if (response.data.success) {
                setCode(response.data.code);
                setVerifyResult(null); // Clear errors
                alert('✨ Code fixed! Try verifying again.');
            }
        } catch (error) {
            console.error('Auto-fix failed:', error);
            alert('Failed to auto-fix code.');
        }
    };

    const applyRecommendedLevel = () => {
        if (recommendedLevel) {
            setLearningLevel(recommendedLevel);
            setShowLevelRecommendation(false);
        }
    };

    return (
        <>
            <Head>
                <title>ESP32 AI Education Assistant</title>
                <meta name="description" content="Learn ESP32 programming with AI-powered step-by-step guidance" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <div style={{ minHeight: '100vh', padding: 'var(--spacing-lg)' }}>
                {/* Header */}
                <header style={{
                    maxWidth: '1400px',
                    margin: '0 auto var(--spacing-xl) auto',
                    textAlign: 'center'
                }}>
                    {/* Level Selector - Top Right */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--spacing-md)' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--spacing-sm)',
                            background: 'var(--color-bg-secondary)',
                            padding: '0.5rem 1rem',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--color-border)'
                        }}>
                            <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>Level:</span>
                            <select
                                className="input"
                                value={learningLevel}
                                onChange={(e) => setLearningLevel(e.target.value as LearningLevel)}
                                style={{
                                    padding: '0.4rem 0.6rem',
                                    fontSize: '0.9rem',
                                    border: 'none',
                                    background: 'transparent',
                                    color: LEVEL_INFO[learningLevel].color,
                                    fontWeight: '600'
                                }}
                            >
                                {(Object.keys(LEVEL_INFO) as LearningLevel[]).map(level => (
                                    <option key={level} value={level}>
                                        {LEVEL_INFO[level].icon} {LEVEL_INFO[level].name}
                                    </option>
                                ))}
                            </select>
                            <div style={{
                                fontSize: '0.75rem',
                                opacity: 0.7,
                                maxWidth: '200px'
                            }}>
                                {LEVEL_INFO[learningLevel].description}
                            </div>
                        </div>
                    </div>

                    <h1 className="gradient-text" style={{
                        fontSize: '3rem',
                        marginBottom: 'var(--spacing-sm)'
                    }}>
                        🚀 ESP32 AI Education Assistant
                    </h1>
                    <p style={{
                        fontSize: '1.2rem',
                        color: 'var(--color-text-secondary)',
                        maxWidth: '600px',
                        margin: '0 auto'
                    }}>
                        Learn ESP32 programming with AI-powered guidance, interactive quizzes, and Web Bluetooth upload
                    </p>
                </header>

                {/* Level Recommendation Banner */}
                {showLevelRecommendation && recommendedLevel && (
                    <div style={{
                        maxWidth: '1400px',
                        margin: '0 auto var(--spacing-lg) auto'
                    }}>
                        <div className="card animate-fade-in" style={{
                            background: `${LEVEL_INFO[recommendedLevel].color}15`,
                            border: `1px solid ${LEVEL_INFO[recommendedLevel].color}`,
                            padding: 'var(--spacing-md)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                    <strong style={{ color: LEVEL_INFO[recommendedLevel].color }}>
                                        {LEVEL_INFO[recommendedLevel].icon} Level Recommendation
                                    </strong>
                                    <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9 }}>
                                        Based on your quiz score ({quizScore}%), we recommend: <strong>{LEVEL_INFO[recommendedLevel].name}</strong>
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                                    <button className="btn btn-secondary" onClick={() => setShowLevelRecommendation(false)}>
                                        Dismiss
                                    </button>
                                    <button
                                        className="btn btn-primary"
                                        onClick={applyRecommendedLevel}
                                        style={{ background: LEVEL_INFO[recommendedLevel].color }}
                                    >
                                        Switch to {LEVEL_INFO[recommendedLevel].name}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tutorial Progress */}
                <div style={{
                    maxWidth: '1400px',
                    margin: '0 auto var(--spacing-xl) auto'
                }}>
                    <div className="card">
                        <div className="flex justify-between items-center mb-md">
                            <div>
                                <h2 style={{ margin: 0, marginBottom: 'var(--spacing-xs)' }}>
                                    {blinkLedTutorial.title}
                                </h2>
                                <p className="text-sm opacity-70" style={{ margin: 0 }}>
                                    {blinkLedTutorial.description}
                                </p>
                            </div>
                            <span className="badge badge-primary" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
                                Step {currentStepIndex + 1}/{blinkLedTutorial.steps.length}
                            </span>
                        </div>

                        {/* Progress Bar */}
                        <div style={{
                            width: '100%',
                            height: '8px',
                            background: 'var(--color-bg-tertiary)',
                            borderRadius: 'var(--radius-xl)',
                            overflow: 'hidden',
                            marginTop: 'var(--spacing-md)'
                        }}>
                            <div style={{
                                width: `${((currentStepIndex + 1) / blinkLedTutorial.steps.length) * 100}%`,
                                height: '100%',
                                background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))',
                                transition: 'width 0.5s ease'
                            }} />
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div style={{
                    maxWidth: '1400px',
                    margin: '0 auto',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                    gap: 'var(--spacing-lg)'
                }}>
                    {/* Left Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                        {/* Current Step Content */}
                        <div className="card">
                            <h3 style={{ marginBottom: 'var(--spacing-md)' }}>📖 {currentStep.title}</h3>
                            <div
                                style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8' }}
                                dangerouslySetInnerHTML={{
                                    __html: currentStep.content
                                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                        .replace(/```([\s\S]*?)```/g, '<pre class="code-block" style="margin: 1rem 0;">$1</pre>')
                                        .replace(/`([^`]+)`/g, '<code>$1</code>')
                                }}
                            />

                            {currentStep.learningObjectives && (
                                <div className="mt-lg">
                                    <h4>🎯 Learning Objectives:</h4>
                                    <ul style={{ marginLeft: 'var(--spacing-lg)', color: 'var(--color-text-secondary)' }}>
                                        {currentStep.learningObjectives.map((obj, index) => (
                                            <li key={index} style={{ marginBottom: 'var(--spacing-xs)' }}>{obj}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {!isLastStep && quizPassed && (
                                <button
                                    className="btn btn-success w-full mt-lg"
                                    onClick={handleNextStep}
                                >
                                    ➡️ Next Step
                                </button>
                            )}
                        </div>

                        {/* Quiz Panel */}
                        {currentStep.quizRequired && !quizPassed && (
                            <QuizPanel
                                stepContent={currentStep.content}
                                learningObjectives={currentStep.learningObjectives}
                                onQuizPassed={handleQuizPassed}
                            />
                        )}

                        {/* AI Tutor */}
                        <AITutor
                            tutorialId={blinkLedTutorial.id}
                            stepId={currentStep.id}
                            currentCode={code}
                            learningLevel={learningLevel}
                            compilationResult={compilationResult}
                        />
                    </div>

                    {/* Right Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                        {/* Code Editor */}
                        <div>
                            <div className="flex justify-between items-center mb-sm">
                                <div className="flex gap-sm">
                                    {(learningLevel === 'intermediate' || learningLevel === 'beginner') && (
                                        <button
                                            className="btn btn-secondary"
                                            onClick={handleVerifyCode}
                                            disabled={isVerifying}
                                        >
                                            {isVerifying ? '🔍 Checking...' : '🔍 Verify Code'}
                                        </button>
                                    )}
                                </div>
                                <button
                                    className="btn btn-secondary"
                                    onClick={handleGenerateCode}
                                    style={{ marginBottom: 'var(--spacing-sm)' }}
                                >
                                    ✨ AI Generate Code
                                </button>
                            </div>

                            {verifyResult && (
                                <div className="animate-fade-in mb-md" style={{
                                    padding: 'var(--spacing-md)',
                                    borderRadius: 'var(--radius-md)',
                                    background: verifyResult.status === 'pass' ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 165, 0, 0.1)',
                                    border: `1px solid ${verifyResult.status === 'pass' ? 'green' : 'orange'}`
                                }}>
                                    <strong>{verifyResult.status === 'pass' ? '✅ Code Looks Good!' : '⚠️ Issues Found:'}</strong>
                                    <p style={{ margin: '0.5rem 0' }}>{verifyResult.feedback}</p>
                                    {verifyResult.issues && verifyResult.issues.length > 0 && (
                                        <ul style={{ margin: '0.5rem 0 0 1rem', fontSize: '0.9rem' }}>
                                            {verifyResult.issues.map((issue, i) => (
                                                <li key={i}>{issue}</li>
                                            ))}
                                        </ul>
                                    )}

                                    {/* Auto-Fix Button for Beginners */}
                                    {verifyResult.status !== 'pass' && learningLevel === 'beginner' && (
                                        <button
                                            className="btn btn-primary mt-sm w-full"
                                            onClick={handleAutoFix}
                                            style={{ marginTop: 'var(--spacing-sm)' }}
                                        >
                                            ✨ Auto-Fix Code
                                        </button>
                                    )}
                                </div>
                            )}

                            <CodeEditor
                                code={code}
                                onChange={setCode}
                                readOnly={false}
                            />
                        </div>

                        {/* Compile Panel */}
                        <CompilePanel
                            code={code}
                            onCompilationComplete={setCompilationResult}
                        />

                        {/* Bluetooth Upload */}
                        <BluetoothUpload compilationResult={compilationResult} />
                    </div>
                </div>

                {/* Footer */}
                <footer style={{
                    maxWidth: '1400px',
                    margin: 'var(--spacing-2xl) auto 0 auto',
                    textAlign: 'center',
                    padding: 'var(--spacing-lg)',
                    opacity: 0.5
                }}>
                    <p className="text-sm">
                        Built with Next.js, OpenAI, and ❤️ for ESP32 learners
                    </p>
                </footer>
            </div>
        </>
    );
}
