import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta("/blog", "Blog: Creator Marketing Insights", "Creator marketing insights from Beyond Vision: influencer rates, TikTok campaign tips and what is working for brands right now.");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
