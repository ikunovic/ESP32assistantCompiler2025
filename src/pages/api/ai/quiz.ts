import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

interface QuizGenerateRequest {
    stepContent: string;
    learningObjectives: string[];
    difficulty?: 'easy' | 'medium' | 'hard';
}

interface QuizValidateRequest {
    question: string;
    userAnswer: number;
    correctAnswer: number;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { action } = req.query;

    try {
        if (action === 'generate') {
            return await generateQuiz(req, res);
        } else if (action === 'validate') {
            return await validateQuiz(req, res);
        } else {
            return res.status(400).json({ error: 'Invalid action. Use ?action=generate or ?action=validate' });
        }
    } catch (error: any) {
        console.error('Quiz API error:', error);
        return res.status(500).json({
            error: 'Quiz operation failed',
            details: error.message
        });
    }
}

async function generateQuiz(req: NextApiRequest, res: NextApiResponse) {
    const { stepContent, learningObjectives, difficulty = 'medium' }: QuizGenerateRequest = req.body;

    if (!stepContent || !learningObjectives) {
        return res.status(400).json({ error: 'stepContent and learningObjectives are required' });
    }

    const prompt = `Based on the following ESP32 tutorial content, generate 2-3 multiple choice questions to verify understanding.

Tutorial Content:
${stepContent}

Learning Objectives:
${learningObjectives.map((obj, i) => `${i + 1}. ${obj}`).join('\n')}

Difficulty: ${difficulty}

Requirements:
- Questions should test understanding, not just memorization
- Include 4 answer options per question
- Make distractors (wrong answers) plausible but clearly wrong for someone who understood
- Mix conceptual and practical questions

Respond ONLY with valid JSON in this exact format:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Why this answer is correct and others are wrong"
    }
  ]
}`;

    const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
        response_format: { type: 'json_object' }
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
        return res.status(500).json({ error: 'No response from AI' });
    }

    try {
        const quizData = JSON.parse(response);
        return res.status(200).json(quizData);
    } catch (parseError) {
        console.error('Failed to parse quiz JSON:', response);
        return res.status(500).json({ error: 'Invalid quiz format received from AI' });
    }
}

async function validateQuiz(req: NextApiRequest, res: NextApiResponse) {
    const { question, userAnswer, correctAnswer }: QuizValidateRequest = req.body;

    if (question === undefined || userAnswer === undefined || correctAnswer === undefined) {
        return res.status(400).json({ error: 'question, userAnswer, and correctAnswer are required' });
    }

    const isCorrect = userAnswer === correctAnswer;

    if (isCorrect) {
        return res.status(200).json({
            correct: true,
            feedback: '✅ Correct! Great job understanding this concept.',
            score: 1
        });
    } else {
        const prompt = `A student answered question "${question}" incorrectly. 
They chose answer ${userAnswer} but the correct answer was ${correctAnswer}.

Provide encouraging feedback (2-3 sentences) that:
1. Gently corrects the misunderstanding
2. Briefly explains the correct concept
3. Encourages them to review and try again

Keep it supportive and educational.`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 150
        });

        const feedback = completion.choices[0]?.message?.content ||
            '❌ Not quite right. Please review the material and try again!';

        return res.status(200).json({
            correct: false,
            feedback,
            score: 0
        });
    }
}
