"use client";

import { useState, useEffect } from "react";
import { getClientAuth, getDb } from "@/lib/firebase";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import Link from "next/link";
import { Plus, Trash2, Home, Upload, Image as ImageIcon, Loader2 } from "lucide-react";
import AmbientBackground from "@/components/AmbientBackground";
import { getPresignedUrl } from "@/app/actions/upload";
import CreatorManager from "./CreatorManager";
import ContentManager from "./ContentManager";
import CampaignManager from "./CampaignManager";
import BlogManager from "./BlogManager";
import TestimonialManager from "./TestimonialManager";
import BrandManager from "./BrandManager";
import TeamManager from "./TeamManager";

interface TalentImage {
    id: string;
    url: string;
}

export default function AdminPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [firebaseReady, setFirebaseReady] = useState(false);
    const [cookieAuth, setCookieAuth] = useState(false);
    const [sessionChecked, setSessionChecked] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);
    
    const [activeTab, setActiveTab] = useState<"pages" | "images" | "creators" | "campaigns" | "insights" | "testimonials" | "brands" | "team">("pages");
    const [images, setImages] = useState<TalentImage[]>([]);
    const [newImageUrl, setNewImageUrl] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<"idle" | "uploading" | "error" | "success">("idle");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        let authInstance;
        try {
            authInstance = getClientAuth();
        } catch {
            setFirebaseReady(true);
            return;
        }
        const unsubscribe = onAuthStateChanged(authInstance, (u) => {
            setUser(u);
            setFirebaseReady(true);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        let cancelled = false;
        fetch("/api/admin/session")
            .then((r) => r.json())
            .then((data: { authenticated?: boolean }) => {
                if (!cancelled) setCookieAuth(!!data.authenticated);
            })
            .catch(() => {
                if (!cancelled) setCookieAuth(false);
            })
            .finally(() => {
                if (!cancelled) setSessionChecked(true);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (!firebaseReady || !sessionChecked) return;
        if (user || cookieAuth) {
            setAuthLoading(false);
            return;
        }
        router.replace("/admin/login");
    }, [firebaseReady, sessionChecked, user, cookieAuth, router]);

    useEffect(() => {
        if (!file) {
            setPreviewUrl(null);
            return;
        }
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    useEffect(() => {
        if (!authLoading) {
            fetchImages();
        }
    }, [authLoading]);

    const fetchImages = async () => {
        setLoading(true);
        setErrorMessage(null);
        try {
            const q = query(collection(getDb(), "talent_images"), orderBy("uploadedAt", "desc"));
            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map(doc => ({
                id: doc.id,
                url: doc.data().url
            }));
            setImages(data);
        } catch (error: unknown) {
            console.error("Error fetching images:", error);
            setErrorMessage(error instanceof Error ? error.message : "Failed to fetch images from Firebase");
        }
        setLoading(false);
    };

    const handleAddImage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newImageUrl && !file) return;
        setStatus("uploading");
        setErrorMessage(null);
        setProgress(10);

        try {
            let finalUrl = newImageUrl;

            if (file) {
                // 1. Get Presigned URL
                const { signedUrl, key: r2Key } = await getPresignedUrl(file.name, file.type);
                setProgress(30);

                // 2. Upload to R2
                const uploadResponse = await fetch(signedUrl, {
                    method: "PUT",
                    body: file,
                    headers: { "Content-Type": file.type }
                });

                if (!uploadResponse.ok) throw new Error("R2 Upload failed. Check CORS or Keys.");
                setProgress(70);

                // 3. Construct Public URL
                const publicBaseUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.replace(/\/$/, "");
                if (!publicBaseUrl) throw new Error("NEXT_PUBLIC_R2_PUBLIC_URL is not configured in .env.local");
                finalUrl = `${publicBaseUrl}/${r2Key}`;
            }

            await addDoc(collection(getDb(), "talent_images"), {
                url: finalUrl,
                uploadedAt: new Date()
            });

            setNewImageUrl("");
            setFile(null);
            setPreviewUrl(null);
            setStatus("success");
            setProgress(100);
            fetchImages();
            setTimeout(() => setStatus("idle"), 2000);
        } catch (error: unknown) {
            console.error("Error adding image:", error);
            setStatus("error");
            setErrorMessage(error instanceof Error ? error.message : "Something went wrong.");
            setTimeout(() => setStatus("idle"), 5000);
        }
    };

    const handleDeleteImage = async (id: string) => {
        if (!confirm("Are you sure you want to remove this talent?")) return;
        try {
            await deleteDoc(doc(getDb(), "talent_images", id));
            fetchImages();
        } catch (error) {
            console.error("Error deleting image:", error);
        }
    };

    return (
        <div className="admin-root" style={{ minHeight: "100vh", padding: "4rem 2rem", background: "var(--bv-bg-deep)", color: "#F5F5F5", position: "relative" }}>
            <AmbientBackground />

            {authLoading && (
                <div style={{ position: "fixed", inset: 0, background: "var(--bv-bg-deep)", zIndex: 100000, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "2rem" }}>
                    <Loader2 className="animate-spin" size={40} color="var(--accent)" />
                    <p style={{ fontSize: "0.7rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "4px", color: "var(--accent)" }}>Validating Protocols</p>
                </div>
            )}

            <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 10 }}>
                {/* Header */}
                <div className="admin-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4rem" }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                            <div style={{ width: "12px", height: "12px", background: "var(--accent)", borderRadius: "50%" }} />
                            <span style={{ fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "2px", color: "rgba(255,255,255,0.4)" }}>
                                Internal Systems
                            </span>
                        </div>
                        <h1 style={{ fontSize: "clamp(2rem, 5vw, 4rem)", fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.04em" }}>Admin Panel</h1>
                    </div>
                    <div className="admin-header-actions" style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
                        <Link href="/" style={{ textDecoration: "none" }}>
                            <button style={{
                                padding: "1rem 2rem",
                                borderRadius: "100px",
                                background: "rgba(255,255,255,0.05)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                color: "#fff",
                                fontWeight: 800,
                                textTransform: "uppercase",
                                fontSize: "0.75rem",
                                letterSpacing: "1px",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.8rem",
                                cursor: "pointer",
                                backdropFilter: "blur(10px)"
                            }}>
                                <Home size={16} /> <span className="hide-mobile">Back to Site</span>
                            </button>
                        </Link>
                        <button 
                            onClick={async () => {
                                try {
                                    await fetch("/api/admin/logout", { method: "POST" });
                                } catch {
                                    /* ignore */
                                }
                                try {
                                    await signOut(getClientAuth());
                                } catch {
                                    /* cookie auth may not use Firebase */
                                }
                                router.push("/admin/login");
                            }}
                            style={{
                                padding: "1rem 2.5rem",
                                borderRadius: "100px",
                                background: "rgba(255, 71, 87, 0.1)",
                                border: "1px solid rgba(255, 71, 87, 0.2)",
                                color: "#ff4757",
                                fontWeight: 800,
                                textTransform: "uppercase",
                                fontSize: "0.75rem",
                                letterSpacing: "1px",
                                cursor: "pointer",
                                backdropFilter: "blur(10px)"
                            }}>
                            <span className="hide-mobile">LOGOUT PROTOCOL</span>
                            <span className="show-mobile">LOGOUT</span>
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="admin-tabs" style={{ display: "flex", gap: "1rem", marginBottom: "3rem", overflowX: "auto", paddingBottom: "1rem" }}>
                    <TabButton active={activeTab === "creators"} onClick={() => setActiveTab("creators")} label="Roster" />
                    <TabButton active={activeTab === "images"} onClick={() => setActiveTab("images")} label="Gallery" />
                    <TabButton active={activeTab === "pages"} onClick={() => setActiveTab("pages")} label="Pages" />
                    <TabButton active={activeTab === "campaigns"} onClick={() => setActiveTab("campaigns")} label="Campaigns" />
                    <TabButton active={activeTab === "brands"} onClick={() => setActiveTab("brands")} label="Brand Logos" />
                    <TabButton active={activeTab === "testimonials"} onClick={() => setActiveTab("testimonials")} label="Testimonials" />
                    <TabButton active={activeTab === "team"} onClick={() => setActiveTab("team")} label="Team" />
                    <TabButton active={activeTab === "insights"} onClick={() => setActiveTab("insights")} label="Blogs" />
                </div>

                {/* Main Content Area */}
                {activeTab === "images" ? (
                    <div className="admin-gallery-grid" style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "3rem" }}>

                        {/* Add Image Sidebar */}
                        <div className="admin-gallery-sidebar" style={{ position: "sticky", top: "4rem", height: "fit-content" }}>
                            <div className="glass" style={{ padding: "2.5rem", borderRadius: "32px", border: "1px solid rgba(255,255,255,0.05)" }}>
                                <h2 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "1.5rem" }}>Upload Talent</h2>
                                <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.4)", marginBottom: "2rem", lineHeight: 1.6 }}>
                                    Add portrait URLs to the background roster grid on the home page.
                                </p>

                                <form onSubmit={handleAddImage} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                                        <label style={{ fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>Option 1: Upload File</label>
                                        <div
                                            onClick={() => document.getElementById('file-upload')?.click()}
                                            style={{
                                                border: "2px dashed rgba(255,255,255,0.1)",
                                                borderRadius: "16px",
                                                padding: previewUrl ? "1rem" : "2rem",
                                                textAlign: "center",
                                                cursor: "pointer",
                                                background: file ? "rgba(255, 255, 255, 0.05)" : "transparent",
                                                borderColor: file ? "var(--accent)" : "rgba(255,255,255,0.1)",
                                                transition: "all 0.3s ease",
                                                minHeight: "150px",
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                justifyContent: "center"
                                            }}
                                        >
                                            <input
                                                id="file-upload"
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                                style={{ display: "none" }}
                                            />
                                            {previewUrl ? (
                                                <img src={previewUrl} style={{ width: "100%", height: "130px", objectFit: "cover", borderRadius: "12px" }} />
                                            ) : (
                                                <>
                                                    <Upload size={24} style={{ marginBottom: "0.5rem", color: "rgba(255,255,255,0.2)" }} />
                                                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "rgba(255,255,255,0.3)" }}>BROWSE FILES</span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                                        <label style={{ fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>Option 2: Image URL</label>
                                        <input
                                            type="text"
                                            placeholder="https://..."
                                            value={newImageUrl}
                                            onChange={(e) => setNewImageUrl(e.target.value)}
                                            style={{
                                                width: "100%",
                                                padding: "1rem 1.2rem",
                                                background: "rgba(255,255,255,0.03)",
                                                border: "1px solid rgba(255,255,255,0.08)",
                                                borderRadius: "12px",
                                                color: "#fff",
                                                outline: "none",
                                                fontSize: "0.9rem"
                                            }}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={status === "uploading"}
                                        style={{
                                            width: "100%",
                                            padding: "1.2rem",
                                            borderRadius: "16px",
                                            background: "var(--accent)",
                                            color: "#000",
                                            border: "none",
                                            fontWeight: 900,
                                            fontSize: "0.8rem",
                                            textTransform: "uppercase",
                                            cursor: "pointer",
                                            marginTop: "1rem",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: "0.8rem"
                                        }}
                                    >
                                        {status === "uploading" ? `UPLOADING ${progress}%` : status === "success" ? "SYNCED" : "DEPLOY TO GRID"}
                                    </button>

                                    {errorMessage && (
                                        <div style={{ padding: "1rem", borderRadius: "100px", background: "rgba(255, 71, 87, 0.1)", border: "1px solid rgba(255, 71, 87, 0.2)", color: "#ff4757", fontSize: "0.7rem", fontWeight: 800, textAlign: "center" }}>
                                            {errorMessage}
                                        </div>
                                    )}
                                </form>
                            </div>
                        </div>

                        {/* Gallery Preview */}
                        <div>
                            <div className="admin-image-list" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
                                {loading && !images.length ? (
                                    <div style={{ gridColumn: "span 3", padding: "5rem 0", textAlign: "center", color: "rgba(255,255,255,0.2)" }}>
                                        FETCHING_SYNC_DATA...
                                    </div>
                                ) : images.map((img) => (
                                    <div key={img.id} className="image-card" style={{ position: "relative", aspectRatio: "1/1", borderRadius: "20px", overflow: "hidden", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                                        <img src={img.url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                        <div className="gallery-overlay" style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.3s ease" }}>
                                            <button
                                                onClick={() => handleDeleteImage(img.id)}
                                                style={{ padding: "0.8rem 1.2rem", borderRadius: "10px", background: "#ff4757", border: "none", color: "#fff", fontSize: "0.7rem", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}
                                            >
                                                <Trash2 size={14} /> Remove
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : activeTab === "creators" ? (
                    <div style={{ width: "100%" }}>
                        <CreatorManager />
                    </div>
                ) : activeTab === "pages" ? (
                    <div style={{ width: "100%" }}>
                        <ContentManager />
                    </div>
                ) : activeTab === "campaigns" ? (
                    <div style={{ width: "100%" }}>
                        <CampaignManager />
                    </div>
                ) : activeTab === "brands" ? (
                    <div style={{ width: "100%" }}>
                        <BrandManager />
                    </div>
                ) : activeTab === "testimonials" ? (
                    <div style={{ width: "100%" }}>
                        <TestimonialManager />
                    </div>
                ) : activeTab === "team" ? (
                    <div style={{ width: "100%" }}>
                        <TeamManager />
                    </div>
                ) : (
                    <div style={{ width: "100%" }}>
                        <BlogManager />
                    </div>
                )}
            </div>
            
            <style jsx>{`
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                
                .image-card:hover .gallery-overlay { opacity: 1 !important; }
                
                .admin-tabs::-webkit-scrollbar { display: none; }
                
                .show-mobile { display: none; }
                
                @media (max-width: 1024px) {
                    .admin-root { padding: 4rem 1.5rem !important; }
                    .admin-header { flex-direction: column !important; align-items: flex-start !important; gap: 2rem !important; }
                    .admin-header-actions { width: 100% !important; justify-content: space-between !important; }
                    .hide-mobile { display: none; }
                    .show-mobile { display: block; }
                    
                    .admin-gallery-grid { grid-template-columns: 1fr !important; }
                    .admin-gallery-sidebar { position: static !important; }
                    .admin-image-list { grid-template-columns: 1fr 1fr !important; }
                }
                
                @media (max-width: 640px) {
                    .admin-image-list { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    );
}

function TabButton({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
    return (
        <button
            onClick={onClick}
            style={{
                padding: "1rem 2rem",
                borderRadius: "100px",
                background: active ? "var(--accent)" : "rgba(255,255,255,0.05)",
                color: active ? "#000" : "#fff",
                border: "1px solid",
                borderColor: active ? "transparent" : "rgba(255,255,255,0.1)",
                fontWeight: 800,
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "all 0.3s ease",
                whiteSpace: "nowrap",
                fontSize: "0.75rem",
                letterSpacing: "1px"
            }}
        >
            {label}
        </button>
    );
}
