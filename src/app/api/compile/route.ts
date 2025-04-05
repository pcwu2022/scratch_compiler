// src/app/api/compile/route.ts

import { NextResponse } from "next/server";
import { compile } from "@/lib/compiler";

export async function POST(request: Request) {
    try {
        const { code } = await request.json();
        const compilationResult = await compile(code);

        if ("error" in compilationResult) {
            return NextResponse.json({ error: compilationResult.error }, { status: 500 });
        }

        return NextResponse.json({
            js: compilationResult.js,
            html: compilationResult.html,
        });
    } catch (error) {
        console.error("Error in API route:", error);
        return NextResponse.json({ error: "API route failed." }, { status: 500 });
    }
}
