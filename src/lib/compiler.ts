// Text-Based Scratch Compiler to JavaScript
// This compiler transforms Scratch-like syntax into executable JavaScript

import { Lexer } from "./lexer";
import { Parser } from "./parser";
import { CodeGenerator } from "./codeGenerator";

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

// Compile Function
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