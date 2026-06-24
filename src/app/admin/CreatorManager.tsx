"use client";

import { useState, useEffect } from "react";
import { getDb } from "@/lib/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, orderBy } from "firebase/firestore";
import { Plus, Trash2, Edit2, Upload, Server } from "lucide-react";

export interface Creator {
    id?: string;
    displayName: string;
    creatorName: string;
    category: string;
    bio: string;
    country: string;
    specificNiche: string;
    phone: string;
    engagement: string;
    avgViews: string;
    avgLikes: string;
    totalLikes: string;
    tiktokRate: string;
    instagramRate: string;
    soundRate: string;
    audienceDemographics: {
        topCountries: string;
        genderSplit: string;
        ageGroups: string;
    };
    tiktokUsername: string;
    instagramUsername: string;
    tiktokBaseRate: string;
    soundBaseRate: string;
    exclusivity: string;
    hypeAuditorUrl: string;
    lastUpdated: string;
    socialLinks: {
        tiktokFollowers: string;
        tiktokUrl: string;
        instagramFollowers: string;
        instagramUrl: string;
        youtubeFollowers: string;
        youtubeUrl: string;
    };
    profileImageUrl: string;
    highlightVideoUrl?: string; // New field
    createdAt?: Date;
}

const defaultCreator: Omit<Creator, "id" | "createdAt"> = {
    displayName: "",
    creatorName: "",
    category: "ENTERTAINMENT",
    bio: "",
    country: "",
    specificNiche: "",
    phone: "",
    engagement: "",
    avgViews: "",
    avgLikes: "",
    totalLikes: "",
    tiktokRate: "$0.00",
    instagramRate: "$0.00",
    soundRate: "$0.00",
    audienceDemographics: {
        topCountries: "",
        genderSplit: "",
        ageGroups: "",
    },
    tiktokUsername: "",
    instagramUsername: "",
    tiktokBaseRate: "$0.00",
    soundBaseRate: "$0.00",
    exclusivity: "",
    hypeAuditorUrl: "",
    lastUpdated: "",
    socialLinks: {
        tiktokFollowers: "0",
        tiktokUrl: "",
        instagramFollowers: "0",
        instagramUrl: "",
        youtubeFollowers: "0",
        youtubeUrl: "",
    },
    profileImageUrl: "",
    highlightVideoUrl: "",
};

