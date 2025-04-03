// Parser: Convert tokens to an AST (Abstract Syntax Tree)

import { Program, BlockNode, Script, BlockType } from "@/app/types/compilerTypes";

export class Parser {
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
