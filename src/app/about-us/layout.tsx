import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta("/about-us", "About Us: UK Creator Management Agency", "Beyond Vision is a UK creator management agency connecting brands with TikTok and Instagram creators. Meet the team and how we work.");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
