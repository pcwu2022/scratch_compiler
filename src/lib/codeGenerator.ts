// Code Generator: Convert AST to JavaScript code

import { Program, BlockNode } from "@/app/types/compilerTypes";

export class CodeGenerator {
    private program: Program;
    private output: string = '';
    private indent: number = 0;

    constructor(program: Program) {
        this.program = program;
    }

    generate(): string {
        // Add setup code
        this.output = `// Generated Scratch-like JavaScript code\n`;
        this.output += `// Runtime support functions\n`;
        this.output += `const scratchRuntime = {\n`;
        this.output += `    sprites: {},\n`;
        this.output += `    stage: { width: 480, height: 360 },\n`;
        this.output += `    currentSprite: 'Sprite1',\n`;
        this.output += `    init: function() {\n`;
        this.output += `        this.sprites.Sprite1 = {\n`;
        this.output += `            x: 0,\n`;
        this.output += `            y: 0,\n`;
        this.output += `            direction: 90,\n`;
        this.output += `            costumes: ['default'],\n`;
        this.output += `            currentCostume: 0,\n`;
        this.output += `            visible: true,\n`;
        this.output += `            say: function(message, seconds) {\n`;
        this.output += `                console.log(\`\${scratchRuntime.currentSprite} says: \${message}\`);\n`;
        this.output += `                if (seconds) {\n`;
        this.output += `                    setTimeout(() => console.log(\`\${scratchRuntime.currentSprite} stopped saying\`), seconds * 1000);\n`;
        this.output += `                }\n`;
        this.output += `            },\n`;
        this.output += `            move: function(steps) {\n`;
        this.output += `                const radians = this.direction * Math.PI / 180;\n`;
        this.output += `                this.x += steps * Math.cos(radians);\n`;
        this.output += `                this.y += steps * Math.sin(radians);\n`;
        this.output += `                console.log(\`\${scratchRuntime.currentSprite} moved to (\${this.x}, \${this.y})\`);\n`;
        this.output += `            }\n`;
        this.output += `        };\n`;
        this.output += `    }\n`;
        this.output += `};\n\n`;
        
        // Initialize runtime
        this.output += `scratchRuntime.init();\n\n`;

        // Generate code for variables
        this.output += `// Variables\n`;
        this.program.variables.forEach((value, name) => {
            if (typeof value === 'number') {
                this.output += `let ${name} = ${value};\n`;
            } else {
                this.output += `let ${name} = "${value}";\n`;
            }
        });
        this.output += `\n`;

        // Generate code for lists
        this.output += `// Lists\n`;
        this.program.lists.forEach((values, name) => {
            this.output += `let ${name} = [${values.map(v => typeof v === 'number' ? v : `"${v}"`).join(', ')}];\n`;
        });
        this.output += `\n`;

        // Generate code for scripts
        this.output += `// Scripts\n`;
        this.program.scripts.forEach(script => {
            script.blocks.forEach(block => {
                this.generateBlockCode(block);
            });
        });

        return this.output;
    }

    private generateBlockCode(block: BlockNode): void {
        switch (block.type) {
            case 'event':
                this.generateEventBlock(block);
                break;
            case 'motion':
                this.generateMotionBlock(block);
                break;
            case 'looks':
                this.generateLooksBlock(block);
                break;
            case 'control':
                this.generateControlBlock(block);
                break;
            case 'variables':
                this.generateVariablesBlock(block);
                break;
            case 'operators':
                this.generateOperatorsBlock(block);
                break;
            default:
                // Generate custom block
                this.write(`// Unsupported block: ${block.name}\n`);
        }

        // Process next block if it exists
        if (block.next) {
            this.generateBlockCode(block.next);
        }
    }

