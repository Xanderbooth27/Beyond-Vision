"use client";

import { useState, useEffect } from "react";
import { getDb } from "@/lib/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, orderBy } from "firebase/firestore";
import { Plus, Trash2, Edit2, Upload, X, Server } from "lucide-react";

export interface BlogPost {
    id?: string;
    title: string;
    category: string;
    date: string;
    author: string;
    readTime: string;
    excerpt: string;
    content: string;
    imageUrl: string;
    externalUrl?: string;
    isFeatured?: boolean;
    createdAt?: unknown;
}

const CATEGORIES = ["STRATEGY", "INSIGHTS", "COMMERCE", "SAFETY", "PODCAST", "NEWS"];

export default function BlogManager() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    const [form, setForm] = useState<Omit<BlogPost, "id">>({
        title: "",
        category: "INSIGHTS",
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase(),
        author: "BV TEAM",
        readTime: "5 MIN READ",
        excerpt: "",
        content: "",
        imageUrl: "",
        externalUrl: "",
        isFeatured: false
    });

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const q = query(collection(getDb(), "blog_posts"), orderBy("createdAt", "desc"));
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as BlogPost));
            setPosts(data);
        } catch (error) {
            console.error("Error fetching posts:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const { getPresignedUrl } = await import("@/app/actions/upload");
            const { signedUrl, key } = await getPresignedUrl(file.name, file.type);
            const res = await fetch(signedUrl, {
                method: "PUT",
                body: file,
                headers: { "Content-Type": file.type }
            });

            if (!res.ok) throw new Error("R2 Upload failed");

            const publicBaseUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.replace(/\/$/, "");
            setForm(prev => ({ ...prev, imageUrl: `${publicBaseUrl}/${key}` }));
        } catch (error) {
            console.error("Upload error:", error);
            alert("Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.externalUrl?.trim() && !form.content.trim()) {
            setMessage("Add either an external article URL or the full article content.");
            return;
        }
        setSaving(true);
        setMessage("");
        try {
            if (editingId) {
                await updateDoc(doc(getDb(), "blog_posts", editingId), { ...form, updatedAt: new Date() });
            } else {
                await addDoc(collection(getDb(), "blog_posts"), { ...form, createdAt: new Date() });
            }
            setIsAdding(false);
            setEditingId(null);
            setForm({
                title: "",
                category: "INSIGHTS",
                date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase(),
                author: "BV TEAM",
                readTime: "5 MIN READ",
                excerpt: "",
                content: "",
                imageUrl: "",
                externalUrl: "",
                isFeatured: false
            });
            await fetchPosts();
            setMessage(editingId ? "Blog updated." : "Blog published.");
        } catch (error) {
            console.error("Error saving post:", error);
            setMessage("The blog could not be saved. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (post: BlogPost) => {
        setForm({
            title: post.title,
            category: post.category,
            date: post.date,
            author: post.author,
            readTime: post.readTime,
            excerpt: post.excerpt,
            content: post.content,
            imageUrl: post.imageUrl,
            externalUrl: post.externalUrl || "",
            isFeatured: !!post.isFeatured
        });
        setEditingId(post.id!);
        setIsAdding(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        await deleteDoc(doc(getDb(), "blog_posts", id));
        fetchPosts();
    };

    return (
        <div className="blog-manager-root" style={{ padding: "0" }}>
            <div className="manager-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem" }}>
                <div>
                    <h2 style={{ fontSize: "clamp(1.5rem, 4vw, 2.2rem)", fontWeight: 900, textTransform: "uppercase" }}>Blog Manager</h2>
                    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.9rem" }}>Add an external article or publish a full post on the website.</p>
                </div>
                <button 
                    onClick={() => { setIsAdding(!isAdding); setEditingId(null); }}
                    style={{ background: isAdding ? "rgba(255,255,255,0.05)" : "var(--accent)", color: isAdding ? "#fff" : "#000", padding: "1rem 2rem", borderRadius: "100px", border: "none", fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.8rem", whiteSpace: "nowrap" }}
                >
                    {isAdding ? <X size={18} /> : <Plus size={18} />}
                    <span>{isAdding ? "Cancel" : "Add Blog"}</span>
                </button>
            </div>

            {message && (
                <div style={{ margin: "-1.5rem 0 2rem", color: message.includes("could not") || message.startsWith("Add either") ? "#ff8a8a" : "#86efac", fontWeight: 800 }}>
                    {message}
                </div>
            )}

            {isAdding && (
                <div className="glass blog-form-terminal" style={{ padding: "3rem", marginBottom: "4rem", borderRadius: "32px", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <form onSubmit={handleSubmit} className="blog-grid-form" style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "3rem" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                            <div>
                                <label style={labelStyle}>Article title</label>
                                <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} style={inputStyle} placeholder="Article title" required />
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }} className="form-subgrid">
                                <div>
                                    <label style={labelStyle}>Author</label>
                                    <input value={form.author} onChange={e => setForm({...form, author: e.target.value})} style={inputStyle} placeholder="BV TEAM" required />
                                </div>
                                <div>
                                    <label style={labelStyle}>Publish date</label>
                                    <input value={form.date} onChange={e => setForm({...form, date: e.target.value})} style={inputStyle} placeholder="MARCH 20, 2026" required />
                                </div>
                            </div>
                            
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }} className="form-subgrid">
                                <div>
                                    <label style={labelStyle}>Category</label>
                                    <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} style={inputStyle}>
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>Read time</label>
                                    <input value={form.readTime} onChange={e => setForm({...form, readTime: e.target.value})} style={inputStyle} placeholder="E.G. 6 MIN READ" />
                                </div>
                            </div>

                            <div>
                                <label style={labelStyle}>Short description</label>
                                <textarea value={form.excerpt} onChange={e => setForm({...form, excerpt: e.target.value})} style={{ ...inputStyle, height: "100px", resize: "none" }} placeholder="A short summary shown on the blog card..." required />
                            </div>

                            <div>
                                <label style={labelStyle}>External article URL (optional)</label>
                                <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }} className="form-payload-header">
                                    <input type="url" value={form.externalUrl} onChange={e => setForm({...form, externalUrl: e.target.value})} style={{ ...inputStyle, flex: 1 }} placeholder="https://example.com/article" />
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,255,255,0.02)", padding: "0 1.5rem", borderRadius: "100px", border: "1px solid rgba(255,255,255,0.08)" }}>
                                        <input type="checkbox" checked={form.isFeatured} onChange={e => setForm({...form, isFeatured: e.target.checked})} id="featured" />
                                        <label htmlFor="featured" style={{ fontSize: "0.7rem", fontWeight: 900, cursor: "pointer", color: form.isFeatured ? "var(--accent)" : "rgba(255,255,255,0.4)" }}>FEATURED</label>
                                    </div>
                                </div>
                                <label style={{ ...labelStyle, marginTop: "1.5rem" }}>Full article content (optional when linking externally)</label>
                                <textarea value={form.content} onChange={e => setForm({...form, content: e.target.value})} style={{ ...inputStyle, height: "300px", resize: "vertical" }} placeholder="Write the full article here when it should live on this website..." />
                            </div>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                             <div>
                                <label style={labelStyle}>Cover image</label>
                                <input type="url" value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} style={{ ...inputStyle, marginBottom: "1rem" }} placeholder="Paste an image URL or upload below" required />
                                <label style={{ ...uploadBoxStyle, backgroundImage: form.imageUrl ? `url(${form.imageUrl})` : 'none' }}>
                                    {!form.imageUrl && (
                                        <div style={{ textAlign: "center", padding: "1rem" }}>
                                            <Upload size={32} style={{ color: "rgba(255,255,255,0.2)", marginBottom: "1rem" }} />
                                            <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.3)", fontWeight: 900 }}>{uploading ? "Uploading..." : "Upload cover image"}</span>
                                        </div>
                                    )}
                                    <input type="file" onChange={handleUpload} accept="image/*" style={{ display: "none" }} />
                                </label>
                            </div>

                            <div style={{ padding: "2rem", background: "rgba(255, 246, 117, 0.02)", borderRadius: "24px", border: "1px solid rgba(255, 246, 117, 0.1)" }}>
                                <h4 style={{ fontSize: "0.75rem", fontWeight: 900, color: "var(--accent)", marginBottom: "1rem", letterSpacing: "2px" }}>HOW IT WORKS</h4>
                                <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.3)", lineHeight: 1.6, fontWeight: 600 }}>
                                    External URLs open the original article. Without one, the full article is published on this website.
                                </p>
                            </div>

                            <button type="submit" disabled={saving || uploading} style={{ marginTop: "auto", background: "var(--accent)", color: "#000", padding: "1.2rem", borderRadius: "100px", border: "none", fontWeight: 900, cursor: saving ? "wait" : "pointer", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "1px", opacity: saving || uploading ? 0.6 : 1 }}>
                                {saving ? "Saving..." : editingId ? "Update Blog" : "Publish Blog"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="blog-inventory" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "2rem" }}>
                {loading ? (
                    <div style={{ gridColumn: "span 3", padding: "4rem 0", textAlign: "center", color: "rgba(255,255,255,0.2)" }}>
                        <Server className="animate-spin" size={24} style={{ margin: "0 auto 1rem" }} />
                        <span style={{ fontSize: "0.7rem", fontWeight: 900, letterSpacing: "2px" }}>SYNCING_INSIGHT_LOGS...</span>
                    </div>
                ) : posts.length ? (
                    posts.map(p => (
                        <div key={p.id} className="glass blog-inventory-card" style={{ padding: "1.2rem", display: "flex", gap: "1.2rem", alignItems: "center", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.05)" }}>
                            <div style={{ width: "80px", height: "80px", borderRadius: "16px", overflow: "hidden", flexShrink: 0 }}>
                                <img src={p.imageUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <h4 style={{ fontSize: "0.95rem", fontWeight: 900, textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.title}</h4>
                                <div style={{ display: "flex", gap: "1rem", fontSize: "0.6rem", fontWeight: 900, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                    <span style={{ color: "var(--accent)" }}>{p.category}</span>
                                    <span>{p.date}</span>
                                    {p.isFeatured && <span style={{ color: "#4ade80" }}>[MASTER]</span>}
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                <button onClick={() => handleEdit(p)} style={actionBtnStyle}><Edit2 size={16} /></button>
                                <button onClick={() => handleDelete(p.id!)} style={{ ...actionBtnStyle, background: "rgba(255, 71, 87, 0.1)", color: "#ff4757", borderColor: "rgba(255, 71, 87, 0.2)" }}><Trash2 size={16} /></button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{ color: "rgba(255,255,255,0.4)", padding: "2rem 0" }}>No blogs published yet. Click “Add Blog” to create the first one.</div>
                )}
            </div>

            <style jsx>{`
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .show-mobile { display: none; }
                
                @media (max-width: 1024px) {
                    .blog-manager-root { padding: 0 !important; }
                    .manager-header { flex-direction: column !important; align-items: flex-start !important; gap: 2rem !important; }
                    .manager-header button { width: 100% !important; }
                    .hide-mobile { display: none; }
                    .show-mobile { display: inline-block; }
                    
                    .blog-form-terminal { padding: 1.5rem !important; }
                    .blog-grid-form { grid-template-columns: 1fr !important; }
                    .form-subgrid { grid-template-columns: 1fr !important; gap: 1rem !important; }
                    .form-payload-header { flex-direction: column !important; }
                    .form-payload-header > div { width: 100% !important; padding: 1rem !important; }
                    
                    .blog-inventory { grid-template-columns: 1fr !important; }
                    .blog-inventory-card { padding: 1rem !important; }
                }
            `}</style>
        </div>
    );
}

const inputStyle = {
    width: "100%", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", padding: "1.2rem", borderRadius: "16px", color: "#fff", fontSize: "0.9rem", fontWeight: 600, outline: "none"
};

const labelStyle = {
    fontSize: "0.7rem", fontWeight: 900, color: "rgba(255,255,255,0.3)", letterSpacing: "2px", marginBottom: "0.8rem", display: "block", textTransform: "uppercase" as const
};

const uploadBoxStyle: React.CSSProperties = {
    height: "200px", width: "100%", border: "2px dashed rgba(255,255,255,0.08)", borderRadius: "24px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", backgroundSize: "cover", backgroundPosition: "center", gap: "1rem", background: "rgba(255,255,255,0.01)"
};

const actionBtnStyle = {
    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", width: "40px", height: "40px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", cursor: "pointer"
};
