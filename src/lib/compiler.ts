// Text-Based Scratch Compiler to JavaScript
// This compiler transforms Scratch-like syntax into executable JavaScript.
// It orchestrates the process of lexical analysis, parsing, and code generation.

import { Lexer } from "./lexer";
import { Parser } from "./parser";
import { CodeGenerator } from "./codeGenerator";
import Debugger from './debugger';

// Main compiler class
export class ScratchTextCompiler {
    public debugger: Debugger;

    constructor() {
        this.debugger = new Debugger({
            enabled: true,
            logLevels: ['info', 'warn', 'error'],
            saveToFile: true,
            filePath: '../debug/compilerOutput.json',
        });
    }
    // compile: Main method that takes Scratch-like text code as input and returns JavaScript code.
    compile(code: string): string {
        try {
            // Step 1: Tokenize the input using the Lexer.
            // The Lexer converts the raw text input into an array of tokens,
            // which are the basic building blocks of the programming language.
            const lexer = new Lexer(code);
            const tokens = lexer.tokenize();

            this.debugger.log("info", "Lexer output (tokens) ", tokens);

            // Step 2: Parse tokens into an Abstract Syntax Tree (AST) using the Parser.
            // The Parser takes the tokens and constructs an AST, which represents the
            // structure of the program in a hierarchical format.
            const parser = new Parser(tokens);
            const program = parser.parse();

            this.debugger.log("info", "Parser output (program) ", program);

            // Step 3: Generate JavaScript code from the AST using the CodeGenerator.
            // The CodeGenerator traverses the AST and produces JavaScript code that
            // corresponds to the original Scratch-like input.
            const generator = new CodeGenerator(program);
            const jsCode = generator.generate();

            this.debugger.log("info", "Generator output (jsCode) ", jsCode);

            // Return the generated JavaScript code.
            return jsCode;
        } catch (error) {
            // Handle any errors that occur during compilation.
            console.error('Compilation error:', error);
            // Return an error message as a comment in the JavaScript output.
            return `// Compilation error: ${error instanceof Error ? error.message : String(error)}`;
        }
    }
}

// compile: Asynchronous function that wraps the compiler and handles potential errors.
// This function is designed to be used in an asynchronous context, such as in a web environment.
export async function compile(code: string): Promise<{ result: string } | { error: string }> {
    try {
        // Create an instance of the ScratchTextCompiler.
        const compiler = new ScratchTextCompiler();
        // Call the compile method to generate JavaScript code.
        const jsCode = compiler.compile(code);
        // Return the generated code in a result object.
        return { result: jsCode };
    } catch (error) {
        // Handle any errors that occur during the compilation process.
        console.error('Error in compile function:', error);
        // Return an error object indicating compilation failure.
        return { error: 'Compilation failed in compiler function.' };
    }
}