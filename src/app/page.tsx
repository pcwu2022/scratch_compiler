'use client';

import React, { useState, useRef, useEffect } from 'react';
import Editor, { useMonaco } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';

export default function Home() {
    const [code, setCode] = useState('');
    const [result, setResult] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [terminalOutput, setTerminalOutput] = useState('');
    const [compiledResult, setCompiledResult] = useState<string | null>(null);

    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    const monacoInstance = useMonaco();

    useEffect(() => {
        if (monacoInstance) {
            monacoInstance.languages.register({ id: 'scratchSyntax' });
            monacoInstance.languages.setMonarchTokensProvider('scratchSyntax', {
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
            });
            
            monacoInstance.languages.registerCompletionItemProvider('scratchSyntax', {
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
            });

            // Register javascript for output highlighting
            monacoInstance.languages.register({ id: 'javascript' });
        }
    }, [monacoInstance]);

    const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor, monaco: any) => {
        editorRef.current = editor;
        if (monacoInstance) {
            monaco.editor.setModelLanguage(editor.getModel()!, 'scratchSyntax');
        }
    };

    const runResult = async (jsCode: string) => {
        const data = await eval(`((async () => {
            const outputs = [];
            const saveOutput = (...output) => {
                outputs.push(...output)
            }
            ${jsCode.replaceAll("console.log(", "saveOutput(")}
            const returnOutputs = [];
            for (let output of outputs){
                returnOutputs.push((typeof(output) === "string") ? output : JSON.stringify(output))
            }
            return returnOutputs;
        })()).then((data) => JSON.stringify(data)).catch((error) => {console.error(error)})`);   
        
        setTerminalOutput(JSON.parse(data).join("\n"));
        
    }

    const handleCompile = async () => {
        setLoading(true);
        setResult(null);
        setTerminalOutput('');
        setCompiledResult(null);

        try {
            const response = await fetch('/api/compile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code }),
            });

            if (!response.ok) {
                throw new Error('Failed to compile');
            }

            const data = await response.json();
            setResult(data.result);
            await runResult(data.result);
            // setTerminalOutput('')
            setCompiledResult(data.result || null);
        } catch (error) {
            console.error('Error compiling:', error);
            setResult('Compilation failed.');
            setTerminalOutput('Compilation failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen flex flex-col">
            <div className="bg-gray-800 p-4 flex justify-between items-center">
                <h1 className="text-white font-bold">Scratch Compiler</h1>
                <button
                    onClick={handleCompile}
                    disabled={loading}
                    className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${
                        loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                    {loading ? 'Compiling...' : 'Compile'}
                </button>
            </div>

            <div className="flex flex-1">
                <div className="bg-gray-700 w-48 p-4 flex flex-col">
                    <button className="bg-gray-600 hover:bg-gray-500 text-white p-2 rounded mb-2">File</button>
                    <button className="bg-gray-600 hover:bg-gray-500 text-white p-2 rounded mb-2">Edit</button>
                    <button className="bg-gray-600 hover:bg-gray-500 text-white p-2 rounded mb-2">View</button>
                </div>

                <div className="flex-1 flex flex-col">
                    <div className="flex-1">
                        <Editor
                            width="100%"
                            height="100%"
                            language="scratchSyntax"
                            theme="vs-dark"
                            value={code}
                            options={{
                                selectOnLineNumbers: true,
                                roundedSelection: false,
                                readOnly: false,
                                cursorStyle: 'line',
                                automaticLayout: true,
                            }}
                            onChange={(value) => setCode(value || '')}
                            onMount={handleEditorDidMount}
                        />
                    </div>

                    <div className="bg-gray-800 p-4">
                        <h2 className="text-white font-bold">Terminal Output</h2>
                        <pre className="text-gray-300 whitespace-pre-wrap">{terminalOutput}</pre>
                    </div>
                    {compiledResult && (
                        <div className="bg-gray-900 p-4">
                            <h2 className="text-white font-bold">Result</h2>
                            <div className="border p-2 rounded">
                                <Editor
                                    width="100%"
                                    height="300px"
                                    language="javascript" // Highlight as javascript
                                    theme="vs-dark"
                                    value={compiledResult}
                                    options={{
                                        readOnly: true,
                                        automaticLayout: true,
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}