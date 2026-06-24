"use client";

import { useState, useEffect } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, orderBy } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import { Upload, X, Plus, Trash2, Edit2, Check, BarChart3, Globe, Target, Image as ImageIcon, Server } from "lucide-react";
import { getPresignedUrl } from "@/app/actions/upload";

export interface Campaign {
    id?: string;
    influencer: string;
    brand: string;
    platform: string;
    month: string;
    category: string;
    strategy: string;
    thumbnail: string;
    videoUrl?: string;
    tiktokUrl?: string;
    description?: string;
    metrics: {
        views: string;
        likes?: string;
        engagement: string;
        er?: string;
    };
    createdAt?: unknown;
}

const CATEGORIES = ["ALL", "TECH", "LIFESTYLE", "BEAUTY", "FASHION", "EDUCATION"];
const STRATEGIES = ["AWARENESS", "LAUNCH", "CONVERSIONS", "UGC", "PERFORMANCE"];
const PLATFORMS = ["TikTok", "IG", "YouTube", "Mixed"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function CampaignManager() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [form, setForm] = useState<Omit<Campaign, "id">>({
        influencer: "",
        brand: "",
        platform: "TikTok",
        month: "January",
        category: "TECH",
        strategy: "AWARENESS",
        thumbnail: "",
        videoUrl: "",
        tiktokUrl: "",
        description: "",
        metrics: { views: "", likes: "", engagement: "", er: "" }
    });

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        setLoading(true);
        try {
            const q = query(collection(getDb(), "work_campaigns"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            const items = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Campaign));
            setCampaigns(items);
        } catch (error) {
            console.error("Error fetching campaigns:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "thumbnail" | "videoUrl") => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const { signedUrl, key } = await getPresignedUrl(file.name, file.type);
            const res = await fetch(signedUrl, {
                method: "PUT",
                body: file,
                headers: { "Content-Type": file.type }
            });

            if (!res.ok) throw new Error("R2 Upload failed");

            const publicBaseUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.replace(/\/$/, "");
            const url = `${publicBaseUrl}/${key}`;
            
            setForm(prev => ({ ...prev, [field]: url }));
        } catch (error) {
            console.error("Upload error:", error);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await updateDoc(doc(getDb(), "work_campaigns", editingId), { 
                    ...form,
                    updatedAt: new Date()
                });
            } else {
                await addDoc(collection(getDb(), "work_campaigns"), {
                    ...form,
                    createdAt: new Date()
                });
            }
            setIsAdding(false);
            setEditingId(null);
            setForm({
                influencer: "",
                brand: "",
                platform: "TikTok",
                month: "January",
                category: "TECH",
                strategy: "AWARENESS",
                thumbnail: "",
                videoUrl: "",
                tiktokUrl: "",
                description: "",
                metrics: { views: "", likes: "", engagement: "", er: "" }
            });
            fetchCampaigns();
        } catch (error) {
            console.error("Error saving campaign:", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this campaign?")) return;
        try {
            await deleteDoc(doc(getDb(), "work_campaigns", id));
            fetchCampaigns();
        } catch (error) {
            console.error("Error deleting campaign:", error);
        }
    };

    const handleEdit = (c: Campaign) => {
        setForm({
            influencer: c.influencer,
            brand: c.brand,
            platform: c.platform,
            month: c.month,
            category: c.category,
            strategy: c.strategy,
            thumbnail: c.thumbnail,
            videoUrl: c.videoUrl || "",
            tiktokUrl: c.tiktokUrl || "",
            description: c.description || "",
            metrics: {
                views: c.metrics?.views || "",
                likes: c.metrics?.likes || "",
                engagement: c.metrics?.engagement || "",
                er: c.metrics?.er || ""
            }
        });
        setEditingId(c.id || null);
        setIsAdding(true);
    };

    return (
        <div className="campaign-manager-root" style={{ padding: "0" }}>
            <div className="manager-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem" }}>
                <div>
                    <h2 style={{ fontSize: "clamp(1.5rem, 4vw, 2.2rem)", fontWeight: 900, textTransform: "uppercase" }}>Campaign Manager</h2>
                    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.9rem" }}>Manage the impact-driven portfolio on /work</p>
                </div>
                <button 
                    onClick={() => {
                        setIsAdding(!isAdding);
                        setEditingId(null);
                        setForm({
                            influencer: "",
                            brand: "",
                            platform: "TikTok",
                            month: "January",
                            category: "TECH",
                            strategy: "AWARENESS",
                            thumbnail: "",
                            videoUrl: "",
                            tiktokUrl: "",
                            description: "",
                            metrics: { views: "", likes: "", engagement: "", er: "" }
                        });
                    }}
                    style={{ background: isAdding ? "rgba(255,255,255,0.1)" : "var(--accent)", color: isAdding ? "#fff" : "#000", padding: "1rem 2rem", borderRadius: "100px", border: "none", fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.8rem", whiteSpace: "nowrap" }}
                >
                    {isAdding ? <X size={18} /> : <Plus size={18} />}
                    <span className="hide-mobile">{isAdding ? "CANCEL_DEPLOYMENT" : "DEPLOY_WORK"}</span>
                    <span className="show-mobile">{isAdding ? "CANCEL" : "DEPLOY"}</span>
                </button>
            </div>

            {isAdding && (
                <div className="glass campaign-form-terminal" style={{ padding: "3rem", marginBottom: "4rem", borderRadius: "30px", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <form onSubmit={handleSubmit} className="campaign-grid-form" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }} className="form-subgrid">
                                <div>
                                    <label style={labelStyle}>_BRAND_IDENTITY</label>
                                    <input value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} style={inputStyle} placeholder="E.G. GAUTH" required />
                                </div>
                                <div>
                                    <label style={labelStyle}>_TALENT_SYNC</label>
                                    <input value={form.influencer} onChange={e => setForm({...form, influencer: e.target.value})} style={inputStyle} placeholder="E.G. AYEESHAAD" required />
                                </div>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }} className="form-subgrid">
                                <div>
                                    <label style={labelStyle}>_PLATFORM_ENGINE</label>
                                    <select value={form.platform} onChange={e => setForm({...form, platform: e.target.value})} style={inputStyle}>
                                        {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>_DEPLOYMENT_MONTH</label>
                                    <select value={form.month} onChange={e => setForm({...form, month: e.target.value})} style={inputStyle}>
                                        {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }} className="form-subgrid">
                                <div>
                                    <label style={labelStyle}>_VERTICAL_SECTOR</label>
                                    <select value={form.category.toUpperCase()} onChange={e => setForm({...form, category: e.target.value})} style={inputStyle}>
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>_STRATEGY_PROTOCOL</label>
                                    <select value={form.strategy.toUpperCase()} onChange={e => setForm({...form, strategy: e.target.value})} style={inputStyle}>
                                        {STRATEGIES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }} className="form-subgrid">
                                <div>
                                    <label style={labelStyle}>_ANALYTIC_VIEWS</label>
                                    <input value={form.metrics.views} onChange={e => setForm({...form, metrics: { ...form.metrics, views: e.target.value }})} style={inputStyle} placeholder="E.G. 1.2M" required />
                                </div>
                                <div>
                                    <label style={labelStyle}>_ANALYTIC_LIKES</label>
                                    <input value={form.metrics.likes || ""} onChange={e => setForm({...form, metrics: { ...form.metrics, likes: e.target.value }})} style={inputStyle} placeholder="E.G. 184K" />
                                </div>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }} className="form-subgrid">
                                <div>
                                    <label style={labelStyle}>_ENGAGEMENT_KPI</label>
                                    <input value={form.metrics.engagement} onChange={e => setForm({...form, metrics: { ...form.metrics, engagement: e.target.value }})} style={inputStyle} placeholder="E.G. 8.5%" required />
                                </div>
                                <div>
                                    <label style={labelStyle}>_ER_RATE</label>
                                    <input value={form.metrics.er || ""} onChange={e => setForm({...form, metrics: { ...form.metrics, er: e.target.value }})} style={inputStyle} placeholder="E.G. 7.6%" />
                                </div>
                            </div>

                            <div>
                                <label style={labelStyle}>_CARD_DESCRIPTION</label>
                                <input value={form.description || ""} onChange={e => setForm({...form, description: e.target.value})} style={inputStyle} placeholder="E.G. CREATOR X BRAND EXPLAINER CAMPAIGN" />
                            </div>

                            <div>
                                <label style={labelStyle}>_TIKTOK_LINK</label>
                                <input value={form.tiktokUrl || ""} onChange={e => setForm({...form, tiktokUrl: e.target.value})} style={inputStyle} placeholder="https://www.tiktok.com/..." />
                            </div>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }} className="upload-subgrid">
                                <div style={{ flex: 1 }}>
                                    <label style={labelStyle}>_VISUAL_THUMBNAIL</label>
                                    <label style={uploadContainerStyle}>
                                        {form.thumbnail ? (
                                            <img src={form.thumbnail} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                                        ) : (
                                            <div style={{ textAlign: "center", padding: "1rem" }}>
                                                <ImageIcon size={24} style={{ color: "rgba(255,255,255,0.2)", marginBottom: "0.5rem" }} />
                                                <p style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.3)" }}>IMAGE_FILE</p>
                                            </div>
                                        )}
                                        <input type="file" onChange={e => handleUpload(e, "thumbnail")} accept="image/*" style={{ display: "none" }} />
                                    </label>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={labelStyle}>_MEDIA_PLAYBACK</label>
                                    <label style={uploadContainerStyle}>
                                        {form.videoUrl ? (
                                            <div style={{ textAlign: "center", color: "var(--accent)" }}>
                                                <Check size={24} style={{ marginBottom: "0.5rem" }} />
                                                <p style={{ fontSize: "0.6rem", fontWeight: 900 }}>VIDEO_READY</p>
                                            </div>
                                        ) : (
                                            <div style={{ textAlign: "center", padding: "1rem" }}>
                                                <Upload size={24} style={{ color: "rgba(255,255,255,0.2)", marginBottom: "0.5rem" }} />
                                                <p style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.3)" }}>VIDEO_FILE</p>
                                            </div>
                                        )}
                                        <input type="file" onChange={e => handleUpload(e, "videoUrl")} accept="video/*" style={{ display: "none" }} />
                                    </label>
                                </div>
                            </div>
                            <button 
                                type="submit" 
                                style={{ 
                                    background: "var(--accent)", color: "#000", padding: "1.5rem", borderRadius: "100px", border: "none", fontWeight: 900, fontSize: "0.85rem", cursor: "pointer", marginTop: "auto", textTransform: "uppercase", letterSpacing: "1px"
                                }}
                            >
                                {editingId ? "COMMIT_CAMPAIGN_UPDATE" : "DEPLOY_WORK_TO_HUB"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="campaign-inventory" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "2rem" }}>
                {loading ? (
                    <div style={{ gridColumn: "span 3", padding: "4rem 0", textAlign: "center", color: "rgba(255,255,255,0.2)" }}>
                        <Server className="animate-spin" size={24} style={{ margin: "0 auto 1rem" }} />
                        <span style={{ fontSize: "0.7rem", fontWeight: 900, letterSpacing: "2px" }}>FETCHING_WORK_LOGS...</span>
                    </div>
                ) : (
                    campaigns.map(c => (
                        <div key={c.id} className="glass campaign-inventory-card" style={{ padding: "1.2rem", position: "relative", display: "flex", gap: "1.2rem", alignItems: "center", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.05)" }}>
                            <div style={{ width: "80px", height: "80px", borderRadius: "16px", overflow: "hidden", flexShrink: 0 }}>
                                <img src={c.thumbnail} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <h4 style={{ fontSize: "1rem", fontWeight: 900, textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.brand}</h4>
                                <p style={{ color: "var(--accent)", fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px" }}>{c.influencer} <span style={{ color: "rgba(255,255,255,0.2)" }}>•</span> {c.platform}</p>
                                <div style={{ display: "flex", gap: "0.8rem", marginTop: "0.4rem", fontSize: "0.6rem", fontWeight: 800, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                    <span>{c.category}</span>
                                    <span>{c.month}</span>
                                    {c.videoUrl && <span style={{ color: "var(--accent)" }}>[LIVE]</span>}
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                <button onClick={() => handleEdit(c)} style={actionBtnStyle}><Edit2 size={16} /></button>
                                <button onClick={() => handleDelete(c.id!)} style={{ ...actionBtnStyle, background: "rgba(255, 71, 87, 0.1)", color: "#ff4757", borderColor: "rgba(255, 71, 87, 0.2)" }}><Trash2 size={16} /></button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <style jsx>{`
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .show-mobile { display: none; }
                @media (max-width: 1024px) {
                    .manager-header { flex-direction: column !important; align-items: flex-start !important; gap: 2rem !important; }
                    .manager-header button { width: 100% !important; }
                    .hide-mobile { display: none; }
                    .show-mobile { display: inline-block; }
                    .campaign-grid-form { grid-template-columns: 1fr !important; }
                    .form-subgrid { grid-template-columns: 1fr !important; }
                    .upload-subgrid { grid-template-columns: 1fr 1fr !important; }
                    .campaign-inventory { grid-template-columns: 1fr !important; }
                }
                @media (max-width: 640px) {
                    .upload-subgrid { grid-template-columns: 1fr !important; }
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

const uploadContainerStyle: React.CSSProperties = {
    width: "100%", height: "140px", border: "2px dashed rgba(255,255,255,0.08)", borderRadius: "20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.8rem", cursor: "pointer", position: "relative", overflow: "hidden", background: "rgba(255,255,255,0.01)"
};

const actionBtnStyle = {
    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", width: "40px", height: "40px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", cursor: "pointer"
};
