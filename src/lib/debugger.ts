import { promises as fs } from 'fs';
import path from 'path';

interface DebugOptions {
    enabled: boolean;
    logLevels?: string[]; // e.g., ['info', 'warn', 'error']
    saveToFile?: boolean;
    filePath?: string;
}
  
interface LogEntry {
    level: string;
    message: any;
    timestamp: string;
    context?: any;
}

class SimpleDebugger {
    private enabled: boolean;
    constructor(enabled: boolean = true){
        this.enabled = enabled;
    }
    debug(...args: any[]) {
        if (this.enabled) {
            console.log(...args);
        }
    }
    enable(enabled: boolean = true) {
        this.enabled = enabled;
    }
}
  
class Debugger {
    private options: DebugOptions;
    private logs: LogEntry[] = [];
  
    constructor(options: DebugOptions = { enabled: false }) {
        this.options = {
            enabled: options.enabled,
            logLevels: options.logLevels || ['info', 'warn', 'error'],
            saveToFile: options.saveToFile || false,
            filePath: options.filePath || '../debug/debug.json',
        };
    }
  
    setOptions(options: Partial<DebugOptions>) {
        this.options = { ...this.options, ...options };
    }
  
    log(level: string, message: any, context?: any) {
        if (!this.options.enabled) {
            return;
        }
  
        if (this.options.logLevels && !this.options.logLevels.includes(level)) {
            return;
        }
  
        const logEntry: LogEntry = {
            level,
            message,
            timestamp: new Date().toISOString(),
            context,
        };
  
        this.logs.push(logEntry);
  
        // console.log(`[${logEntry.timestamp}] ${level.toUpperCase()}:`, message, context ? context : '');
  
        if (this.options.saveToFile) {
            this.saveLogsToFile();
        }
    }
  
    info(message: any, context?: any) {
        this.log('info', message, context);
    }
  
    warn(message: any, context?: any) {
        this.log('warn', message, context);
    }
  
    error(message: any, context?: any) {
        this.log('error', message, context);
    }
  
    debug(message: any, context?: any) {
        this.log('debug', message, context);
    }
  
    private async saveLogsToFile() {
        if (!this.options.saveToFile || !this.options.filePath) {
            return;
        }
  
        try {
  
            const directory = path.dirname(this.options.filePath);
  
            await fs.mkdir(directory, { recursive: true });
            await fs.writeFile(this.options.filePath, JSON.stringify(this.logs, null, 2));
            console.log('Saved file to: ', this.options.filePath);
        } catch (error) {
            console.error('Error saving logs to file:', error);
        }
    }
  
    getLogs(): LogEntry[] {
        return this.logs;
    }
  
    clearLogs(): void {
        this.logs = [];
    }
}
  
export default Debugger;
export { SimpleDebugger };