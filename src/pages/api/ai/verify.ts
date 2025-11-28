import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

interface VerifyRequest {
    code: string;
    requirements?: string[];
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { code, requirements = [] }: VerifyRequest = req.body;

        if (!code) {
            return res.status(400).json({ error: 'Code is required' });
        }

        const prompt = `Review the following ESP32 Arduino code and check for logical errors, syntax issues, or bad practices.

CODE:
\`\`\`cpp
${code}
\`\`\`

${requirements.length > 0 ? `REQUIREMENTS TO CHECK:\n${requirements.map((r, i) => `${i + 1}. ${r}`).join('\n')}` : ''}

Provide a JSON response with the following structure:
{
    "status": "pass" | "warn" | "fail",
    "feedback": "A concise summary of the review (max 2 sentences).",
    "issues": ["List of specific issues found (if any)"]
}

Focus on:
1. Syntax correctness (brackets, semicolons)
2. Logic (infinite loops, blocking delays)
3. ESP32 specifics (correct pin usage)
4. Requirements fulfillment`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert code reviewer for ESP32. Respond ONLY in JSON format.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.3,
            response_format: { type: "json_object" }
        });

        const content = completion.choices[0]?.message?.content;

        if (!content) {
            throw new Error('No content received from AI');
        }

        const result = JSON.parse(content);

        return res.status(200).json(result);

    } catch (error: any) {
        console.error('Code verification error:', error);
        return res.status(500).json({
            error: 'Failed to verify code',
            details: error.message
        });
    }
}
