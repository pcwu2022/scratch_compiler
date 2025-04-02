// Text-Based Scratch Compiler to JavaScript
// This compiler transforms Scratch-like syntax into executable JavaScript

// Types for our compiler
type BlockType = 'event' | 'motion' | 'looks' | 'sound' | 'control' | 'sensing' | 'operators' | 'variables' | 'custom';

interface BlockNode {
    type: BlockType;
    name: string;
    args: (string | number | BlockNode)[];
    next?: BlockNode;
}

interface Script {
    blocks: BlockNode[];
}

interface Program {
    scripts: Script[];
    variables: Map<string, any>;
    lists: Map<string, any[]>;
}

// Lexer: Convert input text to tokens
class Lexer {
    private code: string;
    private position: number = 0;
    private tokens: string[] = [];

    constructor(code: string) {
        this.code = code.trim();
    }

    tokenize(): string[] {
        while (this.position < this.code.length) {
            // Skip whitespace
            this.skipWhitespace();
            
            if (this.position >= this.code.length) break;
            
            const char = this.code[this.position];
            
            if (char === '(' || char === ')' || char === '[' || char === ']' || char === '{' || char === '}') {
                // Handle brackets
                this.tokens.push(char);
                this.position++;
            } else if (char === '"' || char === "'") {
                // Handle strings
                const stringValue = this.extractString();
                this.tokens.push(stringValue);
            } else if (this.isNumeric(char) || (char === '-' && this.isNumeric(this.code[this.position + 1]))) {
                // Handle numbers
                const number = this.extractNumber();
                this.tokens.push(number);
            } else if (this.isAlpha(char)) {
                // Handle identifiers and keywords
                const identifier = this.extractIdentifier();
                this.tokens.push(identifier);
            } else {
                // Skip unknown characters
                this.position++;
            }
        }
        
        return this.tokens;
    }

    private skipWhitespace(): void {
        while (
            this.position < this.code.length &&
            [' ', '\t', '\n', '\r'].includes(this.code[this.position])
        ) {
            this.position++;
        }
    }

    private extractString(): string {
        const quote = this.code[this.position];
        let value = quote;
        this.position++;
        
        while (this.position < this.code.length && this.code[this.position] !== quote) {
            value += this.code[this.position];
            this.position++;
        }
        
        if (this.position < this.code.length) {
            value += quote;
            this.position++;
        }
        
        return value;
    }

    private extractNumber(): string {
        let start = this.position;
        
        // Handle negative numbers
        if (this.code[this.position] === '-') {
            this.position++;
        }
        
        while (
            this.position < this.code.length &&
            (this.isNumeric(this.code[this.position]) || this.code[this.position] === '.')
        ) {
            this.position++;
        }
        
        return this.code.substring(start, this.position);
    }

    private extractIdentifier(): string {
        let start = this.position;
        
        while (
            this.position < this.code.length &&
            (this.isAlpha(this.code[this.position]) || 
             this.isNumeric(this.code[this.position]) || 
             this.code[this.position] === '_')
        ) {
            this.position++;
        }
        
        return this.code.substring(start, this.position);
    }

    private isAlpha(char: string): boolean {
        return /[a-zA-Z]/.test(char);
    }

    private isNumeric(char: string): boolean {
        return /[0-9]/.test(char);
    }
}

// Parser: Convert tokens to an AST (Abstract Syntax Tree)
class Parser {
    private tokens: string[];
    private position: number = 0;

    constructor(tokens: string[]) {
        this.tokens = tokens;
    }

    parse(): Program {
        const program: Program = {
            scripts: [],
            variables: new Map(),
            lists: new Map(),
        };
        
        while (this.position < this.tokens.length) {
            const token = this.tokens[this.position];
            
            if (token === 'when') {
                const script = this.parseScript();
                program.scripts.push(script);
            } else if (token === 'var') {
                this.parseVariableDeclaration(program);
            } else if (token === 'list') {
                this.parseListDeclaration(program);
            } else {
                // Skip unknown tokens
                this.position++;
            }
        }
        
        return program;
    }

    private parseScript(): Script {
        const blocks: BlockNode[] = [];
        
        while (this.position < this.tokens.length) {
            const block = this.parseBlock();
            if (block) {
                blocks.push(block);
            } else {
                break;
            }
        }
        
        return { blocks };
    }

