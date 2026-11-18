"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { ArrowUpRight, Search } from "lucide-react";
import AmbientBackground from "@/components/AmbientBackground";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { getPageContent } from "@/lib/cms";
import { getDb } from "@/lib/firebase";
import type { BlogPost } from "@/app/admin/BlogManager";
import { staticPosts } from "@/lib/blog-static";

// Posts written into the site's code show first (and in the page Google reads);
// any from the admin's database follow.
const BUILT_IN: BlogPost[] = staticPosts.map((p) => {
  return {
    id: p.id,
    title: p.title,
    category: p.category,
    date: p.date,
    author: "Beyond Vision",
    readTime: p.readTime,
    excerpt: p.description,
    content: "",
    imageUrl: p.cover,
  };
});

export default function BlogHubPage() {
  const [posts, setPosts] = useState<BlogPost[]>(BUILT_IN);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [pageContent, setPageContent] = useState({
    library_title: "Blogs",
    library_subtitle: "INSIGHTS",
    search_placeholder: "Search blogs...",
  });

  useEffect(() => {
    getPageContent("blog").then((data) => {
      if (data) {
        setPageContent((prev) => ({
          ...prev,
          library_title: data.library_title && data.library_title !== "Deep Dive Library" ? data.library_title : "Blogs",
          library_subtitle: data.library_subtitle && data.library_subtitle !== "KNOWLEDGE_HUB" ? data.library_subtitle : "INSIGHTS",
          search_placeholder: data.search_placeholder || prev.search_placeholder,
        }));
      }
    });

    const fetchPosts = async () => {
      try {
        const q = query(collection(getDb(), "blog_posts"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as BlogPost));
        setPosts([...BUILT_IN, ...data.filter((d) => !BUILT_IN.some((b) => b.id === d.id))]);
      } catch (error) {
        console.error("Could not load blogs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const filteredPosts = useMemo(() => {
    const needle = searchQuery.trim().toLowerCase();
    if (!needle) return posts;
    return posts.filter((post) => [post.title, post.category, post.excerpt].some((value) => value?.toLowerCase().includes(needle)));
  }, [posts, searchQuery]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bv-bg-deep)", color: "#F5F5F5", position: "relative", overflow: "hidden" }}>
      <AmbientBackground />
      <Navbar />

      <main>
        <section className="section-container blog-hero" style={{ paddingTop: "10rem", paddingBottom: "3rem", position: "relative", zIndex: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "2rem", alignItems: "end", flexWrap: "wrap" }}>
            <div>
              <div className="accent-badge-text" style={{ marginBottom: "1rem" }}>{pageContent.library_subtitle}</div>
              <h1 className="title-xl" style={{ marginBottom: "1.25rem" }}>{pageContent.library_title}</h1>
              <p className="description-text" style={{ maxWidth: "720px", fontSize: "1.1rem" }}>
                Practical influencer marketing insight for brands that want strategy, trust, and measurable growth.
              </p>
            </div>
            <label className="blog-search-wrapper" style={{ width: "min(100%, 420px)", position: "relative" }}>
              <Search size={18} style={{ position: "absolute", left: "1.25rem", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.32)" }} />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={pageContent.search_placeholder}
                style={{ width: "100%", padding: "1rem 1.25rem 1rem 3.25rem", borderRadius: "999px", background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", outline: "none", fontWeight: 800 }}
              />
            </label>
          </div>
        </section>

        <section className="section-container" style={{ paddingTop: "1rem", paddingBottom: "5rem", position: "relative", zIndex: 10 }}>
          <div className="blog-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "2rem" }}>
            {filteredPosts.map((post, index) => (
              <BlogCard key={post.id || post.title} post={post} delay={index * 0.04} />
            ))}
          </div>
          {!loading && !filteredPosts.length && (
            <div style={{ textAlign: "center", padding: "5rem 1rem", color: "rgba(255,255,255,0.36)", fontWeight: 900, textTransform: "uppercase", letterSpacing: "1px" }}>
              {searchQuery ? "No blogs match that search." : "No blogs published yet."}
            </div>
          )}
        </section>
      </main>

      <Footer />

      <style jsx>{`
        @media (max-width: 900px) {
          .blog-grid {
            grid-template-columns: 1fr !important;
          }
          .blog-hero {
            padding-top: 8rem !important;
          }
        }
        @media (max-width: 640px) {
          .blog-hero {
            padding-top: 7.5rem !important;
            padding-bottom: 2rem !important;
          }
          .blog-search-wrapper {
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}

function BlogCard({ post, delay }: { post: BlogPost; delay: number }) {
  const href = post.externalUrl || `/blog/${post.id}`;

  return (
    <motion.article
      className="blog-card"
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ delay }}
      style={{ minHeight: "520px", borderRadius: "28px", overflow: "hidden", position: "relative", border: "1px solid rgba(255,255,255,0.09)", background: "rgba(255,255,255,0.03)" }}
    >
      <img src={post.imageUrl || "/spec-references/blog-cards-primary.png"} alt={post.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(8,9,10,0.96) 0%, rgba(8,9,10,0.72) 42%, rgba(8,9,10,0.16) 100%)" }} />

      <div style={{ position: "absolute", inset: 0, padding: "2rem", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
        <div style={{ display: "flex", gap: "0.8rem", alignItems: "center", flexWrap: "wrap", marginBottom: "1.4rem" }}>
          <span style={{ background: "var(--accent)", color: "#000", padding: "0.55rem 0.85rem", borderRadius: "10px", fontSize: "0.68rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.7px" }}>
            {post.category}
          </span>
        </div>
        <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", lineHeight: 0.95, letterSpacing: "-0.04em", textTransform: "uppercase", maxWidth: "760px", marginBottom: "1rem" }}>
          {post.title}
        </h2>
        <p style={{ color: "rgba(255,255,255,0.74)", lineHeight: 1.6, maxWidth: "680px", marginBottom: "1.6rem" }}>
          {post.excerpt}
        </p>
        <Link href={href} target={post.externalUrl ? "_blank" : "_self"} rel={post.externalUrl ? "noreferrer" : undefined} style={{ color: "var(--accent)", fontSize: "0.82rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "1px", display: "inline-flex", alignItems: "center", gap: "0.55rem", width: "fit-content" }}>
          Read Blog <ArrowUpRight size={17} />
        </Link>
      </div>
      <style jsx>{`
        @media (max-width: 640px) {
          .blog-card {
            min-height: 430px !important;
            border-radius: 20px !important;
          }
          .blog-card > div:last-child {
            padding: 1.25rem !important;
          }
          .blog-card h2 {
            font-size: clamp(1.45rem, 8vw, 2.2rem) !important;
          }
        }
      `}</style>
    </motion.article>
  );
}
