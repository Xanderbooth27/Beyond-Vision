import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta("/contact", "Contact Us", "Get in touch with Beyond Vision to run a creator campaign or to join our roster of TikTok and Instagram creators.");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