    private parseBlock(): BlockNode | null {
        // Check if we're at the beginning of a block
        if (this.tokens[this.position] === 'when' || 
                this.tokens[this.position] === 'move' || 
                this.tokens[this.position] === 'say' ||
                this.tokens[this.position] === 'wait' ||
                this.tokens[this.position] === 'repeat' ||
                this.tokens[this.position] === 'if' ||
                this.tokens[this.position] === 'set' ||
                this.tokens[this.position] === 'change') {
            
            const blockName = this.tokens[this.position];
            this.position++;
            
            // Determine block type
            let blockType: BlockType;
            
            if (blockName === 'when') blockType = 'event';
            else if (blockName === 'move') blockType = 'motion';
            else if (blockName === 'say') blockType = 'looks';
            else if (blockName === 'wait') blockType = 'control';
            else if (blockName === 'repeat' || blockName === 'if') blockType = 'control';
            else if (blockName === 'set' || blockName === 'change') blockType = 'variables';
            else blockType = 'custom';
            
            // Parse block arguments
            const args: (string | number | BlockNode)[] = [];
            
            while (this.position < this.tokens.length) {
                // Break the loop if we encounter a new block
                if (this.isBlockStart(this.tokens[this.position])) {
                    break;
                }
                
                // If opening bracket, parse as nested expression
                if (this.tokens[this.position] === '(') {
                    this.position++; // Skip '('
                    const nestedArgs: (string | number)[] = [];
                    
                    while (this.position < this.tokens.length && this.tokens[this.position] !== ')') {
                        if (this.isNumber(this.tokens[this.position])) {
                            nestedArgs.push(parseFloat(this.tokens[this.position]));
                        } else {
                            nestedArgs.push(this.tokens[this.position]);
                        }
                        this.position++;
                    }
                    
                    if (this.position < this.tokens.length) {
                        this.position++; // Skip ')'
                    }
                    
                    // Create a fake operator block for the nested expression
                    args.push({
                        type: 'operators',
                        name: 'expression',
                        args: nestedArgs
                    });
                } else {
                    // Add argument as is (string or number)
                    if (this.isNumber(this.tokens[this.position])) {
                        args.push(parseFloat(this.tokens[this.position]));
                    } else {
                        args.push(this.tokens[this.position]);
                    }
                    this.position++;
                }
            }
            
            // Create the block node
            const block: BlockNode = {
                type: blockType,
                name: blockName,
                args
            };
            
            // Check if there's a next block
            if (this.position < this.tokens.length && this.isBlockStart(this.tokens[this.position])) {
                const nextBlock = this.parseBlock();
                if (nextBlock) {
                    block.next = nextBlock;
                }
            }
            
            return block;
        }
        
        return null;
    }

    private parseVariableDeclaration(program: Program): void {
        this.position++; // Skip 'var'
        
        if (this.position < this.tokens.length) {
            const variableName = this.tokens[this.position];
            this.position++;
            
            // Check for initial value
            let initialValue: any = 0;
            if (this.position < this.tokens.length && this.tokens[this.position] === '=') {
                this.position++; // Skip '='
                
                if (this.position < this.tokens.length) {
                    if (this.isNumber(this.tokens[this.position])) {
                        initialValue = parseFloat(this.tokens[this.position]);
                    } else {
                        initialValue = this.tokens[this.position].replace(/["']/g, '');
                    }
                    this.position++;
                }
            }
            
            // Add variable to the program
            program.variables.set(variableName, initialValue);
        }
    }

    private parseListDeclaration(program: Program): void {
        this.position++; // Skip 'list'
        
        if (this.position < this.tokens.length) {
            const listName = this.tokens[this.position];
            this.position++;
            
            // Initialize empty list
            program.lists.set(listName, []);
            
            // Check for initial values
            if (this.position < this.tokens.length && this.tokens[this.position] === '[') {
                this.position++; // Skip '['
                
                const values: any[] = [];
                while (this.position < this.tokens.length && this.tokens[this.position] !== ']') {
                    if (this.isNumber(this.tokens[this.position])) {
                        values.push(parseFloat(this.tokens[this.position]));
                    } else {
                        values.push(this.tokens[this.position].replace(/["']/g, ''));
                    }
                    this.position++;
                }
                
                if (this.position < this.tokens.length) {
                    this.position++; // Skip ']'
                }
                
                // Update list with initial values
                program.lists.set(listName, values);
            }
        }
    }

    private isBlockStart(token: string): boolean {
        return ['when', 'move', 'say', 'wait', 'repeat', 'if', 'set', 'change'].includes(token);
    }

    private isNumber(value: string): boolean {
        return !isNaN(parseFloat(value)) && isFinite(parseFloat(value));
    }
}

// Code Generator: Convert AST to JavaScript code
class CodeGenerator {
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
                this.write(`document.addEventListener('DOMContentLoaded', function() {\n`);
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

// Main compiler class
export class ScratchTextCompiler {
    compile(code: string): string {
        try {
            // Step 1: Tokenize the input
            const lexer = new Lexer(code);
            const tokens = lexer.tokenize();
            
            // Step 2: Parse tokens into AST
            const parser = new Parser(tokens);
            const program = parser.parse();
            
            // Step 3: Generate JavaScript code
            const generator = new CodeGenerator(program);
            const jsCode = generator.generate();
            
            return jsCode;
        } catch (error) {
            console.error('Compilation error:', error);
            return `// Compilation error: ${error instanceof Error ? error.message : String(error)}`;
        }
    }
}

// Usage example:
// src/lib/compiler.ts
  
export async function compile(code: string): Promise<{ result: string } | { error: string }> {
    try {
        const compiler = new ScratchTextCompiler();
        const jsCode = compiler.compile(code);
        return { result: jsCode };
    } catch (error) {
        console.error('Error in compile function:', error);
        return { error: 'Compilation failed in compiler function.' };
    }
  }