import React, { useState, useEffect } from 'react';
import { QuizQuestion } from '@/types';
import axios from 'axios';

interface QuizPanelProps {
    stepContent: string;
    learningObjectives: string[];
    onQuizPassed: (score?: number) => void;
}

export const QuizPanel: React.FC<QuizPanelProps> = ({
    stepContent,
    learningObjectives,
    onQuizPassed
}) => {
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [score, setScore] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [quizCompleted, setQuizCompleted] = useState(false);

    useEffect(() => {
        generateQuiz();
    }, [stepContent]);

    const generateQuiz = async () => {
        setIsLoading(true);
        try {
            const response = await axios.post('/api/ai/quiz?action=generate', {
                stepContent,
                learningObjectives,
                difficulty: 'medium'
            });

            setQuestions(response.data.questions || []);
            setCurrentQuestionIndex(0);
            setScore(0);
            setQuizCompleted(false);
        } catch (error) {
            console.error('Failed to generate quiz:', error);
            setFeedback('❌ Failed to generate quiz. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (selectedAnswer === null) return;

        const currentQuestion = questions[currentQuestionIndex];
        setIsSubmitted(true);

        try {
            const response = await axios.post('/api/ai/quiz?action=validate', {
                question: currentQuestion.question,
                userAnswer: selectedAnswer,
                correctAnswer: currentQuestion.correctAnswer
            });

            const isCorrect = response.data.correct;
            setFeedback(response.data.feedback);

            if (isCorrect) {
                setScore(score + 1);
            }

            // Auto-advance after 2 seconds
            setTimeout(() => {
                if (currentQuestionIndex < questions.length - 1) {
                    setCurrentQuestionIndex(currentQuestionIndex + 1);
                    setSelectedAnswer(null);
                    setIsSubmitted(false);
                    setFeedback('');
                } else {
                    // Quiz completed
                    setQuizCompleted(true);
                    const finalScore = isCorrect ? score + 1 : score;
                    const percentage = Math.round((finalScore / questions.length) * 100);
                    const passed = percentage >= 60; // 60% to pass

                    if (passed) {
                        setTimeout(() => {
                            onQuizPassed(percentage); // Pass score to parent
                        }, 2000);
                    }
                }
            }, 2500);
        } catch (error) {
            console.error('Failed to validate answer:', error);
            setFeedback('❌ Failed to validate answer. Please try again.');
        }
    };

    if (isLoading) {
        return (
            <div className="card text-center">
                <div className="animate-spin" style={{ fontSize: '2rem', marginBottom: 'var(--spacing-md)' }}>⚙️</div>
                <p>Generating quiz questions...</p>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="card text-center">
                <p className="opacity-70">No quiz available for this step.</p>
                <button className="btn btn-primary mt-md" onClick={generateQuiz}>
                    Generate Quiz
                </button>
            </div>
        );
    }

    if (quizCompleted) {
        const percentage = Math.round((score / questions.length) * 100);
        const passed = percentage >= 60;

        return (
            <div className="card text-center animate-fade-in">
                <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>
                    {passed ? '🎉' : '📚'}
                </div>
                <h3>{passed ? 'Quiz Passed!' : 'Keep Learning!'}</h3>
                <p style={{ fontSize: '1.5rem', margin: 'var(--spacing-md) 0' }}>
                    Score: {score}/{questions.length} ({percentage}%)
                </p>
                <p className="opacity-70">
                    {passed
                        ? '✅ Great job! You can continue to the next step.'
                        : '❌ You need 60% to pass. Review the material and try again!'}
                </p>
                {!passed && (
                    <button className="btn btn-primary mt-lg" onClick={generateQuiz}>
                        Retry Quiz
                    </button>
                )}
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div className="card">
            <div className="flex justify-between items-center mb-md">
                <h3>📝 Knowledge Check</h3>
                <span className="badge badge-primary">
                    {currentQuestionIndex + 1}/{questions.length}
                </span>
            </div>

            <div className="mb-lg">
                <p className="font-semibold text-lg mb-md">{currentQuestion.question}</p>

                <div className="flex flex-col gap-sm">
                    {currentQuestion.options.map((option, index) => (
                        <button
                            key={index}
                            className={`btn ${selectedAnswer === index
                                ? isSubmitted
                                    ? index === currentQuestion.correctAnswer
                                        ? 'btn-success'
                                        : 'btn-error'
                                    : 'btn-primary'
                                : 'btn-secondary'
                                }`}
                            onClick={() => !isSubmitted && setSelectedAnswer(index)}
                            disabled={isSubmitted}
                            style={{
                                justifyContent: 'flex-start',
                                textAlign: 'left',
                                padding: 'var(--spacing-md)'
                            }}
                        >
                            <span style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                background: selectedAnswer === index ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 'var(--spacing-sm)',
                                fontWeight: 'bold'
                            }}>
                                {String.fromCharCode(65 + index)}
                            </span>
                            {option}
                        </button>
                    ))}
                </div>
            </div>

            {feedback && (
                <div
                    className="animate-fade-in"
                    style={{
                        padding: 'var(--spacing-md)',
                        borderRadius: 'var(--radius-md)',
                        background: feedback.includes('✅')
                            ? 'hsla(145, 65%, 55%, 0.15)'
                            : 'hsla(5, 85%, 60%, 0.15)',
                        border: `1px solid ${feedback.includes('✅') ? 'var(--color-success)' : 'var(--color-error)'}`,
                        marginBottom: 'var(--spacing-md)'
                    }}
                >
                    {feedback}
                </div>
            )}

            {!isSubmitted && (
                <button
                    className="btn btn-primary w-full"
                    onClick={handleSubmit}
                    disabled={selectedAnswer === null}
                >
                    Submit Answer
                </button>
            )}

            <div className="mt-md text-center text-sm opacity-70">
                Score: {score}/{currentQuestionIndex + (isSubmitted ? 1 : 0)}
            </div>
        </div>
    );
};
