import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const url = req.nextUrl.searchParams.get("url");
    if (!url) return NextResponse.json({ error: "Missing url" }, { status: 400 });

    try {
        const res = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`, {
            headers: { "User-Agent": "Mozilla/5.0" },
            next: { revalidate: 86400 }, // cache 24h
        });
        if (!res.ok) return NextResponse.json({ error: "oEmbed failed" }, { status: 502 });
        const data = await res.json();
        return NextResponse.json({ thumbnail: data.thumbnail_url, title: data.title });
    } catch {
        return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
    }
}
