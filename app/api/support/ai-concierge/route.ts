import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

export async function POST(request: Request) {
    try {
        const { message } = await request.json();

        if (!message) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        if (!GEMINI_API_KEY) {
            return NextResponse.json({
                response: "Hello! I'm currently offline while the team restocks the cellar. I'll be back soon with more premium drink advice! 🍷"
            }, { status: 200 }); // Return 200 with a graceful message instead of 500
        }

        // 1. Fetch current inventory context for the AI
        let productsContext = "Here is our current menu at Online Bar Kenya:\n";
        if (supabase) {
            const { data: products } = await supabase.from('products').select('id, name, price, category, description, stock');
            if (products) {
                products.forEach(p => {
                    productsContext += `- ${p.name} (${p.category}): Ksh ${p.price}. ${p.stock > 0 ? 'Available' : 'Restocking'}. ${p.description?.substring(0, 50)}...\n`;
                });
            }
        }

        // 2. Query Gemini
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [{
                            text: `You are the Mixology AI Concierge for Online Bar Kenya.
                            Your goal is to help patrons find the best wine, spirits, and late-night snacks.
                            Be professional, friendly, and use Kenyan hospitality language (like "chilled one", "vibe") where appropriate. Do not use slang.

                            Context:
                            ${productsContext}

                            Instructions:
                            - Suggest specific drinks or snacks from the menu above based on their occasion.
                            - If something is restocking, mention it but suggest an alternative beverage.
                            - Always include the price in Ksh.
                            - Keep responses concise and focused on sales and flavor profiles.
                            - If you mention a product, provide its ID like [PROD-ID] so the UI can link to it.

                            User Question: ${message}`
                        }]
                    }
                ]
            })
        });

        const data = await response.json();
        const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (aiResponse) {
            return NextResponse.json({ response: aiResponse.trim() });
        } else {
            throw new Error("AI failed to generate a response.");
        }

    } catch (error: unknown) {
        console.error("AI Concierge Error:", error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
