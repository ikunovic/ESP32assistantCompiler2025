import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

// Check if API key is configured
if (!process.env.OPENAI_API_KEY) {
    console.error('[AI Chat] ❌ OPENAI_API_KEY not configured in .env.local');
}

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

interface ChatRequest {
    messages: Array<{
        role: 'user' | 'assistant' | 'system';
        content: string;
    }>;
    context?: {
        tutorialId?: string;
        stepId?: string;
        currentCode?: string;
        learningLevel?: 'beginner' | 'intermediate' | 'advanced';
    };
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        console.log('[AI Chat] 📩 Received request:', { messageCount: req.body.messages?.length, context: req.body.context });

        const { messages, context }: ChatRequest = req.body;
        const learningLevel = context?.learningLevel || 'intermediate';

        if (!messages || !Array.isArray(messages)) {
            console.log('[AI Chat] ❌ Invalid request: messages missing or not array');
            return res.status(400).json({ error: 'Messages array is required' });
        }

        // Define level-specific instructions
        const levelInstructions = {
            beginner: `
- **TEACHING STYLE**: Extremely patient, step-by-step, simple language.
- **CODE**: Provide complete code snippets with heavy commenting.
- **GOAL**: Build confidence and basic understanding.
- **AVOID**: Complex technical jargon without explanation.`,
            intermediate: `
- **TEACHING STYLE**: Balanced, encouraging, guided discovery.
- **CODE**: Provide partial snippets or structure, ask user to fill in gaps.
- **GOAL**: Deepen understanding and problem-solving skills.
- **AVOID**: Giving the answer immediately without explanation.`,
            advanced: `
- **TEACHING STYLE**: Concise, technical, peer-to-peer.
- **CODE**: Focus on optimization, best practices, and advanced features.
- **GOAL**: Efficiency, robustness, and advanced concepts.
- **AVOID**: Over-explaining basic concepts.`
        };

        // Build system prompt based on context
        const systemPrompt = `You are an expert ESP32 and Arduino programming tutor. 
        
CURRENT LEARNING LEVEL: ${learningLevel.toUpperCase()}
${levelInstructions[learningLevel as keyof typeof levelInstructions]}

Your general role is to:
1. **Teach step-by-step**: Break down complex concepts.
2. **Encourage learning**: Ask probing questions.
3. **Be supportive**: Provide positive reinforcement.
4. **Use examples**: Provide concrete code examples.
5. **Focus on ESP32**: Specialize in ESP32 features.

When explaining code:
- Always add comments explaining what each section does
- Explain WHY something works, not just HOW
- Point out common mistakes and how to avoid them
- Relate concepts to real-world applications

Current context: ${context?.tutorialId ? `Tutorial: ${context.tutorialId}, Step: ${context.stepId}` : 'General assistance'}

Keep responses concise but informative. Use markdown formatting for code snippets.`;

        console.log('[AI Chat] 🤖 Calling OpenAI with', messages.length, 'messages');

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                ...messages
            ],
            temperature: 0.7,
            max_tokens: 1000,
        });

        console.log('[AI Chat] ✅ Got response from OpenAI');

        const response = completion.choices[0]?.message;

        if (!response) {
            return res.status(500).json({ error: 'No response from AI' });
        }

        return res.status(200).json({
            message: response.content,
            role: response.role
        });
    } catch (error: any) {
        console.error('AI Chat error:', error);

        if (error.code === 'invalid_api_key') {
            return res.status(401).json({ error: 'Invalid OpenAI API key. Please check your .env.local file.' });
        }

        return res.status(500).json({
            error: 'Failed to get AI response',
            details: error.message
        });
    }
}
