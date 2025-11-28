import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

interface CodeGenerateRequest {
    description: string;
    requirements?: string[];
    template?: string;
    includeComments?: boolean;
    learningLevel?: 'beginner' | 'intermediate' | 'advanced';
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const {
            description,
            requirements = [],
            template,
            includeComments = true,
            learningLevel = 'intermediate'
        }: CodeGenerateRequest = req.body;

        if (!description) {
            return res.status(400).json({ error: 'description is required' });
        }

        let levelInstructions = '';
        if (learningLevel === 'beginner') {
            levelInstructions = 'Create a "fill-in-the-blanks" version of the code. Use "// TODO: ..." comments where the user needs to write code. Provide hints in the comments.';
        } else if (learningLevel === 'advanced') {
            levelInstructions = 'Use advanced C++ features, efficient code, and minimal comments unless necessary.';
        }

        const prompt = `Generate ESP32 Arduino C++ code for the following:

Description: ${description}

${requirements.length > 0 ? `Requirements:\n${requirements.map((r, i) => `${i + 1}. ${r}`).join('\n')}` : ''}

${template ? `Base template to modify:\n\`\`\`cpp\n${template}\n\`\`\`` : ''}

Code guidelines:
1. ${includeComments ? 'Add detailed comments explaining each section' : 'Minimal comments'}
2. Use proper ESP32 pin definitions
3. Include necessary #define statements
4. Follow Arduino coding conventions
5. Include error handling where appropriate
6. Make code beginner-friendly and educational
7. ${levelInstructions}

Respond ONLY with the code, no markdown formatting or explanations outside the code.`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert ESP32 programmer. Generate clean, well-commented, educational Arduino code.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 2000,
        });

        const code = completion.choices[0]?.message?.content;

        if (!code) {
            return res.status(500).json({ error: 'No code generated' });
        }

        // Clean up code (remove markdown if present)
        let cleanCode = code;
        if (cleanCode.includes('```')) {
            const match = cleanCode.match(/```(?:cpp|c)?\n([\s\S]*?)\n```/);
            if (match) {
                cleanCode = match[1];
            }
        }

        return res.status(200).json({
            code: cleanCode.trim(),
            success: true
        });
    } catch (error: any) {
        console.error('Code generation error:', error);

        if (error.code === 'invalid_api_key') {
            return res.status(401).json({ error: 'Invalid OpenAI API key' });
        }

        return res.status(500).json({
            error: 'Failed to generate code',
            details: error.message
        });
    }
}
