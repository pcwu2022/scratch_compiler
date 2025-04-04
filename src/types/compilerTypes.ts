// Types for our compiler
type BlockType = 'event' | 'motion' | 'looks' | 'sound' | 'control' | 'sensing' | 'operators' | 'variables' | 'custom' | 'pen';

// Lexer Types
export enum TokenType {
    IDENTIFIER = 'IDENTIFIER',
    STRING = 'STRING',
    NUMBER = 'NUMBER',
    KEYWORD = 'KEYWORD',
    OPERATOR = 'OPERATOR',
    PARENTHESIS_OPEN = 'PARENTHESIS_OPEN',
    PARENTHESIS_CLOSE = 'PARENTHESIS_CLOSE',
    BRACKET_OPEN = 'BRACKET_OPEN',
    BRACKET_CLOSE = 'BRACKET_CLOSE',
    BRACE_OPEN = 'BRACE_OPEN',
    BRACE_CLOSE = 'BRACE_CLOSE',
    COLON = 'COLON',
    COMMA = 'COMMA',
    INDENT = 'INDENT',
    DEDENT = 'DEDENT',
    NEWLINE = 'NEWLINE',
    COMMENT = 'COMMENT',
    EOF = 'EOF'
}

export interface Token {
    type: TokenType;
    value: string;
    line: number;
    column: number;
}

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

export type {
    BlockType,
    BlockNode,
    Script,
    Program
}