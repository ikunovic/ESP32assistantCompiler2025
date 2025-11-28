import { UploadProgress } from '@/types';

// ESP32 Serial Service UUID (Nordic UART Service - commonly used)
const UART_SERVICE_UUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
const UART_TX_CHARACTERISTIC_UUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';
const UART_RX_CHARACTERISTIC_UUID = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';

export class BluetoothManager {
    private device: BluetoothDevice | null = null;
    private server: BluetoothRemoteGATTServer | null = null;
    private txCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
    private rxCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;

    /**
     * Check if Web Bluetooth is supported
     */
    static isSupported(): boolean {
        return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
    }

    /**
     * Request and connect to a Bluetooth device
     */
    async connect(): Promise<string> {
        if (!BluetoothManager.isSupported()) {
            throw new Error('Web Bluetooth is not supported in this browser. Please use Chrome or Edge.');
        }

        try {
            // Request device
            this.device = await navigator.bluetooth.requestDevice({
                filters: [
                    { services: [UART_SERVICE_UUID] },
                    { namePrefix: 'ESP32' }
                ],
                optionalServices: [UART_SERVICE_UUID]
            });

            if (!this.device.gatt) {
                throw new Error('GATT not available');
            }

            // Connect to GATT server
            this.server = await this.device.gatt.connect();

            // Get UART service
            const service = await this.server.getPrimaryService(UART_SERVICE_UUID);

            // Get characteristics
            this.txCharacteristic = await service.getCharacteristic(UART_TX_CHARACTERISTIC_UUID);
            this.rxCharacteristic = await service.getCharacteristic(UART_RX_CHARACTERISTIC_UUID);

            // Setup notifications for receiving data
            await this.rxCharacteristic.startNotifications();

            return this.device.name || 'ESP32 Device';
        } catch (error) {
            throw new Error(`Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Disconnect from the device
     */
    disconnect(): void {
        if (this.device && this.device.gatt) {
            this.device.gatt.disconnect();
        }
        this.device = null;
        this.server = null;
        this.txCharacteristic = null;
        this.rxCharacteristic = null;
    }

    /**
     * Check if device is connected
     */
    isConnected(): boolean {
        return this.device !== null && this.device.gatt !== undefined && this.device.gatt.connected;
    }

    /**
     * Send data to ESP32
     */
    async sendData(data: Uint8Array): Promise<void> {
        if (!this.isConnected() || !this.txCharacteristic) {
            throw new Error('Device not connected');
        }

        // Bluetooth has MTU limits (typically 20 bytes for older devices, up to 512 for newer)
        const MTU = 20;

        for (let i = 0; i < data.length; i += MTU) {
            const chunk = data.slice(i, Math.min(i + MTU, data.length));
            await this.txCharacteristic.writeValue(chunk);

            // Small delay to prevent overwhelming the device
            await new Promise(resolve => setTimeout(resolve, 10));
        }
    }

    /**
     * Upload binary to ESP32
     * Note: This is a simplified version. Real OTA update requires proper protocol.
     */
    async uploadBinary(
        binaryData: ArrayBuffer,
        onProgress: (progress: UploadProgress) => void
    ): Promise<void> {
        if (!this.isConnected()) {
            throw new Error('Device not connected');
        }

        const data = new Uint8Array(binaryData);
        const totalBytes = data.length;
        let bytesTransferred = 0;

        onProgress({
            bytesTransferred: 0,
            totalBytes,
            percentage: 0,
            status: 'uploading',
            message: 'Starting upload...'
        });

        try {
            // Send in chunks
            const CHUNK_SIZE = 512;

            for (let offset = 0; offset < totalBytes; offset += CHUNK_SIZE) {
                const chunk = data.slice(offset, Math.min(offset + CHUNK_SIZE, totalBytes));
                await this.sendData(chunk);

                bytesTransferred = offset + chunk.length;
                const percentage = Math.round((bytesTransferred / totalBytes) * 100);

                onProgress({
                    bytesTransferred,
                    totalBytes,
                    percentage,
                    status: 'uploading',
                    message: `Uploading: ${percentage}%`
                });
            }

            onProgress({
                bytesTransferred: totalBytes,
                totalBytes,
                percentage: 100,
                status: 'success',
                message: 'Upload complete!'
            });
        } catch (error) {
            onProgress({
                bytesTransferred,
                totalBytes,
                percentage: Math.round((bytesTransferred / totalBytes) * 100),
                status: 'error',
                message: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            });
            throw error;
        }
    }

    /**
     * Setup listener for incoming data
     */
    onDataReceived(callback: (data: Uint8Array) => void): void {
        if (!this.rxCharacteristic) {
            throw new Error('RX characteristic not available');
        }

        this.rxCharacteristic.addEventListener('characteristicvaluechanged', (event) => {
            const value = (event.target as BluetoothRemoteGATTCharacteristic).value;
            if (value) {
                const data = new Uint8Array(value.buffer);
                callback(data);
            }
        });
    }
}

export const bluetoothManager = new BluetoothManager();
