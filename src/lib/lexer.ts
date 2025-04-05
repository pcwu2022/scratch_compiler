// Text-Based Scratch Compiler: Lexer
// This class, Lexer, is responsible for converting the input text (Scratch-like code)
// into a sequence of tokens. Tokens are the smallest units of the programming language
// that have meaning, such as keywords, identifiers, numbers, and symbols.
// The lexer processes the code character by character and groups them into these tokens.

import { Token, TokenType } from "@/types/compilerTypes";

export class Lexer {
    // The input code string.
    private code: string;
    // The current position in the input code string.
    private position: number = 0;
    // The array of tokens generated from the input code.
    private tokens: Token[] = [];
    // Current line number (for error reporting)
    private line: number = 1;
    // Current column number (for error reporting)
    private column: number = 1;
    // Track indentation levels
    private indentLevels: number[] = [0];
    // Scratch keywords
    private keywords: Set<string> = new Set([
        "when",
        "flag",
        "clicked",
        "forever",
        "if",
        "else",
        "then",
        "repeat",
        "until",
        "while",
        "end",
        "wait",
        "move",
        "steps",
        "turn",
        "degrees",
        "say",
        "for",
        "seconds",
        "think",
        "broadcast",
        "receive",
        "ask",
        "answer",
        "show",
        "hide",
        "switch",
        "costume",
        "backdrop",
        "next",
        "change",
        "set",
        "color",
        "effect",
        "size",
        "clear",
        "graphic",
        "effects",
        "reset",
        "timer",
        "variable",
        "to",
        "by",
        "and",
        "or",
        "not",
        "join",
        "letter",
        "of",
        "mod",
        "round",
        "abs",
        "floor",
        "ceiling",
        "sqrt",
        "sin",
        "cos",
        "tan",
        "asin",
        "acos",
        "atan",
        "ln",
        "log",
        "pow",
        "touching",
        "mouse-pointer",
        "edge",
        "sprite",
        "pen",
        "up",
        "down",
        "key",
        "pressed",
        "mouse",
        "down",
        "x",
        "y",
        "direction",
        "random",
        "between",
        "define",
        "procedure",
        "return",
        "event",
        "stop",
        "all",
        "this",
        "script",
        "true",
        "false",
        "null",
    ]);
    // Scratch operators
    private operators: Set<string> = new Set([
        "+",
        "-",
        "*",
        "/",
        "%",
        "=",
        ">",
        "<",
        ">=",
        "<=",
        "==",
        "!=",
        "&",
        "|",
        "!",
    ]);

    // Constructor: Initializes the Lexer with the input code.
    constructor(code: string) {
        // Add a newline at the end if it doesn't exist to handle final indentation
        this.code = code.endsWith("\n") ? code : code + "\n";
    }

    // tokenize: Main method to convert the input code into an array of tokens.
    tokenize(): Token[] {
        // Loop through the code until the end is reached.
        while (this.position < this.code.length) {
            // Process indentation at the beginning of each line
            if (this.column === 1) {
                this.handleIndentation();
            }

            // Get the current character at the current position.
            const char = this.code[this.position];

            // Check the type of the current character and process accordingly
            if ([" ", "\t"].includes(char)) {
                // Skip spaces and tabs (already handled in indentation)
                this.advance();
            } else if (char === "\n" || char === "\r") {
                this.handleNewline();
            } else if (char === "/" && this.code[this.position + 1] === "/") {
                this.extractComment();
            } else if (char === "(" || char === ")") {
                this.addToken(char === "(" ? TokenType.PARENTHESIS_OPEN : TokenType.PARENTHESIS_CLOSE, char);
                this.advance();
            } else if (char === "[" || char === "]") {
                this.addToken(char === "[" ? TokenType.BRACKET_OPEN : TokenType.BRACKET_CLOSE, char);
                this.advance();
            } else if (char === "{" || char === "}") {
                this.addToken(char === "{" ? TokenType.BRACE_OPEN : TokenType.BRACE_CLOSE, char);
                this.advance();
            } else if (char === ":") {
                this.addToken(TokenType.COLON, char);
                this.advance();
            } else if (char === ",") {
                this.addToken(TokenType.COMMA, char);
                this.advance();
            } else if (char === '"' || char === "'") {
                this.extractString();
            } else if (this.isNumeric(char) || (char === "-" && this.isNumeric(this.peek()))) {
                this.extractNumber();
            } else if (this.isOperator(char)) {
                this.extractOperator();
            } else if (this.isAlpha(char)) {
                this.extractIdentifier();
            } else {
                // Skip any unknown characters
                this.advance();
            }
        }

        // Close any remaining indentation levels
        while (this.indentLevels.length > 1) {
            this.indentLevels.pop();
            this.addToken(TokenType.DEDENT, "");
        }

        // Add EOF token
        this.addToken(TokenType.EOF, "");

        // Return the array of tokens.
        return this.tokens;
    }

