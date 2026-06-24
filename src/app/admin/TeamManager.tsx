"use client";

import { useEffect, useState } from "react";
import type React from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { Check, Edit2, Image as ImageIcon, Loader2, Mail, Plus, Trash2, Upload, User, X } from "lucide-react";
import { getPresignedUrl } from "@/app/actions/upload";
import { getDb } from "@/lib/firebase";
import type { TeamMember } from "@/lib/team-members";

const emptyMember: TeamMember = {
  name: "",
  role: "",
  email: "",
  image: "",
  order: 0,
};

export default function TeamManager() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [form, setForm] = useState<TeamMember>(emptyMember);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    if (!pendingFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(pendingFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [pendingFile]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(getDb(), "team_members"), orderBy("order", "asc")));
      setMembers(snap.docs.map((item) => ({ id: item.id, ...item.data() } as TeamMember)));
    } catch (error) {
      console.error("Error fetching team members:", error);
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (file: File) => {
    setUploading(true);
    try {
      const { signedUrl, key } = await getPresignedUrl(file.name, file.type, "team");
      const res = await fetch(signedUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      if (!res.ok) throw new Error("Upload failed");
      const publicBaseUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.replace(/\/$/, "");
      if (!publicBaseUrl) throw new Error("NEXT_PUBLIC_R2_PUBLIC_URL is not configured");
      return `${publicBaseUrl}/${key}`;
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setForm(emptyMember);
    setPendingFile(null);
    setEditingId(null);
    setIsOpen(false);
  };

  const openCreate = () => {
    setForm({ ...emptyMember, order: members.length });
    setPendingFile(null);
    setEditingId(null);
    setIsOpen(true);
  };

  const openEdit = (member: TeamMember) => {
    setForm({ ...emptyMember, ...member });
    setPendingFile(null);
    setEditingId(member.id || null);
    setIsOpen(true);
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim() || !form.role.trim() || !form.email.trim()) return;

    setSaving(true);
    try {
      let imageUrl = form.image?.trim() || "";
      if (pendingFile) {
        imageUrl = await uploadImage(pendingFile);
      }

      const payload = {
        name: form.name.trim(),
        role: form.role.trim(),
        email: form.email.trim(),
        image: imageUrl,
        order: Number(form.order) || 0,
        updatedAt: new Date(),
      };

      if (editingId) {
        await updateDoc(doc(getDb(), "team_members", editingId), payload);
      } else {
        await addDoc(collection(getDb(), "team_members"), {
          ...payload,
          createdAt: new Date(),
        });
      }

      resetForm();
      fetchMembers();
    } catch (error) {
      console.error("Error saving team member:", error);
      alert("Could not save team member. Check your image upload and try again.");
    } finally {
      setSaving(false);
    }
  };

  const removeMember = async (id: string) => {
    if (!confirm("Remove this team member from the About page?")) return;
    try {
      await deleteDoc(doc(getDb(), "team_members", id));
      fetchMembers();
    } catch (error) {
      console.error("Error deleting team member:", error);
    }
  };

  const photoPreview = previewUrl || form.image || null;
  const isBusy = saving || uploading;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "1.5rem", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap" }}>
        <div>
          <h2 style={{ fontSize: "clamp(1.5rem, 4vw, 2.2rem)", fontWeight: 900, textTransform: "uppercase" }}>Meet the Team</h2>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.92rem", maxWidth: "52ch", lineHeight: 1.6 }}>
            Add photos, names, roles, and emails. Images upload to Cloudflare R2 and profiles save to Firestore for the About page.
          </p>
        </div>
        <button type="button" onClick={() => (isOpen ? resetForm() : openCreate())} style={primaryButtonStyle}>
          {isOpen ? <X size={18} /> : <Plus size={18} />}
          {isOpen ? "Cancel" : "Add Team Member"}
        </button>
      </div>

      {isOpen && (
        <form onSubmit={handleSave} className="glass" style={{ padding: "2rem", borderRadius: "24px", marginBottom: "2rem", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(220px, 280px) 1fr", gap: "2rem" }} className="team-form-grid">
            <div style={{ display: "grid", gap: "1rem" }}>
              <span style={{ fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.45)" }}>
                Photo
              </span>
              <label
                htmlFor="team-photo-upload"
                style={{
                  aspectRatio: "1",
                  borderRadius: "24px",
                  border: "2px dashed rgba(255,255,255,0.14)",
                  background: "rgba(255,255,255,0.03)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: isBusy ? "wait" : "pointer",
                  overflow: "hidden",
                }}
              >
                {photoPreview ? (
                  <img src={photoPreview} alt="Team preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <>
                    <Upload size={28} color="rgba(255,255,255,0.28)" />
                    <span style={{ marginTop: "0.75rem", fontSize: "0.78rem", fontWeight: 800, color: "rgba(255,255,255,0.38)", textTransform: "uppercase" }}>
                      Click to upload
                    </span>
                  </>
                )}
                <input
                  id="team-photo-upload"
                  type="file"
                  accept="image/*"
                  disabled={isBusy}
                  onChange={(event) => setPendingFile(event.target.files?.[0] || null)}
                  style={{ display: "none" }}
                />
              </label>
              {uploading && (
                <p style={{ fontSize: "0.78rem", color: "var(--accent)", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.45rem" }}>
                  <Loader2 size={14} className="animate-spin" /> Uploading to Cloudflare...
                </p>
              )}
            </div>

            <div style={{ display: "grid", gap: "1rem", alignContent: "start" }}>
              <Field label="Full name" icon={<User size={15} />}>
                <input
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  placeholder="e.g. Alex Morgan"
                  required
                  style={inputStyle}
                />
              </Field>

              <Field label="Role / title" icon={<ImageIcon size={15} />}>
                <input
                  value={form.role}
                  onChange={(event) => setForm({ ...form, role: event.target.value })}
                  placeholder="e.g. Founder / Strategy Lead"
                  required
                  style={inputStyle}
                />
              </Field>

              <Field label="Email" icon={<Mail size={15} />}>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  placeholder="e.g. campaigns@beyondvisionltd.org"
                  required
                  style={inputStyle}
                />
              </Field>

              <Field label="Display order">
                <input
                  type="number"
                  value={form.order ?? 0}
                  onChange={(event) => setForm({ ...form, order: Number(event.target.value) })}
                  placeholder="0"
                  style={inputStyle}
                />
              </Field>

              <button type="submit" disabled={isBusy} style={{ ...primaryButtonStyle, marginTop: "0.5rem", opacity: isBusy ? 0.65 : 1, cursor: isBusy ? "wait" : "pointer" }}>
                {isBusy ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                {saving ? "Saving..." : uploading ? "Uploading photo..." : editingId ? "Save changes" : "Add to About page"}
              </button>
            </div>
          </div>
        </form>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1rem" }}>
        {loading ? (
          <div style={{ color: "rgba(255,255,255,0.35)", padding: "3rem" }}>Loading team...</div>
        ) : members.length === 0 ? (
          <div className="glass" style={{ padding: "3rem", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.45)", gridColumn: "1 / -1" }}>
            No team members yet. Click &quot;Add Team Member&quot; to publish the Meet the Team section.
          </div>
        ) : (
          members.map((member) => (
            <article key={member.id} className="glass" style={{ padding: "1.25rem", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.06)", display: "grid", gap: "1rem" }}>
              <div style={{ aspectRatio: "1", borderRadius: "18px", overflow: "hidden", background: "rgba(255,255,255,0.04)", display: "grid", placeItems: "center" }}>
                {member.image ? (
                  <img src={member.image} alt={member.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span style={{ fontSize: "0.72rem", fontWeight: 900, color: "rgba(255,255,255,0.25)", letterSpacing: "0.08em" }}>PHOTO TBC</span>
                )}
              </div>
              <div>
                <h3 style={{ fontSize: "0.95rem", fontWeight: 900, textTransform: "uppercase" }}>{member.name}</h3>
                <p style={{ color: "var(--accent)", fontSize: "0.72rem", fontWeight: 900, textTransform: "uppercase", marginTop: "0.35rem" }}>{member.role}</p>
                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.78rem", marginTop: "0.55rem" }}>{member.email}</p>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button type="button" onClick={() => openEdit(member)} style={iconButtonStyle}>
                  <Edit2 size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => member.id && removeMember(member.id)}
                  style={{ ...iconButtonStyle, color: "#ff6b7a", borderColor: "rgba(255,71,87,0.2)", background: "rgba(255,71,87,0.08)" }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .team-form-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: "grid", gap: "0.45rem" }}>
      <span style={{ fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.45)", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
        {icon}
        {label}
      </span>
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "1rem 1.1rem",
  borderRadius: "14px",
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.03)",
  color: "#fff",
  outline: "none",
  fontWeight: 700,
  cursor: "text",
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
