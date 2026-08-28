import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

export async function GET() {
    if (!supabase) return NextResponse.json({ error: "DB offline" }, { status: 500 });

    try {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const since = yesterday.toISOString();

        // 1. Fetch Key Stats from Yesterday
        const [ordersRes, revenueRes, automationRes, exceptionsRes] = await Promise.all([
            supabase.from('orders').select('id').gte('created_at', since),
            supabase.from('ledger_entries').select('amount').eq('entry_type', 'REVENUE').gte('created_at', since),
            supabase.from('automation_runs').select('status').gte('created_at', since),
            supabase.from('exception_log').select('id').eq('status', 'Open')
        ]);

        const orderCount = ordersRes.data?.length || 0;
        const totalRevenue = revenueRes.data?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;
        const autoSuccess = automationRes.data?.filter(r => r.status === 'EXECUTED').length || 0;
        const autoTotal = automationRes.data?.length || 1;
        const autoRate = ((autoSuccess / autoTotal) * 100).toFixed(1);
        const exceptionsCount = exceptionsRes.data?.length || 0;

        const statsContext = `
        Context for Online Bar Kenya (Yesterday):
        - Orders Processed: ${orderCount}
        - Total Revenue: KSh ${totalRevenue.toLocaleString()}
        - Automation Efficiency: ${autoRate}%
        - Active Exceptions: ${exceptionsCount}
        `;

        let aiBrief = `Good morning, David. Online Bar handled ${autoRate}% of operational events automatically yesterday. Revenue reached KSh ${totalRevenue.toLocaleString()}. You have ${exceptionsCount} exceptions needing your immediate review.`;

        if (GEMINI_API_KEY) {
            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: `You are the Online Bar AI Commander. Based on these stats, write a concise (max 40 words), tactical, and encouraging morning brief for David (the owner). Use Kenayn hospitality slang where appropriate.
                                ${statsContext}`
                            }]
                        }]
                    })
                });

                const data = await response.json();
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) aiBrief = text.trim();
            } catch (err) {
                console.error("Gemini Brief Error:", err);
            }
        }

        return NextResponse.json({
            brief: aiBrief,
            autoRate,
            exceptionsCount
        });

    } catch (err: unknown) {
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
