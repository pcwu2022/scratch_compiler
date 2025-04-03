// Text-Based Scratch Compiler: Lexer
// This class, Lexer, is responsible for converting the input text (Scratch-like code)
// into a sequence of tokens. Tokens are the smallest units of the programming language
// that have meaning, such as keywords, identifiers, numbers, and symbols.
// The lexer processes the code character by character and groups them into these tokens.

export class Lexer {
    // The input code string.
    private code: string;
    // The current position in the input code string.
    private position: number = 0;
    // The array of tokens generated from the input code.
    private tokens: string[] = [];

    // Constructor: Initializes the Lexer with the input code.
    constructor(code: string) {
        // Trim leading and trailing whitespace from the code.
        this.code = code.trim();
    }

    // tokenize: Main method to convert the input code into an array of tokens.
    tokenize(): string[] {
        // Loop through the code until the end is reached.
        while (this.position < this.code.length) {
            // Skip any whitespace characters (spaces, tabs, newlines).
            this.skipWhitespace();

            // If the end of the code is reached after skipping whitespace, break the loop.
            if (this.position >= this.code.length) break;

            // Get the current character at the current position.
            const char = this.code[this.position];

            // Check if the character is a bracket or brace.
            if (char === '(' || char === ')' || char === '[' || char === ']' || char === '{' || char === '}') {
                // Add the bracket/brace as a token.
                this.tokens.push(char);
                // Move to the next character.
                this.position++;
            } else if (char === '"' || char === "'") {
                // Handle string literals (enclosed in double or single quotes).
                const stringValue = this.extractString();
                // Add the string value as a token.
                this.tokens.push(stringValue);
            } else if (this.isNumeric(char) || (char === '-' && this.isNumeric(this.code[this.position + 1]))) {
                // Handle numeric literals (including negative numbers).
                const number = this.extractNumber();
                // Add the number as a token.
                this.tokens.push(number);
            } else if (this.isAlpha(char)) {
                // Handle identifiers (variable names, keywords).
                const identifier = this.extractIdentifier();
                // Add the identifier as a token.
                this.tokens.push(identifier);
            } else {
                // Skip any unknown characters.
                this.position++;
            }
        }

        // Return the array of tokens.
        return this.tokens;
    }

    // skipWhitespace: Skips whitespace characters in the input code.
    private skipWhitespace(): void {
        // Loop while the current character is a whitespace character.
        while (
            this.position < this.code.length &&
            [' ', '\t', '\n', '\r'].includes(this.code[this.position])
        ) {
            // Move to the next character.
            this.position++;
        }
    }

    // extractString: Extracts a string literal from the input code.
    private extractString(): string {
        // Get the quote character (single or double quote).
        const quote = this.code[this.position];
        // Initialize the string value with the opening quote.
        let value = quote;
        // Move past the opening quote.
        this.position++;

        // Loop until the closing quote is found or the end of the code is reached.
        while (this.position < this.code.length && this.code[this.position] !== quote) {
            // Append the current character to the string value.
            value += this.code[this.position];
            // Move to the next character.
            this.position++;
        }

        // If the closing quote is found, append it to the string value.
        if (this.position < this.code.length) {
            value += quote;
            // Move past the closing quote.
            this.position++;
        }

        // Return the extracted string value.
        return value;
    }

    // extractNumber: Extracts a numeric literal from the input code.
    private extractNumber(): string {
        // Store the starting position of the number.
        let start = this.position;

        // Handle negative numbers.
        if (this.code[this.position] === '-') {
            this.position++;
        }

        // Loop while the current character is a digit or a decimal point.
        while (
            this.position < this.code.length &&
            (this.isNumeric(this.code[this.position]) || this.code[this.position] === '.')
        ) {
            // Move to the next character.
            this.position++;
        }

        // Return the substring representing the number.
        return this.code.substring(start, this.position);
    }

    // extractIdentifier: Extracts an identifier (variable name, keyword) from the input code.
    private extractIdentifier(): string {
        // Store the starting position of the identifier.
        let start = this.position;

        // Loop while the current character is a letter, digit, or underscore.
        while (
            this.position < this.code.length &&
            (this.isAlpha(this.code[this.position]) ||
             this.isNumeric(this.code[this.position]) ||
             this.code[this.position] === '_')
        ) {
            // Move to the next character.
            this.position++;
        }

        // Return the substring representing the identifier.
        return this.code.substring(start, this.position);
    }

    // isAlpha: Checks if a character is an alphabet letter.
    private isAlpha(char: string): boolean {
        return /[a-zA-Z]/.test(char);
    }

    // isNumeric: Checks if a character is a digit.
    private isNumeric(char: string): boolean {
        return /[0-9]/.test(char);
    }
}

