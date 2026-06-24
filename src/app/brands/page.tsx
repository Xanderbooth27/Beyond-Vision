"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { collection, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import { ArrowUpRight, BarChart3, Camera, Megaphone, PenTool, Rocket, Search, Sparkles, Target, Users } from "lucide-react";
import AmbientBackground from "@/components/AmbientBackground";
import { BrandsTicker } from "@/components/BrandsTicker";
import { Card } from "@/components/Card";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Section } from "@/components/Section";
import { BrandsAboutMediaGrid } from "@/components/BrandsAboutMediaGrid";
import { getHomeArchiveCampaigns, type HomeCampaignCard } from "@/lib/campaign-archive";
import { getPageContent } from "@/lib/cms";
import { CLIENT_TESTIMONIALS, resolveClientTestimonials } from "@/lib/client-testimonials";
import { getDb } from "@/lib/firebase";
import {
  buildRosterCreators,
  fetchFirebaseRosterCreators,
  type PublicCreator,
} from "@/lib/roster-creators";
import { aboutStats } from "@/lib/spec-data";

type BrandService = {
  title: string;
  description: string;
  icon: string;
  href: string;
};

type BlogPreview = {
  id?: string;
  title: string;
  category?: string;
  excerpt?: string;
  imageUrl?: string;
  externalUrl?: string;
};

type Testimonial = {
  id?: string;
  name: string;
  brand: string;
  quote: string;
};

type BrandsPageContent = {
  hero_badge: string;
  hero_title: string;
  hero_text: string;
  sec1_title?: string;
  services_list?: BrandServiceInput[];
};

type BrandServiceInput = BrandService & {
  learnMore?: string;
};

const brandServices: BrandService[] = [
  {
    title: "Paid Social Advertising",
    description: "We help brands scale with data-driven campaigns built to convert.",
    icon: "target",
    href: "/contact?type=brand&service=paid-social-advertising",
  },
  {
    title: "Social Media Management",
    description: "We manage brand social channels with strategy-led content and consistent growth in mind.",
    icon: "megaphone",
    href: "/contact?type=brand&service=social-media-management",
  },
  {
    title: "UGC & Creator Content",
    description: "We create authentic, creator guided content that builds trust and drives sales for brands.",
    icon: "users",
    href: "/contact?type=brand&service=ugc-creator-content",
  },
  {
    title: "Brand Strategy",
    description: "We define how your brand shows up, who it speaks to, and how it stands out.",
    icon: "pen",
    href: "/contact?type=brand&service=brand-strategy",
  },
  {
    title: "Content Production",
    description: "High quality visuals designed specifically for brand marketing and advertising.",
    icon: "camera",
    href: "/contact?type=brand&service=content-production",
  },
  {
    title: "Growth & Performance",
    description: "We analyse results, refine strategy, and scale what works for your brand.",
    icon: "chart",
    href: "/contact?type=brand&service=growth-performance",
  },
];

type RosterCreatorCard = {
  id: string;
  creatorName: string;
  profileImageUrl: string;
  category?: string;
};

