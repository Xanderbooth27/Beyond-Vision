"use client";

import { useState, useEffect } from "react";
import { getDb } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import AmbientBackground from "@/components/AmbientBackground";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, User, Tag } from "lucide-react";
import Link from "next/link";
import { BlogPost } from "@/app/admin/BlogManager";

export default function BlogPostDetail() {
    const { id } = useParams();
    const [post, setPost] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            if (!id) return;
            try {
                const docRef = doc(getDb(), "blog_posts", id as string);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setPost({ id: docSnap.id, ...docSnap.data() } as BlogPost);
                }
            } catch (error) {
                console.error("Error fetching post:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [id]);

    if (loading) return (
        <div style={{ minHeight: "100vh", background: "var(--bv-bg-deep)", display: "flex", alignItems: "center", justifyContent: "center" }}>
             <p style={{ color: "var(--accent)", fontWeight: 900 }}>EXTRACTING_DATA...</p>
        </div>
    );

    if (!post) return (
        <div style={{ minHeight: "100vh", background: "var(--bv-bg-deep)", display: "flex", alignItems: "center", justifyContent: "center" }}>
             <p style={{ color: "#fff" }}>ARTICLE_NOT_FOUND</p>
        </div>
    );

    return (
        <div style={{ minHeight: "100vh", background: "var(--bv-bg-deep)", color: "#F5F5F5", position: "relative" }}>
            <AmbientBackground />
            <Navbar />

            <article className="blog-detail-article" style={{ maxWidth: "1000px", margin: "0 auto", padding: "10rem 2rem 8rem", position: "relative", zIndex: 10 }}>
                
                <Link href="/blog" style={{ display: "inline-flex", alignItems: "center", gap: "0.8rem", color: "rgba(255,255,255,0.4)", fontSize: "0.8rem", fontWeight: 800, textTransform: "uppercase", marginBottom: "4rem" }}>
                    <ArrowLeft size={16} /> Back to Library
                </Link>

                <div className="blog-detail-header" style={{ marginBottom: "6rem" }}>
                    <div className="blog-detail-meta" style={{ display: "flex", gap: "1.5rem", fontSize: "0.75rem", color: "var(--accent)", fontWeight: 900, textTransform: "uppercase", letterSpacing: "2px", marginBottom: "2rem" }}>
                        <span>{post.category}</span>
                        <span>•</span>
                        <span>{post.date}</span>
                    </div>
                    
                    <h1 style={{ fontSize: "5rem", fontWeight: 900, lineHeight: 1, textTransform: "uppercase", letterSpacing: "-0.04em", marginBottom: "4rem" }}>
                        {post.title}
                    </h1>

                    <div className="blog-detail-byline" style={{ display: "flex", gap: "3rem", paddingBottom: "3rem", borderBottom: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)", fontSize: "0.85rem", fontWeight: 700 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                             <User size={16} /> {post.author}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                             <Clock size={16} /> {post.readTime}
                        </div>
                    </div>
                </div>

                <div className="blog-detail-image" style={{ width: "100%", borderRadius: "40px", overflow: "hidden", marginBottom: "6rem", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <img src={post.imageUrl} alt={post.title} style={{ width: "100%", maxHeight: "700px", objectFit: "cover" }} />
                </div>

                <div className="blog-content" style={{ fontSize: "1.2rem", lineHeight: 1.8, color: "rgba(255,255,255,0.85)", whiteSpace: "pre-wrap" }}>
                     {post.content}
                </div>

                {post.externalUrl && (
                    <div className="blog-detail-external" style={{ marginTop: "6rem", padding: "4rem", borderRadius: "32px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", textAlign: "center" }}>
                        <h3 style={{ fontSize: "1.5rem", fontWeight: 900, marginBottom: "2rem" }}>CONTINUE READING THIS INSIGHT</h3>
                        <Link href={post.externalUrl} target="_blank">
                             <button style={{ background: "var(--accent)", color: "#000", padding: "1.2rem 3rem", borderRadius: "1000px", border: "none", fontWeight: 900, textTransform: "uppercase", cursor: "pointer" }}>
                                READ EXTERNAL SOURCE
                             </button>
                        </Link>
                    </div>
                )}
            </article>

            <Footer />
            <style jsx>{`
                @media (max-width: 760px) {
                    .blog-detail-article {
                        padding: 8rem 1.25rem 4rem !important;
                    }
                    .blog-detail-header,
                    .blog-detail-image {
                        margin-bottom: 3rem !important;
                    }
                    .blog-detail-article h1 {
                        font-size: clamp(2.15rem, 11vw, 3.75rem) !important;
                        margin-bottom: 2rem !important;
                    }
                    .blog-detail-meta,
                    .blog-detail-byline {
                        flex-wrap: wrap;
                        gap: 0.8rem 1.25rem !important;
                    }
                    .blog-detail-byline {
                        padding-bottom: 2rem !important;
                    }
                    .blog-detail-image {
                        border-radius: 22px !important;
                    }
                    .blog-content {
                        font-size: 1rem !important;
                        line-height: 1.75 !important;
                    }
                    .blog-detail-external {
                        margin-top: 3rem !important;
                        padding: 1.5rem !important;
                        border-radius: 20px !important;
                    }
                    .blog-detail-external button {
                        width: 100%;
                    }
                }
            `}</style>
        </div>
    );
}
