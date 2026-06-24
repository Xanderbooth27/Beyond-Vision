"use client";

import { useState, useEffect } from "react";
import { getDb } from "../../lib/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { Plus, Trash2, Upload } from "lucide-react";
import { getPresignedUrl } from "../actions/upload";

export default function AboutPageManager() {
    const [images, setImages] = useState<{ id: string, url: string }[]>([]);
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<"idle" | "uploading" | "error" | "success">("idle");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);

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
        fetchImages();
    }, []);

    const fetchImages = async () => {
        setLoading(true);
        try {
            const q = query(collection(getDb(), "about_images"), orderBy("uploadedAt", "desc"));
            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map(doc => ({
                id: doc.id,
                url: doc.data().url
            }));
            setImages(data);
        } catch (error) {
            console.error("Error fetching about images:", error);
        }
        setLoading(false);
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;
        setStatus("uploading");
        setErrorMessage(null);
        setProgress(10);

        try {
            const { signedUrl, key } = await getPresignedUrl(file.name, file.type);
            setProgress(30);

            const uploadResponse = await fetch(signedUrl, {
                method: "PUT",
                body: file,
                headers: { "Content-Type": file.type },
            });

            if (!uploadResponse.ok) throw new Error("R2 Upload failed.");
            setProgress(70);

            const publicBaseUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.replace(/\/$/, "");
            const finalUrl = `${publicBaseUrl}/${key}`;

            await addDoc(collection(getDb(), "about_images"), {
                url: finalUrl,
                uploadedAt: new Date()
            });

            setFile(null);
            setStatus("success");
            setProgress(100);
            fetchImages();
            setTimeout(() => setStatus("idle"), 2000);
        } catch (error: unknown) {
            console.error("AboutManager: Error adding image:", error);
            setStatus("error");
            setErrorMessage(error instanceof Error ? error.message : "Upload failed.");
        }
    };

    const handleDelete = async (id: string) => {
        const confirmed = window.confirm("Remove this image from the marquee?");
        if (!confirmed) return;
        try {
            await deleteDoc(doc(getDb(), "about_images", id));
            fetchImages();
        } catch (error) {
            console.error("AboutManager: Error deleting image:", error);
        }
    };

    return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "3rem" }}>
            {/* Sidebar */}
            <div>
                <div className="glass" style={{ padding: "2.5rem", borderRadius: "32px", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <h2 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "1.5rem" }}>About Marquee</h2>
                    <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.4)", marginBottom: "2rem", lineHeight: 1.6 }}>
                        Upload portraits to the &quot;Who We Are&quot; scrolling grid on the about page.
                    </p>

                    <form onSubmit={handleUpload} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                        <div
                            onClick={() => document.getElementById('about-upload')?.click()}
                            style={{
                                border: "2px dashed rgba(255,255,255,0.1)",
                                borderRadius: "16px",
                                padding: "2rem",
                                textAlign: "center",
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                                minHeight: "150px",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center"
                            }}
                        >
                            <input
                                id="about-upload"
                                type="file"
                                accept="image/*"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                style={{ display: "none" }}
                            />
                            {previewUrl ? (
                                <img src={previewUrl} alt="Preview" style={{ width: "100%", height: "120px", objectFit: "cover", borderRadius: "12px" }} />
                            ) : (
                                <>
                                    <Upload size={24} style={{ color: "rgba(255,255,255,0.4)", marginBottom: "0.8rem" }} />
                                    <span style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.4)" }}>Click to select portrait</span>
                                </>
                            )}
                        </div>

                        {status === "uploading" && (
                            <div style={{ width: "100%", height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "10px", overflow: "hidden" }}>
                                <div style={{ width: `${progress}%`, height: "100%", background: "var(--accent)", transition: "width 0.3s ease" }} />
                            </div>
                        )}

                        <button type="submit" disabled={!file || status === "uploading"} style={{
                            background: "var(--accent)",
                            color: "#000",
                            border: "none",
                            borderRadius: "16px",
                            padding: "1.2rem",
                            fontWeight: 900,
                            textTransform: "uppercase",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            opacity: (!file || status === "uploading") ? 0.3 : 1
                        }}>
                             {status === "uploading" ? `Uploading ${progress}%` : "Add to Marquee"}
                        </button>
                    </form>
                </div>
            </div>

            {/* Gallery */}
            <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: "32px", padding: "2.5rem", border: "1px solid rgba(255,255,255,0.04)" }}>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "2rem" }}>Active Marquee ({images.length})</h2>
                {loading ? (
                    <p style={{ color: "rgba(255,255,255,0.4)" }}>Loading images...</p>
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "1rem" }}>
                        {images.map(img => (
                            <div key={img.id} style={{ position: "relative", height: "200px", borderRadius: "16px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)" }}>
                                <img src={img.url} alt="Marquee Content" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                <button 
                                    onClick={() => handleDelete(img.id)}
                                    style={{
                                        position: "absolute",
                                        top: "0.5rem",
                                        right: "0.5rem",
                                        background: "rgba(239, 68, 68, 0.9)",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "50%",
                                        width: "28px",
                                        height: "28px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        cursor: "pointer",
                                        transition: "all 0.3s ease"
                                    }}
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
