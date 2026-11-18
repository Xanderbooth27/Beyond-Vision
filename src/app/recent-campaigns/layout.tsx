import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta("/recent-campaigns", "Recent Creator Campaigns", "The latest brand campaigns Beyond Vision has run with TikTok and Instagram creators.");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
