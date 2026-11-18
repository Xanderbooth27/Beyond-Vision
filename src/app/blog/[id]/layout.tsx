import type { Metadata } from "next";

// Each post is its own page to Google, not a copy of /blog.
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return { alternates: { canonical: `/blog/${id}` }, openGraph: { url: `/blog/${id}` } };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