export default function CreatorManager() {
    const [creators, setCreators] = useState<Creator[]>([]);
    const [loading, setLoading] = useState(true);
    const [formVisible, setFormVisible] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Omit<Creator, "id" | "createdAt">>(defaultCreator);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchCreators();
    }, []);

    const fetchCreators = async () => {
        setLoading(true);
        try {
            const q = query(collection(getDb(), "creators"), orderBy("createdAt", "desc"));
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Creator));
            setCreators(data);
        } catch (error) {
            console.error("Error fetching creators:", error);
        }
        setLoading(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name.includes(".")) {
            const [parent, child] = name.split(".");
            if (parent === "audienceDemographics") {
                setFormData(prev => ({
                    ...prev,
                    audienceDemographics: {
                        ...prev.audienceDemographics,
                        [child]: value
                    }
                }));
            } else if (parent === "socialLinks") {
                setFormData(prev => ({
                    ...prev,
                    socialLinks: {
                        ...prev.socialLinks,
                        [child]: value
                    }
                }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "profileImageUrl" | "highlightVideoUrl") => {
        const file = e.target.files?.[0];
        if (!file) return;

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
            const url = `${publicBaseUrl}/${key}`;
            
            setFormData(prev => ({ ...prev, [field]: url }));
        } catch (error) {
            console.error("Upload error:", error);
            alert("Upload failed");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingId) {
                await updateDoc(doc(getDb(), "creators", editingId), { ...formData, lastUpdated: new Date().toISOString() });
            } else {
                await addDoc(collection(getDb(), "creators"), { ...formData, createdAt: new Date() });
            }
            setFormVisible(false);
            setEditingId(null);
            setFormData(defaultCreator);
            fetchCreators();
        } catch (error) {
            console.error("Error saving creator:", error);
            alert("Error saving creator");
        }
        setSubmitting(false);
    };

    const handleEdit = (creator: Creator) => {
        const mergedData = {
            ...defaultCreator,
            ...creator,
            audienceDemographics: {
                ...defaultCreator.audienceDemographics,
                ...(creator.audienceDemographics || {})
            },
            socialLinks: {
                ...defaultCreator.socialLinks,
                ...(creator.socialLinks || {})
            }
        };
        
        const { id: _id, createdAt: _createdAt, ...cleanFormData } = mergedData;
        setFormData(cleanFormData);
        setEditingId(creator.id || null);
        setFormVisible(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this creator?")) return;
        try {
            await deleteDoc(doc(getDb(), "creators", id));
            fetchCreators();
        } catch (error) {
            console.error("Error deleting creator:", error);
        }
    };

    return (
        <div className="creator-manager-root" style={{ padding: "2rem", background: "rgba(255,255,255,0.02)", borderRadius: "32px", border: "1px solid rgba(255,255,255,0.04)" }}>
            <div className="manager-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem" }}>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 800 }}>Creator Roster Management</h2>
                <button
                    onClick={() => {
                        setFormVisible(!formVisible);
                        if (!formVisible && editingId) {
                            setEditingId(null);
                            setFormData(defaultCreator);
                        }
                    }}
                    style={{
                        background: "var(--accent)", color: "#000", border: "none", padding: "0.8rem 1.5rem", borderRadius: "100px", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", whiteSpace: "nowrap"
                    }}
                >
                    <Plus size={16} /> 
                    <span className="hide-mobile">{formVisible ? "Close Form" : "Add New Creator"}</span>
                    <span className="show-mobile">{formVisible ? "Close" : "Add"}</span>
                </button>
            </div>

            {formVisible && (
                <form onSubmit={handleSubmit} style={{ background: "rgba(0,0,0,0.2)", padding: "2rem", borderRadius: "24px", marginBottom: "3rem", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <h3 style={{ marginBottom: "1.5rem", fontSize: "1.2rem", fontWeight: 800 }}>{editingId ? "Edit Creator" : "Create New Creator"}</h3>

                    <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2.5rem", marginBottom: "2rem" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <h4 style={h4Style}>_IDENTITY_PROTOCOL</h4>
                            <input name="displayName" value={formData.displayName || ""} onChange={handleInputChange} placeholder="Display Name" required style={inputStyle} />
                            <input name="creatorName" value={formData.creatorName || ""} onChange={handleInputChange} placeholder="Creator Name (e.g. MRBEAST)" required style={inputStyle} />
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                <label style={{ ...uploadStyle, backgroundImage: formData.profileImageUrl ? `url(${formData.profileImageUrl})` : 'none' }}>
                                    {!formData.profileImageUrl && "UPLOAD IMAGE"}
                                    <input type="file" onChange={e => handleUpload(e, "profileImageUrl")} accept="image/*" style={{ display: "none" }} />
                                </label>
                                <label style={{ ...uploadStyle, border: formData.highlightVideoUrl ? '2px solid #4ade80' : '2px dashed rgba(255,255,255,0.1)' }}>
                                    {formData.highlightVideoUrl ? "VIDEO ADDED" : "UPLOAD HIGHLIGHT"}
                                    <input type="file" onChange={e => handleUpload(e, "highlightVideoUrl")} accept="video/*" style={{ display: "none" }} />
                                </label>
                            </div>
                            <input name="category" value={formData.category || ""} onChange={handleInputChange} placeholder="Category" required style={inputStyle} />
                            <textarea name="bio" value={formData.bio || ""} onChange={handleInputChange} placeholder="Bio..." rows={3} style={inputStyle} />
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <h4 style={h4Style}>_PERFORMANCE_METRICS</h4>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                <input name="engagement" value={formData.engagement || ""} onChange={handleInputChange} placeholder="Engagement Rate" style={inputStyle} />
                                <input name="avgViews" value={formData.avgViews || ""} onChange={handleInputChange} placeholder="Avg Views" style={inputStyle} />
                                <input name="tiktokRate" value={formData.tiktokRate || ""} onChange={handleInputChange} placeholder="TikTok Rate" style={inputStyle} />
                                <input name="instagramRate" value={formData.instagramRate || ""} onChange={handleInputChange} placeholder="Insta Rate" style={inputStyle} />
                            </div>
                            <input name="hypeAuditorUrl" value={formData.hypeAuditorUrl || ""} onChange={handleInputChange} placeholder="Analytics URL" style={inputStyle} />
                        </div>
                    </div>

                    <button type="submit" disabled={submitting} style={{ width: "100%", background: "var(--accent)", color: "#000", padding: "1.2rem", borderRadius: "100px", fontWeight: 900, cursor: "pointer", textTransform: "uppercase", fontSize: "0.8rem" }}>
                        {submitting ? "SYNCING..." : (editingId ? "COMMIT_CHANGES" : "DEPLOY_CREATOR")}
                    </button>
                </form>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {loading ? (
                   <div style={{ padding: "4rem 0", textAlign: "center", color: "rgba(255,255,255,0.2)" }}>
                        <Server className="animate-spin" size={24} style={{ margin: "0 auto 1rem" }} />
                        <span style={{ fontSize: "0.7rem", fontWeight: 900, letterSpacing: "2px" }}>FETCHING_ROSTER...</span>
                   </div>
                ) : creators.map(c => (
                    <div key={c.id} className="creator-card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.5rem", background: "rgba(255,255,255,0.02)", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.05)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                            <img
                                src={c.profileImageUrl?.trim() || "/spec-references/creator-roster-grid.png"}
                                alt={c.creatorName || "Creator"}
                                style={{ width: "60px", height: "60px", borderRadius: "12px", objectFit: "cover" }}
                                className="creator-thumb"
                            />
                            <div>
                                <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "0.2rem" }}>{c.creatorName}</h3>
                                <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.3)", display: "flex", gap: "1rem", fontWeight: 800, textTransform: "uppercase" }} className="creator-stats">
                                    <span>{c.category}</span>
                                    {c.highlightVideoUrl && <span style={{ color: "var(--accent)" }}>[MEDIA_READY]</span>}
                                </div>
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: "0.8rem" }}>
                            <button onClick={() => handleEdit(c)} style={actionButtonStyle}><Edit2 size={16} /></button>
                            <button onClick={() => handleDelete(c.id!)} style={{ ...actionButtonStyle, background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", borderColor: "rgba(239, 68, 68, 0.2)" }}><Trash2 size={16} /></button>
                        </div>
                    </div>
                ))}
                {!loading && creators.length === 0 && (
                    <div style={{ textAlign: "center", padding: "3rem", color: "rgba(255,255,255,0.4)" }}>No creators found.</div>
                )}
            </div>

            <style jsx>{`
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .show-mobile { display: none; }
                @media (max-width: 1024px) {
                    .creator-manager-root { padding: 1.5rem !important; }
                    .form-grid { grid-template-columns: 1fr !important; }
                    .hide-mobile { display: none; }
                    .show-mobile { display: inline-block; }
                    .creator-stats { flex-direction: column !important; gap: 0.2rem !important; }
                    .creator-thumb { width: 40px !important; height: 40px !important; }
                }
            `}</style>
        </div>
    );
}

const h4Style = { color: "var(--accent)", fontSize: "0.7rem", textTransform: "uppercase" as const, letterSpacing: "2px", fontWeight: 900 };

const uploadStyle: React.CSSProperties = {
    height: "100px", border: "2px dashed rgba(255,255,255,0.1)", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", fontWeight: 900, cursor: "pointer", backgroundSize: "cover", backgroundPosition: "center", color: "rgba(255,255,255,0.3)"
};

const inputStyle = {
    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "1.2rem", color: "#fff", fontSize: "0.9rem", fontWeight: 600, outline: "none", width: "100%"
};

const actionButtonStyle = {
    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", padding: "0.8rem", borderRadius: "12px", color: "#fff", cursor: "pointer"
};
