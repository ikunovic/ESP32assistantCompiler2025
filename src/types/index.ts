// Tutorial and lesson types
export interface TutorialStep {
    id: string;
    title: string;
    content: string;
    learningObjectives: string[];
    quizRequired: boolean;
    codeTemplate?: string;
}

export interface Tutorial {
    id: string;
    title: string;
    description: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    steps: TutorialStep[];
}

// Quiz types
export interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
}

export interface QuizResult {
    score: number;
    total: number;
    passed: boolean;
    feedback: string;
}

// AI Chat types
export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
}

// Compilation types
export interface CompilationResult {
    success: boolean;
    output: string;
    errors?: string[];
    warnings?: string[];
    binaryPath?: string;
    binaryData?: string;
    binarySize?: number;
}

// Bluetooth types
export interface BluetoothDevice {
    name: string;
    id: string;
}

export interface UploadProgress {
    bytesTransferred: number;
    totalBytes: number;
    percentage: number;
    status: 'idle' | 'connecting' | 'uploading' | 'success' | 'error';
    message?: string;
}

// Learning Levels - NEW
export type LearningLevel = 'beginner' | 'intermediate' | 'advanced';

export interface LearningState {
    currentLevel: LearningLevel;
    quizScore?: number;
    recommendedLevel?: LearningLevel;
}

export const LEVEL_INFO = {
    beginner: {
        name: 'Beginner',
        icon: '🌱',
        description: 'Code templates with guidance',
        color: 'hsl(145, 65%, 55%)'
    },
    intermediate: {
        name: 'Intermediate',
        icon: '🎯',
        description: 'Code verification before compile',
        color: 'hsl(210, 80%, 60%)'
    },
    advanced: {
        name: 'Advanced',
        icon: '🚀',
        description: 'Independent coding with error help',
        color: 'hsl(280, 70%, 60%)'
    }
};
