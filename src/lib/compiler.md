# Text-Based Scratch Compiler Documentation

## Overview
The Text-Based Scratch Compiler converts Scratch-like syntax written in text form into executable JavaScript code. It provides a way to write Scratch programs using text rather than the drag-and-drop visual interface, while maintaining Scratch's approachable syntax and semantics.

## Core Components

### ScratchTextCompiler
Main compiler class that orchestrates the compilation process.

**Methods:**
- `compile(code: string): string` - Compiles text-based Scratch code to JavaScript

### Lexer
Converts input text to tokens for parsing.

**Constructor:**
- `constructor(code: string)` - Initializes with source code

**Methods:**
- `tokenize(): string[]` - Transforms input text into array of tokens
- Various private helper methods for extracting strings, numbers, identifiers

### Parser
Converts tokens into an Abstract Syntax Tree (AST).

**Constructor:**
- `constructor(tokens: string[])` - Initializes with tokens from lexer

**Methods:**
- `parse(): Program` - Parses tokens into a Program structure
- Various private helper methods for parsing blocks, scripts, variable declarations

### CodeGenerator
Converts the AST to JavaScript code.

**Constructor:**
- `constructor(program: Program)` - Initializes with parsed program

**Methods:**
- `generate(): string` - Generates JavaScript from the program
- Various private block-specific code generation methods

## Data Types

### BlockType
Enum representing different categories of Scratch blocks:
```typescript
type BlockType = 'event' | 'motion' | 'looks' | 'sound' | 'control' | 'sensing' | 'operators' | 'variables' | 'custom';
```

### BlockNode
Represents a single Scratch block:
```typescript
interface BlockNode {
  type: BlockType;
  name: string;
  args: (string | number | BlockNode)[];
  next?: BlockNode;
}
```

### Script
Collection of blocks that form a script:
```typescript
interface Script {
  blocks: BlockNode[];
}
```

### Program
Complete program with scripts, variables, and lists:
```typescript
interface Program {
  scripts: Script[];
  variables: Map<string, any>;
  lists: Map<string, any[]>;
}
```

## Supported Syntax

### Variables & Lists
```
var variableName = initialValue
list listName [item1, item2, item3]
```

### Events
```
when flagClicked
when keyPressed Space
```

### Motion
```
move steps
```

### Looks
```
say "message"
say "message" for seconds
```

### Control
```
wait seconds
repeat count
  blocks...
if condition
  blocks...
```

### Variables Operations
```
set variableName = value
change variableName by value
```

### Expressions
```
(x + y * 10)
```

## Runtime Support

The compiler includes a runtime support object that simulates core Scratch functionality:

- Sprite management
- Stage dimensions
- Movement
- Text display
- Basic animation

## Usage Example

```typescript
import { ScratchTextCompiler } from './scratch-text-compiler';

const compiler = new ScratchTextCompiler();
const scratchCode = `
when flagClicked
  say "Hello World"
`;
const jsCode = compiler.compile(scratchCode);
```

## Limitations

- Limited subset of Scratch functionality
- No direct support for custom blocks
- Basic expression parsing
- No support for graphical elements, only console output
- Simplified sprite system with basic movement

## Extension Points

- Add support for additional Scratch blocks
- Enhance expression parsing
- Add support for multiple sprites
- Implement graphics rendering
- Add support for more Scratch events