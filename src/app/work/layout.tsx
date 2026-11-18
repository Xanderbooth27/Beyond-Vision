import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta("/work", "Our Work", "Social-first creator campaigns delivered by Beyond Vision for brands on TikTok and Instagram.");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
