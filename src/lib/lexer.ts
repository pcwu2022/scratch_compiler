// Lexer: Convert input text to tokens
export class Lexer {
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
