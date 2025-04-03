'use client';

import React, { useState, useRef, useEffect } from 'react';
import Editor, { useMonaco } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import { initialCode, languageDef, languageSelector } from '@/lib/codeEditorConfig';

export default function CodeEditor() {
    const [code, setCode] = useState<string>(initialCode);
    const [result, setResult] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [compiled, setCompiled] = useState(false);
    const [running, setRunning] = useState(false);
    const [terminalOutput, setTerminalOutput] = useState('');
    const [compiledResult, setCompiledResult] = useState<string | null>(null);

    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    const monacoInstance = useMonaco();

    useEffect(() => {
        setCode(localStorage.getItem("scratchCode") ?? initialCode);
    }, []);

    useEffect(() => {
        if (monacoInstance) {
            monacoInstance.languages.register({ id: 'scratchSyntax' });
            monacoInstance.languages.setMonarchTokensProvider('scratchSyntax', languageDef);
            monacoInstance.languages.registerCompletionItemProvider('scratchSyntax', languageSelector(monacoInstance));

            // Register javascript for output highlighting
            monacoInstance.languages.register({ id: 'javascript' });
        }
    }, [monacoInstance]);

    useEffect(() => {
        if (editorRef.current) {
            editorRef.current.onDidChangeModelContent(() => {
                setCompiled(false);
                localStorage.setItem("scratchCode", code);
            });
        }
    }, [editorRef.current]);

    const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor, monaco: any) => {
        editorRef.current = editor;
        if (monacoInstance) {
            monaco.editor.setModelLanguage(editor.getModel()!, 'scratchSyntax');
        }
    };

    const runResult = async (jsCode: string) => {
        const data = await eval(`((async () => {
            const outputs = [];
            const terminalPre = document.getElementById("terminal");
            terminalPre.innerHTML = "";
            const saveOutput = (...output) => {
                for (let el of output){
                    terminalPre.innerHTML += el + "\\n";
                }
                outputs.push(...output);
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
            // setTerminalOutput('')
            setCompiledResult(data.result || null);
        } catch (error) {
            console.error('Error compiling:', error);
            setResult('Compilation failed.');
            setTerminalOutput('Compilation failed.');
        } finally {
            setLoading(false);
            setCompiled(true);
        }
    };

    const handleRun = async () => {
        if (!result){
            return;
        }
        setRunning(true);
        if (!compiled){
            await handleCompile();
            if (!result){
                return;
            }
        }
        await runResult(result);
        setRunning(false);
    };

    return (
        <div className="h-screen flex flex-col">
            <div className="bg-gray-800 p-4 flex justify-between items-center">
                <h1 className="text-white font-bold">Scratch Compiler</h1>
                <div>
                    <button
                        onClick={handleRun}
                        disabled={running}
                        className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ${
                            (running) ? 'cursor-not-allowed' : ''
                        }`}
                    >
                        {running ? 'Running...' : compiled ? '▶ Run' : '▶ Compile and Run'}
                    </button>
                    <span className='ml-4'></span>
                    <button
                        onClick={handleCompile}
                        disabled={loading}
                        className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${
                            loading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        {loading ? '⚙ Compiling...' : '⚙ Compile'}
                    </button>
                </div>
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
                        <pre id="terminal" className="text-gray-300 whitespace-pre-wrap">{terminalOutput}</pre>
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