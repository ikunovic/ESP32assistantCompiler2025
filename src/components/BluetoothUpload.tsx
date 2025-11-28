import React, { useState } from 'react';
import { UploadProgress, CompilationResult } from '@/types';
import { BluetoothManager } from '@/utils/bluetooth';

interface BluetoothUploadProps {
    compilationResult: CompilationResult | null;
}

export const BluetoothUpload: React.FC<BluetoothUploadProps> = ({ compilationResult }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [deviceName, setDeviceName] = useState('');
    const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
        bytesTransferred: 0,
        totalBytes: 0,
        percentage: 0,
        status: 'idle'
    });

    const bluetoothManager = new BluetoothManager();

    const handleConnect = async () => {
        if (!BluetoothManager.isSupported()) {
            alert('❌ Web Bluetooth is not supported in this browser. Please use Chrome or Edge.');
            return;
        }

        try {
            const name = await bluetoothManager.connect();
            setDeviceName(name);
            setIsConnected(true);
            setUploadProgress({
                bytesTransferred: 0,
                totalBytes: 0,
                percentage: 0,
                status: 'idle',
                message: '✓ Connected successfully'
            });
        } catch (error: any) {
            alert(`Failed to connect: ${error.message}`);
        }
    };

    const handleDisconnect = () => {
        bluetoothManager.disconnect();
        setIsConnected(false);
        setDeviceName('');
        setUploadProgress({
            bytesTransferred: 0,
            totalBytes: 0,
            percentage: 0,
            status: 'idle'
        });
    };

    const handleUpload = async () => {
        if (!compilationResult?.binaryData) {
            alert('Please compile the code first!');
            return;
        }

        if (!isConnected) {
            alert('Please connect to ESP32 first!');
            return;
        }

        try {
            // Convert base64 string to ArrayBuffer
            const binaryString = window.atob(compilationResult.binaryData);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            await bluetoothManager.uploadBinary(
                bytes.buffer,
                (progress) => {
                    setUploadProgress(progress);
                }
            );
        } catch (error: any) {
            console.error('Upload failed:', error);
        }
    };

    const isBinaryReady = compilationResult?.success && compilationResult?.binaryData;

    return (
        <div className="card">
            <div className="flex items-center gap-md mb-md">
                <span style={{ fontSize: '1.5rem' }}>📡</span>
                <h3 style={{ margin: 0 }}>Bluetooth Upload</h3>
            </div>

            {/* Connection Status */}
            <div className="mb-md p-md" style={{
                background: isConnected
                    ? 'hsla(145, 65%, 55%, 0.15)'
                    : 'var(--color-bg-tertiary)',
                border: `1px solid ${isConnected ? 'var(--color-success)' : 'var(--color-border)'}`,
                borderRadius: 'var(--radius-md)'
            }}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-sm">
                        <div style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            background: isConnected ? 'var(--color-success)' : 'var(--color-text-tertiary)',
                            animation: isConnected ? 'pulse 2s infinite' : 'none'
                        }} />
                        <span className="font-semibold">
                            {isConnected ? `Connected to ${deviceName}` : 'Not connected'}
                        </span>
                    </div>
                    {isConnected && (
                        <button className="btn btn-secondary" onClick={handleDisconnect} style={{ padding: '0.25rem 0.75rem' }}>
                            Disconnect
                        </button>
                    )}
                </div>
            </div>

            {/* Connect Button */}
            {!isConnected ? (
                <button className="btn btn-primary w-full mb-md" onClick={handleConnect}>
                    🔗 Connect to ESP32
                </button>
            ) : (
                /* Upload Button */
                <button
                    className={`btn ${isBinaryReady ? 'btn-success' : 'btn-secondary'} w-full mb-md`}
                    onClick={handleUpload}
                    disabled={!isBinaryReady || uploadProgress.status === 'uploading'}
                >
                    {uploadProgress.status === 'uploading' ? (
                        <>
                            <span className="animate-spin">📤</span>
                            Uploading... {uploadProgress.percentage}%
                        </>
                    ) : isBinaryReady ? (
                        <>📤 Upload to ESP32</>
                    ) : (
                        <>⚠️ Compile code first</>
                    )}
                </button>
            )}

            {/* Upload Progress */}
            {uploadProgress.status !== 'idle' && (
                <div className="animate-fade-in mb-md">
                    <div className="flex justify-between text-sm mb-sm">
                        <span>{uploadProgress.message}</span>
                        <span className="font-semibold">{uploadProgress.percentage}%</span>
                    </div>

                    {/* Progress Bar */}
                    <div style={{
                        width: '100%',
                        height: '8px',
                        background: 'var(--color-bg-tertiary)',
                        borderRadius: 'var(--radius-xl)',
                        overflow: 'hidden',
                        border: '1px solid var(--color-border)'
                    }}>
                        <div style={{
                            width: `${uploadProgress.percentage}%`,
                            height: '100%',
                            background: uploadProgress.status === 'success'
                                ? 'linear-gradient(90deg, var(--color-success), hsl(145, 65%, 45%))'
                                : uploadProgress.status === 'error'
                                    ? 'linear-gradient(90deg, var(--color-error), hsl(5, 85%, 50%))'
                                    : 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))',
                            transition: 'width 0.3s ease',
                            animation: uploadProgress.status === 'uploading' ? 'pulse 1.5s infinite' : 'none'
                        }} />
                    </div>

                    {uploadProgress.bytesTransferred > 0 && (
                        <p className="text-sm opacity-70 mt-sm" style={{ margin: 0 }}>
                            {(uploadProgress.bytesTransferred / 1024).toFixed(1)} KB / {(uploadProgress.totalBytes / 1024).toFixed(1)} KB
                        </p>
                    )}
                </div>
            )}

            {/* Status Messages */}
            {uploadProgress.status === 'success' && (
                <div className="p-md" style={{
                    background: 'hsla(145, 65%, 55%, 0.15)',
                    border: '1px solid var(--color-success)',
                    borderRadius: 'var(--radius-md)'
                }}>
                    <p className="text-sm" style={{ margin: 0 }}>
                        <strong>✅ Upload Complete!</strong><br />
                        Your code is now running on the ESP32. Check the LED!
                    </p>
                </div>
            )}

            {uploadProgress.status === 'error' && (
                <div className="p-md" style={{
                    background: 'hsla(5, 85%, 60%, 0.15)',
                    border: '1px solid var(--color-error)',
                    borderRadius: 'var(--radius-md)'
                }}>
                    <p className="text-sm" style={{ margin: 0 }}>
                        <strong>❌ Upload Failed</strong><br />
                        {uploadProgress.message}
                    </p>
                </div>
            )}

            {/* Info Box */}
            <div className="mt-md p-md" style={{
                background: 'var(--color-bg-tertiary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)'
            }}>
                <p className="text-sm opacity-70" style={{ margin: 0 }}>
                    <strong>ℹ️ Web Bluetooth Requirements:</strong>
                    <br />• Use Chrome or Edge browser
                    <br />• ESP32 must have Bluetooth Serial enabled
                    <br />• Pair ESP32 from browser when prompted
                </p>
            </div>
        </div>
    );
};
