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

export const blockTypeMap: Record<string, BlockType> = {
    // Events
    'when': 'event', 'broadcast': 'event', 'receive': 'event',
    // Motion
    'move': 'motion', 'turn': 'motion', 'goto': 'motion', 
    'glide': 'motion', 'point': 'motion', 'direction': 'motion',
    // Looks
    'say': 'looks', 'think': 'looks', 'show': 'looks', 
    'hide': 'looks', 'switch': 'looks',
    // Sound
    'play': 'sound', 'stop': 'sound',
    // Control
    'wait': 'control', 'repeat': 'control', 'forever': 'control', 
    'if': 'control', 'else': 'control', 'until': 'control', 'while': 'control',
    // Sensing
    'ask': 'sensing', 'touching': 'sensing', 'key': 'sensing', 'mouse': 'sensing',
    // Variables
    'set': 'variables', 'change': 'variables',
    // Operators
    'join': 'operators', 'letter': 'operators', 'mod': 'operators',
    'round': 'operators', 'abs': 'operators', 'sqrt': 'operators',
    // Pen
    'pen': 'pen', 'stamp': 'pen'
};