export default function BrandsPage() {
  const archiveCampaigns = useMemo(() => getHomeArchiveCampaigns(), []);
  const featuredCampaigns = useMemo(() => archiveCampaigns.slice(0, 3), [archiveCampaigns]);
  const [rosterCreators, setRosterCreators] = useState<PublicCreator[]>([]);
  const [blogs, setBlogs] = useState<BlogPreview[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(CLIENT_TESTIMONIALS);
  const [pageContent, setPageContent] = useState<BrandsPageContent>({
    hero_badge: "For Brands",
    hero_title: "Scale Your Brand With Culture, Creators, and Performance",
    hero_text: "We help brands cut through the noise with creator-led campaigns, paid social, and strategy built for measurable growth.",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const pageData = await getPageContent("brands");
        if (pageData) setPageContent((prev) => ({ ...prev, ...pageData }));

        const dbRoster = await fetchFirebaseRosterCreators();
        setRosterCreators(buildRosterCreators(dbRoster));

        const blogSnap = await getDocs(query(collection(getDb(), "blog_posts"), orderBy("createdAt", "desc"), limit(3)));
        const blogData = blogSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as BlogPreview));
        setBlogs(blogData);

        const testimonialSnap = await getDocs(query(collection(getDb(), "testimonials"), where("type", "==", "client"), limit(6)));
        const testimonialData = testimonialSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Testimonial));
        setTestimonials(resolveClientTestimonials(testimonialData));
      } catch (error) {
        console.error("Brands page fallback active:", error);
      }
    };
    fetchData();
  }, []);

  const creatorCards: RosterCreatorCard[] = useMemo(
    () =>
      rosterCreators.map((creator) => ({
        id: creator.id,
        creatorName: creator.name,
        profileImageUrl: creator.imageUrl,
        category: creator.followers,
      })),
    [rosterCreators]
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bv-bg-deep)", color: "#F5F5F5", position: "relative", overflow: "hidden" }}>
      <AmbientBackground />
      <Navbar />

      <main>
        <section className="section-container brands-hero" style={{ minHeight: "72vh", display: "grid", gridTemplateColumns: "1fr 0.9fr", alignItems: "center", gap: "4rem", paddingTop: "8rem", position: "relative", zIndex: 10 }}>
          <div>
            <div className="accent-badge" style={{ marginBottom: "2rem" }}>
              <Sparkles size={14} />
              {pageContent.hero_badge}
            </div>
            <h1 className="title-xl" style={{ marginBottom: "1.5rem" }}>{pageContent.hero_title}</h1>
            <p className="description-text" style={{ maxWidth: "760px", marginBottom: "2.5rem" }}>{pageContent.hero_text}</p>
            <Link href="/contact?type=brand">
              <button className="btn-primary">Start a Campaign <ArrowUpRight size={18} /></button>
            </Link>
          </div>
          <div className="brand-hero-media" style={{ minHeight: "460px", borderRadius: "32px", border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden", position: "relative", background: "rgba(255,255,255,0.04)" }}>
            <img src="https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=1600&auto=format&fit=crop" alt="Brand strategy workspace" style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0, opacity: 0.72 }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(8,9,10,0.78), rgba(8,9,10,0.08))" }} />
            <div className="brand-hero-metrics" style={{ position: "absolute", left: "2rem", right: "2rem", bottom: "2rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <MiniMetric value="500+" label="Brand Partners" />
              <MiniMetric value="1BN+" label="Creator Reach" />
            </div>
          </div>
        </section>

        <Section title={pageContent.sec1_title || "What we do"} subtitle="Brand growth">
          <div className="brand-services-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "1.5rem" }}>
            {getBrandServices(pageContent.services_list).map((service) => (
              <BrandServiceCard key={service.title} service={service} />
            ))}
          </div>
        </Section>

        <Section title="Brands we work with" subtitle="Partner ecosystem">
          <BrandsTicker />
        </Section>

        <Section title="About Beyond Vision" subtitle="Agency">
          <div className="brand-about-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", alignItems: "stretch" }}>
            <Card padding="3.5rem" hover={false}>
              <p style={{ fontSize: "clamp(1.2rem, 2.4vw, 1.8rem)", lineHeight: 1.32, fontWeight: 900, color: "#fff", marginBottom: "2rem" }}>
                A social first agency connecting brands with culture, creators, and growth.
              </p>
              <p className="description-text" style={{ marginBottom: "1.5rem" }}>
                Beyond Vision is a Gen-Z led agency built for brands that want to win attention online. Since 2022, we have paid out over £4 million to creators, partnered with 500+ brands, and built a network of 1,000+ vetted creators reaching a combined audience of over 1 billion followers.
              </p>
              <p className="description-text" style={{ marginBottom: "2rem" }}>
                We combine creator content, paid social, and performance marketing to help brands scale with authenticity and impact.
              </p>
              <Link href="/about-us" style={{ color: "var(--accent)", fontWeight: 900, textTransform: "uppercase", fontSize: "0.82rem", display: "inline-flex", gap: "0.55rem", alignItems: "center" }}>
                Learn More About Us <ArrowUpRight size={16} />
              </Link>
            </Card>
            <BrandsAboutMediaGrid
              campaigns={archiveCampaigns}
              creators={rosterCreators}
              stats={aboutStats}
            />
          </div>
        </Section>

        <Section title="Recent campaigns" subtitle="Recent work" onViewMore={() => { window.location.href = "/recent-campaigns"; }}>
          <p className="description-text" style={{ marginBottom: "2rem" }}>Check out a few of our recent campaigns.</p>
          <div className="brand-card-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "1.5rem" }}>
            {featuredCampaigns.map((campaign) => (
              <Card key={campaign.id} padding="0" style={{ overflow: "hidden" }}>
                <img src={campaign.thumbnail} alt={`${campaign.brand} campaign`} style={{ width: "100%", aspectRatio: "4 / 3", objectFit: "cover" }} />
                <div style={{ padding: "1.5rem" }}>
                  <h3 style={{ textTransform: "uppercase", fontSize: "1.1rem", marginBottom: "0.5rem" }}>{campaign.brand} x {campaign.influencer}</h3>
                  <p style={{ color: "var(--accent)", fontSize: "0.72rem", fontWeight: 900, textTransform: "uppercase" }}>{campaign.month} {campaign.year}</p>
                </div>
              </Card>
            ))}
            {!featuredCampaigns.length && <EmptyCard text="Campaigns are being prepared for publication." />}
          </div>
        </Section>

        <Section title="Featured creators" subtitle="Roster preview" onViewMore={() => { window.location.href = "/roster"; }}>
          <div className="brand-card-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "1.5rem" }}>
            {creatorCards.slice(0, 8).map((creator) => (
              <Card key={creator.id} padding="1rem" style={{ textAlign: "center" }}>
                <img src={creator.profileImageUrl} alt={creator.creatorName} style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: "18px", marginBottom: "1rem" }} />
                <h3 style={{ fontSize: "0.95rem", textTransform: "uppercase" }}>{creator.creatorName}</h3>
                <p style={{ color: "var(--accent)", fontSize: "0.68rem", fontWeight: 900, textTransform: "uppercase", marginTop: "0.35rem" }}>{creator.category}</p>
              </Card>
            ))}
            {!creatorCards.length && <EmptyCard text="Talent previews are coming soon." />}
          </div>
        </Section>

        <Section title="Case studies" subtitle="Deep dives" onViewMore={() => { window.location.href = "/case-studies"; }}>
          <Card padding="3rem" hover={false} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "2rem", alignItems: "center" }} className="case-study-band">
            <div>
              <h3 style={{ fontSize: "clamp(1.8rem, 4vw, 3.5rem)", lineHeight: 0.95, textTransform: "uppercase", letterSpacing: "-0.04em", marginBottom: "1rem" }}>See the campaigns behind the results</h3>
              <p className="description-text" style={{ maxWidth: "720px" }}>A closer look at creator strategy, campaign data, and performance-led brand growth.</p>
            </div>
            <Link href="/case-studies"><button className="btn-primary">View Case Studies <ArrowUpRight size={18} /></button></Link>
          </Card>
        </Section>

        <Section title="Client testimonials" subtitle="Social proof">
          <div className="brand-card-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "1.5rem", alignItems: "stretch" }}>
            {testimonials.map((testimonial) => (
              <Card
                key={`${testimonial.name}-${testimonial.brand}`}
                padding="2rem"
                hover={false}
                style={{ height: "100%", display: "flex", flexDirection: "column" }}
              >
                <p style={{ color: "rgba(255,255,255,0.72)", lineHeight: 1.65, margin: "0 0 2rem", flex: 1 }}>&quot;{testimonial.quote}&quot;</p>
                <div style={{ marginTop: "auto", flexShrink: 0 }}>
                  <h3 style={{ fontSize: "0.85rem", textTransform: "uppercase", marginBottom: "0.35rem" }}>{testimonial.name}</h3>
                  <p style={{ color: "var(--accent)", fontSize: "0.72rem", fontWeight: 900, textTransform: "uppercase", margin: 0 }}>{testimonial.brand}</p>
                </div>
              </Card>
            ))}
          </div>
        </Section>

        <Section title="Recent blogs" subtitle="Insights" onViewMore={() => { window.location.href = "/blogs"; }}>
          <p className="description-text" style={{ marginBottom: "2rem" }}>Check out some of our recent blogs.</p>
          <div className="brand-card-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "1.5rem" }}>
            {blogs.slice(0, 3).map((blog) => (
              <Card key={blog.id || blog.title} padding="0" style={{ overflow: "hidden" }}>
                <img src={blog.imageUrl || "/spec-references/blog-cards-primary.png"} alt={blog.title} style={{ width: "100%", aspectRatio: "4 / 3", objectFit: "cover" }} />
                <div style={{ padding: "1.5rem" }}>
                  <p style={{ color: "var(--accent)", fontSize: "0.68rem", fontWeight: 900, textTransform: "uppercase", marginBottom: "0.7rem" }}>{blog.category || "Blog"}</p>
                  <h3 style={{ fontSize: "1.05rem", textTransform: "uppercase", lineHeight: 1.15, marginBottom: "1rem" }}>{blog.title}</h3>
                  <Link href={blog.externalUrl || (blog.id ? `/blog/${blog.id}` : "/blogs")} style={{ color: "var(--accent)", fontSize: "0.76rem", fontWeight: 900, textTransform: "uppercase" }}>Read Blog //</Link>
                </div>
              </Card>
            ))}
          </div>
        </Section>

        <section className="section-container" style={{ paddingTop: 0, paddingBottom: "5rem" }}>
          <Card padding="3rem" hover={false} style={{ display: "flex", justifyContent: "space-between", gap: "2rem", alignItems: "center", flexWrap: "wrap" }}>
            <div>
              <div className="accent-badge-text" style={{ marginBottom: "1rem" }}>CONTACT US</div>
              <h2 style={{ fontSize: "clamp(2rem, 5vw, 4rem)", lineHeight: 0.95, textTransform: "uppercase", letterSpacing: "-0.04em" }}>Let&apos;s Connect!</h2>
            </div>
            <Link href="/contact?type=brand"><button className="btn-primary">Contact Us <ArrowUpRight size={18} /></button></Link>
          </Card>
        </section>
      </main>

      <Footer />

      <style jsx>{`
        @media (max-width: 1024px) {
          .brands-hero,
          .brand-about-grid,
          .case-study-band {
            grid-template-columns: 1fr !important;
          }
          .brand-services-grid,
          .brand-card-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }

        @media (max-width: 640px) {
          .brands-hero {
            min-height: auto !important;
            padding-top: 8rem !important;
            gap: 2rem !important;
          }
          .brand-services-grid,
          .brand-card-grid {
            grid-template-columns: 1fr !important;
          }
          .brand-hero-media {
            min-height: 340px !important;
            border-radius: 22px !important;
          }
          .brand-hero-metrics {
            left: 1rem !important;
            right: 1rem !important;
            bottom: 1rem !important;
            gap: 0.65rem !important;
          }
          .case-study-band {
            padding: 1.5rem !important;
          }
        }
      `}</style>
    </div>
  );
}

