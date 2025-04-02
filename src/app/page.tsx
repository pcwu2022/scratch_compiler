// src/app/page.tsx

'use client';

import React, { useState } from 'react';

export default function Home() {
    const [code, setCode] = useState('');
    const [result, setResult] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleCompile = async () => {
        setLoading(true);
        setResult(null);

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
        } catch (error) {
            console.error('Error compiling:', error);
            setResult('Compilation failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
                <h1 className="text-4xl font-bold">Simple Compiler</h1>
            </div>

            <div className="flex flex-col items-center justify-center w-full">
                <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Enter your code here..."
                    className="w-full h-64 p-2 border rounded mb-4"
                />

                <button
                    onClick={handleCompile}
                    disabled={loading}
                    className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${
                        loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                    {loading ? 'Compiling...' : 'Compile'}
                </button>

                {result && (
                    <div className="mt-4 p-4 border rounded w-full">
                        <pre className="whitespace-pre-wrap">{result}</pre>
                    </div>
                )}
            </div>
        </main>
    );
}