    private generateEventBlock(block: BlockNode): void {
        if (block.name === 'when') {
            const eventType = block.args[0];
            
            if (eventType === 'flagClicked') {
                this.write(`// When green flag clicked\n`);
                this.write(`document.addEventListener('DOMContentLoaded', async function() {\n`);
                this.indent++;
                
                // If there's a next block, generate its code
                if (block.next) {
                    this.generateBlockCode(block.next);
                }
                
                this.indent--;
                this.write(`});\n\n`);
            } else if (typeof eventType === 'string' && eventType.includes('keyPressed')) {
                const key = eventType.replace('keyPressed', '');
                this.write(`// When ${key} key pressed\n`);
                this.write(`document.addEventListener('keydown', function(event) {\n`);
                this.indent++;
                this.write(`if (event.key === "${key.toLowerCase()}") {\n`);
                this.indent++;
                
                // If there's a next block, generate its code
                if (block.next) {
                    this.generateBlockCode(block.next);
                }
                
                this.indent--;
                this.write(`}\n`);
                this.indent--;
                this.write(`});\n\n`);
            }
        }
    }

    private generateMotionBlock(block: BlockNode): void {
        if (block.name === 'move') {
            const steps = this.formatArg(block.args[0]);
            this.write(`scratchRuntime.sprites[scratchRuntime.currentSprite].move(${steps});\n`);
        }
    }

    private generateLooksBlock(block: BlockNode): void {
        if (block.name === 'say') {
            const message = this.formatArg(block.args[0]);
            const seconds = block.args[1] ? this.formatArg(block.args[1]) : undefined;
            
            if (seconds) {
                this.write(`scratchRuntime.sprites[scratchRuntime.currentSprite].say(${message}, ${seconds});\n`);
            } else {
                this.write(`scratchRuntime.sprites[scratchRuntime.currentSprite].say(${message});\n`);
            }
        }
    }

    private generateControlBlock(block: BlockNode): void {
        if (block.name === 'wait') {
            const seconds = this.formatArg(block.args[0]);
            this.write(`await new Promise(resolve => setTimeout(resolve, ${seconds} * 1000));\n`);
        } else if (block.name === 'repeat') {
            const count = this.formatArg(block.args[0]);
            this.write(`for (let i = 0; i < ${count}; i++) {\n`);
            this.indent++;
            
            // If there's a next block inside the repeat, generate its code
            if (block.next) {
                this.generateBlockCode(block.next);
            }
            
            this.indent--;
            this.write(`}\n`);
        } else if (block.name === 'if') {
            const condition = this.formatArg(block.args[0]);
            this.write(`if (${condition}) {\n`);
            this.indent++;
            
            // If there's a next block inside the if, generate its code
            if (block.next) {
                this.generateBlockCode(block.next);
            }
            
            this.indent--;
            this.write(`}\n`);
        }
    }

    private generateVariablesBlock(block: BlockNode): void {
        if (block.name === 'set') {
            const variableName = block.args[0];
            const value = this.formatArg(block.args[1]);
            this.write(`${variableName} = ${value};\n`);
        } else if (block.name === 'change') {
            const variableName = block.args[0];
            const value = this.formatArg(block.args[1]);
            this.write(`${variableName} += ${value};\n`);
        }
    }

    private generateOperatorsBlock(block: BlockNode): string {
        if (block.name === 'expression') {
            const expression = block.args.map(arg => this.formatArg(arg)).join(' ');
            return `(${expression})`;
        }
        return '';
    }

    private formatArg(arg: string | number | BlockNode): string {
        if (typeof arg === 'number') {
            return arg.toString();
        } else if (typeof arg === 'string') {
            // Check if it's a string literal
            if (arg.startsWith('"') || arg.startsWith("'")) {
                return arg;
            } else {
                // It's a variable or special value
                return arg;
            }
        } else if (arg && typeof arg === 'object') {
            // It's a nested block
            if (arg.type === 'operators' && arg.name === 'expression') {
                return this.generateOperatorsBlock(arg);
            }
        }
        
        return `"${arg}"`; // Default: treat as string
    }

    private write(code: string): void {
        const indentation = '    '.repeat(this.indent);
        this.output += indentation + code;
    }
}
