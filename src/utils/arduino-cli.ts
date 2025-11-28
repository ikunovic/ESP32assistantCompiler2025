import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const execAsync = promisify(exec);

export interface ArduinoCompileOptions {
    board: string;
    code: string;
    outputDir?: string;
}

export interface ArduinoCompileResult {
    success: boolean;
    output: string;
    errors: string[];
    warnings: string[];
    binaryPath?: string;
}

export class ArduinoCLI {
    private static ESP32_FQBN = 'esp32:esp32:esp32';

    /**
     * Get the arduino-cli command (handles Windows installation path)
     */
    private static getArduinoCLICommand(): string {
        // On Windows, check standard installation path
        if (process.platform === 'win32') {
            const windowsPath = 'C:\\Program Files\\Arduino CLI\\arduino-cli.exe';
            if (fs.existsSync(windowsPath)) {
                return `"${windowsPath}"`;
            }
        }
        // Default to PATH
        return 'arduino-cli';
    }

    /**
     * Check if Arduino CLI is installed
     */
    static async isInstalled(): Promise<boolean> {
        try {
            const cmd = this.getArduinoCLICommand();
            await execAsync(`${cmd} version`);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Get Arduino CLI version
     */
    static async getVersion(): Promise<string> {
        try {
            const cmd = this.getArduinoCLICommand();
            const { stdout } = await execAsync(`${cmd} version`);
            return stdout.trim();
        } catch (error) {
            throw new Error('Arduino CLI not found');
        }
    }

    /**
     * Install ESP32 core if not installed
     */
    static async installESP32Core(): Promise<void> {
        try {
            const cmd = this.getArduinoCLICommand();
            // Update core index
            await execAsync(`${cmd} core update-index`);

            // Install ESP32 core
            await execAsync(`${cmd} core install esp32:esp32`);
        } catch (error) {
            throw new Error(`Failed to install ESP32 core: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Check if ESP32 core is installed
     */
    static async isESP32CoreInstalled(): Promise<boolean> {
        try {
            const cmd = this.getArduinoCLICommand();
            const { stdout } = await execAsync(`${cmd} core list`);
            return stdout.includes('esp32:esp32');
        } catch {
            return false;
        }
    }

    /**
     * Compile Arduino code for ESP32
     */
    static async compile(options: ArduinoCompileOptions): Promise<ArduinoCompileResult> {
        const { code, board = this.ESP32_FQBN } = options;

        // Create temporary directory for sketch
        const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'esp32-sketch-'));
        const sketchDir = path.join(tmpDir, 'sketch');
        const sketchFile = path.join(sketchDir, 'sketch.ino');
        const buildDir = path.join(tmpDir, 'build');

        try {
            // Create sketch directory
            fs.mkdirSync(sketchDir, { recursive: true });
            fs.mkdirSync(buildDir, { recursive: true });

            // Write code to sketch file
            fs.writeFileSync(sketchFile, code, 'utf-8');

            // Compile command
            const cmd = ArduinoCLI.getArduinoCLICommand();
            const compileCmd = `${cmd} compile --fqbn ${board} --output-dir "${buildDir}" "${sketchDir}"`;

            let output = '';
            let errors: string[] = [];
            let warnings: string[] = [];

            try {
                const { stdout, stderr } = await execAsync(compileCmd, { maxBuffer: 1024 * 1024 * 10 });
                output = stdout + stderr;

                // Parse output for warnings
                const lines = output.split('\n');
                lines.forEach(line => {
                    if (line.toLowerCase().includes('warning:')) {
                        warnings.push(line.trim());
                    }
                });

                // Find binary file
                const binFile = path.join(buildDir, 'sketch.ino.bin');

                if (fs.existsSync(binFile)) {
                    return {
                        success: true,
                        output,
                        errors: [],
                        warnings,
                        binaryPath: binFile
                    };
                } else {
                    return {
                        success: false,
                        output,
                        errors: ['Binary file not generated'],
                        warnings
                    };
                }
            } catch (error: any) {
                output = error.stdout + error.stderr;

                // Parse errors
                const lines = output.split('\n');
                lines.forEach(line => {
                    if (line.toLowerCase().includes('error:')) {
                        errors.push(line.trim());
                    } else if (line.toLowerCase().includes('warning:')) {
                        warnings.push(line.trim());
                    }
                });

                return {
                    success: false,
                    output,
                    errors: errors.length > 0 ? errors : ['Compilation failed'],
                    warnings
                };
            }
        } catch (error) {
            return {
                success: false,
                output: '',
                errors: [`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`],
                warnings: []
            };
        } finally {
            // Cleanup will happen when process exits or manually
            // For now, keep files for debugging
        }
    }

    /**
     * Read compiled binary file
     */
    static async readBinary(binaryPath: string): Promise<ArrayBuffer> {
        return new Promise((resolve, reject) => {
            fs.readFile(binaryPath, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength));
                }
            });
        });
    }
}