    // Process indentation at the beginning of a line
    private handleIndentation(): void {
        // console.log("Indent starting at ", `[${this.code[this.position]}]${this.code.substring(this.position+1, Math.min(this.position+20, this.code.length))}`)
        let spaces = 0;

        // Count the leading spaces and tabs (tabs count as 4 spaces)
        while (this.position < this.code.length) {
            const char = this.code[this.position];
            if (char === " ") {
                spaces++;
                this.advance();
            } else if (char === "\t") {
                spaces += 4; // Tab counts as 4 spaces
                this.advance();
            } else {
                break;
            }
        }

        // Skip empty lines and comments
        if (
            this.code[this.position] === "\n" ||
            this.code[this.position] === "\r" ||
            (this.code[this.position] === "/" && this.code[this.position + 1] === "/")
        ) {
            return;
        }

        const currentIndent = this.indentLevels[this.indentLevels.length - 1];

        if (spaces > currentIndent) {
            // Increase in indentation level
            this.indentLevels.push(spaces);
            this.addToken(TokenType.INDENT, " ".repeat(spaces - currentIndent));
        } else if (spaces < currentIndent) {
            // Decrease in indentation level - may need multiple DEDENT tokens
            while (this.indentLevels.length > 1 && this.indentLevels[this.indentLevels.length - 1] > spaces) {
                this.indentLevels.pop();
                this.addToken(TokenType.DEDENT, "");
            }

            // Inconsistent indentation
            if (this.indentLevels[this.indentLevels.length - 1] !== spaces) {
                throw new Error(`Inconsistent indentation at line ${this.line}`);
            }
        }
    }

    // Handle newline characters (\n or \r\n)
    private handleNewline(): void {
        // console.log("NEW LINE!");
        // Skip carriage return in \r\n
        if (this.code[this.position] === "\r") {
            this.advance();
        }

        // Handle the newline character
        if (this.code[this.position] === "\n") {
            this.addToken(TokenType.NEWLINE, "\n");
            this.advance();
            // Reset column and increment line after newline
            this.line++;
            this.column = 1;
        }
    }

    // Extract comment (starting with //)
    private extractComment(): void {
        let comment = "";

        // Skip the double slashes
        this.advance();
        this.advance();

        // Collect all characters until the end of the line
        while (
            this.position < this.code.length &&
            this.code[this.position] !== "\n" &&
            this.code[this.position] !== "\r"
        ) {
            comment += this.code[this.position];
            this.advance();
        }

        this.addToken(TokenType.COMMENT, comment);
    }

    // Extract a string literal from the input code.
    private extractString(): void {
        const quote = this.code[this.position];
        let value = "";

        // Skip the opening quote
        this.advance();

        // Collect characters until closing quote
        while (this.position < this.code.length && this.code[this.position] !== quote) {
            // Handle escape sequences
            if (this.code[this.position] === "\\" && this.position + 1 < this.code.length) {
                this.advance();

                // Handle specific escape sequences
                switch (this.code[this.position]) {
                    case "n":
                        value += "\n";
                        break;
                    case "t":
                        value += "\t";
                        break;
                    case "r":
                        value += "\r";
                        break;
                    default:
                        value += this.code[this.position];
                }
            } else {
                value += this.code[this.position];
            }

            this.advance();
        }

        // Handle the closing quote
        if (this.position < this.code.length) {
            this.advance(); // Skip closing quote
        } else {
            throw new Error(`Unterminated string at line ${this.line}, column ${this.column}`);
        }

        this.addToken(TokenType.STRING, value);
    }

    // Extract a numeric literal from the input code.
    private extractNumber(): void {
        // console.log("Number starts at: ", this.code[this.position]);
        // const start = this.position;
        let value = "";
        let isFloat = false;

        // Handle negative sign
        if (this.code[this.position] === "-") {
            value += "-";
            this.advance();
        }

        // Collect digits and potential decimal point
        while (
            this.position < this.code.length &&
            (this.isNumeric(this.code[this.position]) || this.code[this.position] === ".")
        ) {
            if (this.code[this.position] === ".") {
                // Ensure only one decimal point
                if (isFloat) {
                    break;
                }
                isFloat = true;
            }
            value += this.code[this.position];
            this.advance();
        }

        this.addToken(TokenType.NUMBER, value);
    }

    // Extract an operator
    private extractOperator(): void {
        let value = this.code[this.position];
        this.advance();

        // Handle two-character operators (==, !=, >=, <=)
        if ((value === "=" || value === "!" || value === ">" || value === "<") && this.code[this.position] === "=") {
            value += "=";
            this.advance();
        }

        this.addToken(TokenType.OPERATOR, value);
    }

    // Extract an identifier or keyword - FIXED
    private extractIdentifier(): void {
        // console.log("Starting identifier at:", this.code[this.position]);
        // console.log("Full code: \n", this.code);
        let value = "";

        // Start with the current character - this was missing the first character
        // value += this.code[this.position];
        // this.advance();

        // Collect valid identifier characters (letters, digits, underscores)
        while (
            this.position < this.code.length &&
            (this.isAlpha(this.code[this.position]) ||
                this.isNumeric(this.code[this.position]) ||
                this.code[this.position] === "_")
        ) {
            value += this.code[this.position];
            this.advance();
        }

        // Check if this is a keyword
        if (this.keywords.has(value)) {
            this.addToken(TokenType.KEYWORD, value);
        } else {
            this.addToken(TokenType.IDENTIFIER, value);
        }
    }

    // Helper method to add a token to the tokens array
    private addToken(type: TokenType, value: string): void {
        this.tokens.push({
            type,
            value,
            line: this.line,
            column: this.column - value.length,
        });
    }

    // Advance the position in the code and update column
    private advance(): void {
        this.position++;
        this.column++;
        // console.log("Next char: ", this.code[this.position]);
    }

    // Peek at the next character without advancing
    private peek(): string {
        return this.position + 1 < this.code.length ? this.code[this.position + 1] : "\0";
    }

    // Check if a character is an alphabet letter
    private isAlpha(char: string): boolean {
        return /[a-zA-Z]/.test(char);
    }

    // Check if a character is a digit
    private isNumeric(char: string): boolean {
        return /[0-9]/.test(char);
    }

    // Check if a character is an operator
    private isOperator(char: string): boolean {
        return this.operators.has(char);
    }
}
