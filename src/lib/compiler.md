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

# Syntax List

## Variable and List Operations

| Syntax | Description |
|--------|-------------|
| `var name = value` | Declares a new variable with an initial value. |
| `var name` | Declares a new variable with default value 0. |
| `list name [item1, item2, ...]` | Creates a new list with initial values. |
| `list name` | Creates a new empty list. |
| `set name = value` | Sets a variable to a specific value. |
| `change name value` | Increases a variable by the specified amount. |

## Events

| Syntax | Description |
|--------|-------------|
| `when flagClicked` | Executes the following blocks when the green flag is clicked. |
| `when keyPressed KeyName` | Executes the following blocks when a specific key is pressed. |

## Motion

| Syntax | Description |
|--------|-------------|
| `move steps` | Moves the sprite forward by the specified number of steps in its current direction. |

## Looks

| Syntax | Description |
|--------|-------------|
| `say "message"` | Makes the sprite display a speech bubble with the specified message. |
| `say "message" seconds` | Makes the sprite display a speech bubble for the specified duration in seconds. |

## Control

| Syntax | Description |
|--------|-------------|
| `wait seconds` | Pauses execution for the specified number of seconds. |
| `repeat count` | Repeats the enclosed blocks a specific number of times. |
| `if condition` | Executes the enclosed blocks only if the condition is true. |

## Operators

| Syntax | Description |
|--------|-------------|
| `(expression)` | Evaluates a mathematical or logical expression like `(x + y)` or `(score > 10)`. |
| `+` | Addition operator used in expressions. |
| `-` | Subtraction operator used in expressions. |
| `*` | Multiplication operator used in expressions. |
| `/` | Division operator used in expressions. |
| `>` | Greater than comparison operator. |
| `<` | Less than comparison operator. |
| `=` | Equality comparison operator. |

## Structure

| Syntax | Description |
|--------|-------------|
| Indentation | Indicates block nesting, with each level of indentation representing blocks inside control structures. |
| Sequential blocks | Blocks written one after another are executed in sequence. |

## Examples

```
when flagClicked
  say "Hello"
  wait 1
```
This script displays "Hello" when the green flag is clicked, then waits for 1 second.

```
when keyPressed Space
  if (score > 10)
    say "Good job!"
```
This script displays "Good job!" when the space key is pressed, but only if the score is greater than 10.

```
when flagClicked
  repeat 4
    move 100
    wait 0.5
```
This script makes the sprite move in four 100-step movements with half-second pauses between each movement.