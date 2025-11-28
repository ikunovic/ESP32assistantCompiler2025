import type { NextApiRequest, NextApiResponse } from 'next';
import { ArduinoCLI } from '@/utils/arduino-cli';

interface CompileRequest {
    code: string;
    board?: string;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        console.log('[Compile] 📩 Received compilation request, code length:', req.body.code?.length);

        const { code, board }: CompileRequest = req.body;

        if (!code) {
            console.log('[Compile] ❌ No code provided');
            return res.status(400).json({ error: 'Code is required' });
        }

        // Check if Arduino CLI is installed
        console.log('[Compile] 🔍 Checking Arduino CLI installation...');
        const isInstalled = await ArduinoCLI.isInstalled();
        if (!isInstalled) {
            console.log('[Compile] ❌ Arduino CLI not found');
            return res.status(500).json({
                error: 'Arduino CLI not installed',
                message: 'Please install Arduino CLI to compile code. Visit: https://arduino.github.io/arduino-cli/installation/'
            });
        }
        console.log('[Compile] ✅ Arduino CLI found');

        // Check if ESP32 core is installed
        console.log('[Compile] 🔍 Checking ESP32 core...');
        const esp32Installed = await ArduinoCLI.isESP32CoreInstalled();
        if (!esp32Installed) {
            console.log('[Compile] ❌ ESP32 core not installed');
            return res.status(500).json({
                error: 'ESP32 core not installed',
                message: 'Installing ESP32 core... Please run: arduino-cli core install esp32:esp32'
            });
        }
        console.log('[Compile] ✅ ESP32 core found');

        // Compile the code
        console.log('[Compile] 🔨 Starting compilation for board:', board || 'esp32:esp32:esp32');
        const result = await ArduinoCLI.compile({ code, board: board || 'esp32:esp32:esp32' });

        if (result.success && result.binaryPath) {
            console.log('[Compile] ✅ Compilation successful! Binary at:', result.binaryPath);
            // Read binary data
            const binaryData = await ArduinoCLI.readBinary(result.binaryPath);
            const base64Binary = Buffer.from(binaryData).toString('base64');

            console.log('[Compile] 📦 Binary encoded, size:', binaryData.byteLength, 'bytes');

            return res.status(200).json({
                success: true,
                output: result.output,
                warnings: result.warnings,
                binaryData: base64Binary,
                binarySize: binaryData.byteLength
            });
        } else {
            console.log('[Compile] ❌ Compilation failed, errors:', result.errors?.length);
            return res.status(200).json({
                success: false,
                output: result.output,
                errors: result.errors,
                warnings: result.warnings
            });
        }
    } catch (error: any) {
        console.error('[Compile] 💥 Exception during compilation:', error);
        return res.status(500).json({
            error: 'Compilation failed',
            details: error.message
        });
    }
}
