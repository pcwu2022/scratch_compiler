import { languages } from "monaco-editor"
import * as monaco from 'monaco-editor';

export const languageDef: languages.IMonarchLanguage = {
    tokenizer: {
        root: [
            // Keywords
            [/when|move|turn|say|wait|repeat|if|else|set|change|list|var/, 'keyword.scratch'],

            // Events
            [/flagClicked|keyPressed/, 'keyword.scratch.event'],

            // Motion
            [/move|turn/, 'keyword.scratch.motion'],

            // Looks
            [/say/, 'keyword.scratch.looks'],

            // Control
            [/wait|repeat|if|else/, 'keyword.scratch.control'],

            // Variables and Lists
            [/var|list|set|change/, 'keyword.scratch.variables'],

            // Operators
            [/\+|\-|\*|\/|>|<|=/, 'operators.scratch'],

            // Numbers
            [/\d+(\.\d+)?/, 'number'],

            // Strings
            [/"([^"]*)"/, 'string'],
            [/'([^']*)'/, 'string'],

            // Identifiers (variable and list names)
            [/[a-zA-Z_][a-zA-Z0-9_]*/, 'identifier'],

            // Parentheses and brackets
            [/\(|\)/, 'delimiter.parenthesis'],
            [/\[|\]/, 'delimiter.bracket'],

            // Whitespace (ignore)
            [/\s+/, 'white'],
        ],
    },
}

export const languageSelector = (monacoInstance: typeof monaco): languages.CompletionItemProvider => { 
    return {
        provideCompletionItems: (model, position) => {
            const word = model.getWordUntilPosition(position);
            const range = {
                startLineNumber: position.lineNumber,
                startColumn: word.startColumn,
                endLineNumber: position.lineNumber,
                endColumn: word.endColumn,
            };
            const suggestions = [
                // Keywords
                { label: 'when', kind: monacoInstance.languages.CompletionItemKind.Keyword, insertText: 'when ', range: range },
                { label: 'move', kind: monacoInstance.languages.CompletionItemKind.Keyword, insertText: 'move ', range: range },
                { label: 'turn', kind: monacoInstance.languages.CompletionItemKind.Keyword, insertText: 'turn ', range: range },
                { label: 'say', kind: monacoInstance.languages.CompletionItemKind.Keyword, insertText: 'say ', range: range },
                { label: 'wait', kind: monacoInstance.languages.CompletionItemKind.Keyword, insertText: 'wait ', range: range },
                { label: 'repeat', kind: monacoInstance.languages.CompletionItemKind.Keyword, insertText: 'repeat ', range: range },
                { label: 'if', kind: monacoInstance.languages.CompletionItemKind.Keyword, insertText: 'if ', range: range },
                { label: 'else', kind: monacoInstance.languages.CompletionItemKind.Keyword, insertText: 'else ', range: range },
                { label: 'set', kind: monacoInstance.languages.CompletionItemKind.Keyword, insertText: 'set ', range: range },
                { label: 'change', kind: monacoInstance.languages.CompletionItemKind.Keyword, insertText: 'change ', range: range },
                { label: 'list', kind: monacoInstance.languages.CompletionItemKind.Keyword, insertText: 'list ', range: range },
                { label: 'var', kind: monacoInstance.languages.CompletionItemKind.Keyword, insertText: 'var ', range: range },

                // Events
                { label: 'flagClicked', kind: monacoInstance.languages.CompletionItemKind.Keyword, insertText: 'flagClicked', range: range },
                { label: 'keyPressed', kind: monacoInstance.languages.CompletionItemKind.Keyword, insertText: 'keyPressed ', range: range },

                // Motion
                { label: 'move', kind: monacoInstance.languages.CompletionItemKind.Keyword, insertText: 'move ', range: range },
                { label: 'turn', kind: monacoInstance.languages.CompletionItemKind.Keyword, insertText: 'turn ', range: range },

                // Looks
                { label: 'say', kind: monacoInstance.languages.CompletionItemKind.Keyword, insertText: 'say ', range: range },

                // Control
                { label: 'wait', kind: monacoInstance.languages.CompletionItemKind.Keyword, insertText: 'wait ', range: range },
                { label: 'repeat', kind: monacoInstance.languages.CompletionItemKind.Keyword, insertText: 'repeat ', range: range },
                { label: 'if', kind: monacoInstance.languages.CompletionItemKind.Keyword, insertText: 'if ', range: range },
                { label: 'else', kind: monacoInstance.languages.CompletionItemKind.Keyword, insertText: 'else ', range: range },

                // Variables and Lists
                { label: 'var', kind: monacoInstance.languages.CompletionItemKind.Keyword, insertText: 'var ', range: range },
                { label: 'list', kind: monacoInstance.languages.CompletionItemKind.Keyword, insertText: 'list ', range: range },
                { label: 'set', kind: monacoInstance.languages.CompletionItemKind.Keyword, insertText: 'set ', range: range },
                { label: 'change', kind: monacoInstance.languages.CompletionItemKind.Keyword, insertText: 'change ', range: range },

                //Operators
                { label: '+', kind: monacoInstance.languages.CompletionItemKind.Operator, insertText: '+', range: range},
                { label: '-', kind: monacoInstance.languages.CompletionItemKind.Operator, insertText: '-', range: range},
                { label: '*', kind: monacoInstance.languages.CompletionItemKind.Operator, insertText: '*', range: range},
                { label: '/', kind: monacoInstance.languages.CompletionItemKind.Operator, insertText: '/', range: range},
                { label: '>', kind: monacoInstance.languages.CompletionItemKind.Operator, insertText: '>', range: range},
                { label: '<', kind: monacoInstance.languages.CompletionItemKind.Operator, insertText: '<', range: range},
                { label: '=', kind: monacoInstance.languages.CompletionItemKind.Operator, insertText: '=', range: range},
            ];

            return { suggestions: suggestions };
        },
    }
}

export const initialCode = `when flagClicked
    repeat 4
    move 10
    wait 10
`;