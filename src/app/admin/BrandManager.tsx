"use client";

import { useEffect, useState } from "react";
import type React from "react";
import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, updateDoc } from "firebase/firestore";
import { Check, Edit2, Image as ImageIcon, Plus, Trash2, Upload, X } from "lucide-react";
import { getPresignedUrl } from "@/app/actions/upload";
import { getDb } from "@/lib/firebase";

type BrandLogo = {
  id?: string;
  name: string;
  logo: string;
  website?: string;
  order?: number;
  createdAt?: unknown;
};

const emptyBrand: BrandLogo = {
  name: "",
  logo: "",
  website: "",
  order: 0,
};

export default function BrandManager() {
  const [brands, setBrands] = useState<BrandLogo[]>([]);
  const [form, setForm] = useState<BrandLogo>(emptyBrand);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(getDb(), "brand_logos"), orderBy("order", "asc")));
      setBrands(snap.docs.map((item) => ({ id: item.id, ...item.data() } as BrandLogo)));
    } catch (error) {
      console.error("Error fetching brands:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { signedUrl, key } = await getPresignedUrl(file.name, file.type);
      const res = await fetch(signedUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
      if (!res.ok) throw new Error("Upload failed");
      const publicBaseUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.replace(/\/$/, "");
      setForm((prev) => ({ ...prev, logo: `${publicBaseUrl}/${key}` }));
    } catch (error) {
      console.error("Brand upload failed:", error);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const saveBrand = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload = { ...form, order: Number(form.order) || 0 };
    try {
      if (editingId) {
        await updateDoc(doc(getDb(), "brand_logos", editingId), { ...payload, updatedAt: new Date() });
      } else {
        await addDoc(collection(getDb(), "brand_logos"), { ...payload, createdAt: new Date() });
      }
      setForm(emptyBrand);
      setEditingId(null);
      setIsOpen(false);
      fetchBrands();
    } catch (error) {
      console.error("Error saving brand:", error);
    }
  };

  const editBrand = (brand: BrandLogo) => {
    setForm({ ...emptyBrand, ...brand });
    setEditingId(brand.id || null);
    setIsOpen(true);
  };

  const removeBrand = async (id: string) => {
    if (!confirm("Delete this brand logo?")) return;
    await deleteDoc(doc(getDb(), "brand_logos", id));
    fetchBrands();
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "1.5rem", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h2 style={{ fontSize: "clamp(1.5rem, 4vw, 2.2rem)", fontWeight: 900, textTransform: "uppercase" }}>Brand Logos</h2>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.9rem" }}>Feeds every Brands We Work With ticker and partner section.</p>
        </div>
        <button onClick={() => { setIsOpen(!isOpen); setEditingId(null); setForm(emptyBrand); }} style={primaryButtonStyle}>
          {isOpen ? <X size={18} /> : <Plus size={18} />}
          {isOpen ? "Cancel" : "Add Brand"}
        </button>
      </div>

      {isOpen && (
        <form onSubmit={saveBrand} className="glass" style={{ padding: "2rem", borderRadius: "24px", marginBottom: "2rem", border: "1px solid rgba(255,255,255,0.08)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
          <div style={{ display: "grid", gap: "1rem" }}>
            <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Brand name" required style={inputStyle} />
            <input value={form.website || ""} onChange={(event) => setForm({ ...form, website: event.target.value })} placeholder="Website URL" style={inputStyle} />
            <input value={form.order || 0} onChange={(event) => setForm({ ...form, order: Number(event.target.value) })} placeholder="Sort order" type="number" style={inputStyle} />
            <input value={form.logo} onChange={(event) => setForm({ ...form, logo: event.target.value })} placeholder="Logo URL" style={inputStyle} />
          </div>
          <div style={{ display: "grid", gap: "1rem" }}>
            <label style={{ height: "160px", borderRadius: "20px", border: "1px dashed rgba(255,255,255,0.16)", background: "rgba(255,255,255,0.03)", display: "grid", placeItems: "center", cursor: "pointer", overflow: "hidden" }}>
              {form.logo ? <img src={form.logo} alt="" style={{ maxWidth: "80%", maxHeight: "90px", objectFit: "contain" }} /> : <ImageIcon size={30} color="rgba(255,255,255,0.25)" />}
              <input type="file" accept="image/*" onChange={handleUpload} style={{ display: "none" }} />
            </label>
            <button type="button" disabled={uploading} onClick={() => document.querySelector<HTMLInputElement>("#brand-upload-hidden")?.click()} style={{ display: "none" }} />
            <label style={secondaryButtonStyle}>
              <Upload size={16} /> {uploading ? "Uploading..." : "Upload Logo"}
              <input id="brand-upload-hidden" type="file" accept="image/*" onChange={handleUpload} style={{ display: "none" }} />
            </label>
            <button type="submit" style={primaryButtonStyle}>
              <Check size={18} /> {editingId ? "Save Brand" : "Create Brand"}
            </button>
          </div>
        </form>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1rem" }}>
        {loading ? (
          <div style={{ color: "rgba(255,255,255,0.35)", padding: "3rem" }}>Loading brands...</div>
        ) : brands.map((brand) => (
          <article key={brand.id} className="glass" style={{ padding: "1.25rem", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.06)", display: "grid", gap: "1rem" }}>
            <div style={{ height: "90px", borderRadius: "16px", background: "rgba(255,255,255,0.03)", display: "grid", placeItems: "center" }}>
              {brand.logo ? <img src={brand.logo} alt={`${brand.name} logo`} style={{ maxWidth: "78%", maxHeight: "54px", objectFit: "contain" }} /> : <ImageIcon size={24} color="rgba(255,255,255,0.2)" />}
            </div>
            <div>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 900, textTransform: "uppercase" }}>{brand.name}</h3>
              <p style={{ color: "rgba(255,255,255,0.32)", fontSize: "0.72rem", marginTop: "0.35rem" }}>Order {brand.order || 0}</p>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button onClick={() => editBrand(brand)} style={iconButtonStyle}><Edit2 size={15} /></button>
              <button onClick={() => removeBrand(brand.id!)} style={{ ...iconButtonStyle, color: "#ff6b7a", borderColor: "rgba(255,71,87,0.2)", background: "rgba(255,71,87,0.08)" }}><Trash2 size={15} /></button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "1rem",
  borderRadius: "14px",
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.03)",
  color: "#fff",
  outline: "none",
  fontWeight: 700,
};

const primaryButtonStyle: React.CSSProperties = {
  background: "var(--accent)",
  color: "#000",
  border: "none",
  borderRadius: "999px",
  padding: "1rem 1.5rem",
  fontWeight: 900,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.6rem",
  textTransform: "uppercase",
  fontSize: "0.75rem",
};

const secondaryButtonStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.06)",
  color: "#fff",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "999px",
  padding: "1rem 1.5rem",
  fontWeight: 900,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.6rem",
  textTransform: "uppercase",
  fontSize: "0.75rem",
};

const iconButtonStyle: React.CSSProperties = {
  width: "40px",
  height: "40px",
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.04)",
  color: "#fff",
  cursor: "pointer",
  display: "grid",
  placeItems: "center",
};
