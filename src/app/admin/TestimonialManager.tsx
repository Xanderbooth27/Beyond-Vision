"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import { Plus, Trash, Edit2, X, Check } from "lucide-react";

export type Testimonial = {
    id?: string;
    type: "client" | "creator";
    name: string;
    brand: string;
    quote: string;
    createdAt?: string;
};

export default function TestimonialManager() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<Partial<Testimonial> | null>(null);

    useEffect(() => {
        fetchTestimonials();
    }, []);

    const fetchTestimonials = async () => {
        try {
            const q = query(collection(getDb(), "testimonials"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Testimonial));
            setTestimonials(data);
        } catch (error) {
            console.error("Error fetching testimonials:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!editing?.name || !editing?.quote || !editing?.type) return;

        try {
            const payload = {
                ...editing,
                createdAt: editing.createdAt || new Date().toISOString()
            };

            if (editing.id) {
                await updateDoc(doc(getDb(), "testimonials", editing.id), payload);
            } else {
                await addDoc(collection(getDb(), "testimonials"), payload);
            }
            
            setEditing(null);
            fetchTestimonials();
        } catch (error) {
            console.error("Error saving testimonial:", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this testimonial?")) return;
        try {
            await deleteDoc(doc(getDb(), "testimonials", id));
            fetchTestimonials();
        } catch (error) {
            console.error("Error deleting testimonial:", error);
        }
    };

    if (loading) return <div style={{ color: "rgba(255,255,255,0.5)", padding: "2rem" }}>Loading testimonials...</div>;

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <div>
                    <h2 style={{ fontSize: "1.5rem", fontWeight: 900, textTransform: "uppercase" }}>Testimonial Database</h2>
                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem" }}>Manage client and creator quotes.</p>
                </div>
                <button 
                    onClick={() => setEditing({ type: "client", name: "", brand: "", quote: "" })}
                    style={{ background: "var(--accent)", color: "#000", padding: "0.8rem 1.5rem", borderRadius: "100px", fontWeight: 900, display: "flex", alignItems: "center", gap: "0.5rem", border: "none", cursor: "pointer" }}
                >
                    <Plus size={16} /> Add Testimonial
                </button>
            </div>

            {editing && (
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "24px", padding: "2rem", marginBottom: "3rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                        <h3 style={{ fontSize: "1.2rem", fontWeight: 900 }}>{editing.id ? "Edit Testimonial" : "New Testimonial"}</h3>
                        <button onClick={() => setEditing(null)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer" }}><X size={24} /></button>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginBottom: "2rem" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 900, color: "rgba(255,255,255,0.5)", marginBottom: "0.8rem", textTransform: "uppercase" }}>Type</label>
                            <select 
                                value={editing.type} 
                                onChange={(e) => setEditing({ ...editing, type: e.target.value as "client" | "creator" })}
                                style={{ width: "100%", padding: "1rem", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff", outline: "none", fontSize: "0.9rem" }}
                            >
                                <option value="client">Client</option>
                                <option value="creator">Creator</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 900, color: "rgba(255,255,255,0.5)", marginBottom: "0.8rem", textTransform: "uppercase" }}>Name / Handle</label>
                            <input 
                                value={editing.name || ""} 
                                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                                placeholder="e.g. John Doe or @handle"
                                style={{ width: "100%", padding: "1rem", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff", outline: "none", fontSize: "0.9rem" }}
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 900, color: "rgba(255,255,255,0.5)", marginBottom: "0.8rem", textTransform: "uppercase" }}>Brand / Role</label>
                            <input 
                                value={editing.brand || ""} 
                                onChange={(e) => setEditing({ ...editing, brand: e.target.value })}
                                placeholder="e.g. Nike (or CREATOR)"
                                style={{ width: "100%", padding: "1rem", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff", outline: "none", fontSize: "0.9rem" }}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: "2rem" }}>
                        <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 900, color: "rgba(255,255,255,0.5)", marginBottom: "0.8rem", textTransform: "uppercase" }}>Quote</label>
                        <textarea 
                            value={editing.quote || ""} 
                            onChange={(e) => setEditing({ ...editing, quote: e.target.value })}
                            placeholder="Enter the testimonial quote..."
                            style={{ width: "100%", padding: "1rem", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff", outline: "none", fontSize: "0.9rem", minHeight: "100px", resize: "vertical" }}
                        />
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button 
                            onClick={handleSave}
                            style={{ background: "var(--accent)", color: "#000", padding: "1rem 2.5rem", borderRadius: "100px", fontWeight: 900, display: "flex", alignItems: "center", gap: "0.5rem", border: "none", cursor: "pointer" }}
                        >
                            <Check size={18} /> Save Testimonial
                        </button>
                    </div>
                </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem" }}>
                {testimonials.map((t) => (
                    <div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.5rem", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px" }}>
                        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "100px 200px 1fr", gap: "2rem", alignItems: "center" }}>
                            <div style={{ fontSize: "0.7rem", fontWeight: 900, padding: "0.4rem 0.8rem", background: t.type === "client" ? "rgba(255,246,117,0.1)" : "rgba(255,255,255,0.1)", color: t.type === "client" ? "var(--accent)" : "#fff", borderRadius: "100px", textTransform: "uppercase", textAlign: "center", width: "fit-content" }}>
                                {t.type}
                            </div>
                            <div>
                                <div style={{ fontSize: "0.9rem", fontWeight: 800 }}>{t.name}</div>
                                <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>{t.brand}</div>
                            </div>
                            <div style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.7)", fontStyle: "italic", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "400px" }}>
                                &quot;{t.quote}&quot;
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button onClick={() => setEditing(t)} style={{ padding: "0.8rem", background: "rgba(255,255,255,0.05)", border: "none", borderRadius: "12px", color: "#fff", cursor: "pointer" }}>
                                <Edit2 size={16} />
                            </button>
                            <button onClick={() => handleDelete(t.id!)} style={{ padding: "0.8rem", background: "rgba(255,50,50,0.1)", border: "none", borderRadius: "12px", color: "#ff5555", cursor: "pointer" }}>
                                <Trash size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