function BrandServiceCard({ service }: { service: BrandService }) {
  return (
    <Card padding="2rem" style={{ display: "flex", flexDirection: "column", minHeight: "290px" }}>
      <div style={{ color: "var(--accent)", background: "rgba(255,246,117,0.06)", width: "fit-content", padding: "0.9rem", borderRadius: "14px", marginBottom: "1.5rem" }}>
        {renderIcon(service.icon)}
      </div>
      <h3 style={{ fontSize: "1.35rem", textTransform: "uppercase", lineHeight: 1.05, marginBottom: "1rem" }}>{service.title}</h3>
      <p className="description-text" style={{ fontSize: "0.95rem", marginBottom: "1.5rem" }}>{service.description}</p>
      <Link href={service.href} style={{ marginTop: "auto", color: "var(--accent)", fontWeight: 900, fontSize: "0.78rem", textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: "0.45rem" }}>
        Learn More <ArrowUpRight size={15} />
      </Link>
    </Card>
  );
}

function MiniMetric({ value, label }: { value: string; label: string }) {
  return (
    <div style={{ padding: "1.1rem", borderRadius: "18px", background: "rgba(0,0,0,0.45)", border: "1px solid rgba(255,255,255,0.1)" }}>
      <div style={{ color: "var(--accent)", fontWeight: 900, fontSize: "1.45rem" }}>{value}</div>
      <div style={{ color: "rgba(255,255,255,0.62)", fontSize: "0.68rem", fontWeight: 900, textTransform: "uppercase", marginTop: "0.35rem" }}>{label}</div>
    </div>
  );
}

function EmptyCard({ text }: { text: string }) {
  return (
    <Card padding="2rem" hover={false}>
      <p className="description-text">{text}</p>
    </Card>
  );
}

function renderIcon(icon: string) {
  const props = { size: 28, strokeWidth: 2.4 };
  switch (icon) {
    case "target":
      return <Target {...props} />;
    case "megaphone":
      return <Megaphone {...props} />;
    case "users":
      return <Users {...props} />;
    case "pen":
      return <PenTool {...props} />;
    case "camera":
      return <Camera {...props} />;
    case "chart":
      return <BarChart3 {...props} />;
    default:
      return <Rocket {...props} />;
  }
}

function getBrandServices(servicesList?: BrandServiceInput[]) {
  if (!Array.isArray(servicesList) || !servicesList.length) return brandServices;

  const hasBrandGrowthServices = servicesList.some((service) => service.title === "Paid Social Advertising");
  if (!hasBrandGrowthServices) return brandServices;

  return servicesList.map((service, index) => ({
    ...brandServices[index % brandServices.length],
    ...service,
    href: service.href || service.learnMore || brandServices[index % brandServices.length].href,
    icon: service.icon || brandServices[index % brandServices.length].icon,
  }));
}
