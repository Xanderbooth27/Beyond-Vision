import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta("/case-studies", "Influencer Campaign Case Studies", "Real creator campaigns run by Beyond Vision, with the views, engagement and results each brand got from TikTok and Instagram creators.");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
