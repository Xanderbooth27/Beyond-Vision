"use client";

import { useEffect, useMemo, useState } from "react";
import type React from "react";
import Link from "next/link";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { AlertCircle, Check, ExternalLink, Image as ImageIcon, Layout, Loader2, Plus, Save, Trash2, Upload } from "lucide-react";
import { getPresignedUrl } from "@/app/actions/upload";
import { getDb } from "@/lib/firebase";
import { FieldSchema, PAGE_DEFINITIONS, getPageDefinition, type ContentObject, type ContentValue } from "@/lib/content-defaults";

export default function ContentManager() {
  const [activePage, setActivePage] = useState("home");
  const [content, setContent] = useState<Record<string, ContentValue>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  const page = useMemo(() => getPageDefinition(activePage) || PAGE_DEFINITIONS[0], [activePage]);

  useEffect(() => {
    fetchContent();
  }, [activePage]);

  const fetchContent = async () => {
    setLoading(true);
    setStatus("idle");
    try {
      const docSnap = await getDoc(doc(getDb(), "site_content", activePage));
      setContent({ ...page.defaults, ...(docSnap.exists() ? docSnap.data() : {}) });
    } catch (error) {
      console.error("Error fetching content:", error);
      setContent(page.defaults);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setStatus("idle");
    try {
      await setDoc(doc(getDb(), "site_content", activePage), {
        ...content,
        pageId: activePage,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2500);
    } catch (error) {
      console.error("Error saving:", error);
      setStatus("error");
    } finally {
      setSaving(false);
    }
  };

  const updateField = (key: string, value: ContentValue) => {
    setContent((prev) => ({ ...prev, [key]: value }));
  };

  const uploadFile = async (fieldPath: string, file: File, onDone: (url: string) => void) => {
    setUploadingField(fieldPath);
    try {
      const { signedUrl, key } = await getPresignedUrl(file.name, file.type);
      const uploadResponse = await fetch(signedUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      if (!uploadResponse.ok) throw new Error("Upload failed");
      const publicBaseUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.replace(/\/$/, "");
      if (!publicBaseUrl) throw new Error("NEXT_PUBLIC_R2_PUBLIC_URL is not configured");
      onDone(`${publicBaseUrl}/${key}`);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed. Check R2 settings and try again.");
    } finally {
      setUploadingField(null);
    }
  };

  return (
    <div className="cms-layout" style={{ display: "grid", gridTemplateColumns: "310px 1fr", gap: "3rem", minHeight: "80vh" }}>
      <aside className="cms-sidebar" style={{ position: "sticky", top: "2rem", alignSelf: "start", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <div style={{ padding: "0 0.8rem 1rem" }}>
          <h2 style={{ fontSize: "0.72rem", fontWeight: 900, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "3px" }}>Page Editors</h2>
        </div>
        <div className="cms-nav" style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: "62vh", overflow: "auto", paddingRight: "0.25rem" }}>
          {PAGE_DEFINITIONS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              style={{
                padding: "1rem 1.15rem",
                borderRadius: "14px",
                background: activePage === item.id ? "rgba(255,246,117,0.1)" : "rgba(255,255,255,0.025)",
                color: activePage === item.id ? "var(--accent)" : "rgba(255,255,255,0.55)",
                border: `1px solid ${activePage === item.id ? "rgba(255,246,117,0.22)" : "rgba(255,255,255,0.06)"}`,
                textAlign: "left",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.8rem",
                fontSize: "0.8rem",
                fontWeight: 900,
              }}
            >
              <Layout size={15} />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.label}</span>
            </button>
          ))}
        </div>
        <button onClick={handleSave} disabled={saving || loading} style={saveButtonStyle(status)}>
          {saving ? <Loader2 className="animate-spin" size={18} /> : status === "saved" ? <Check size={18} /> : status === "error" ? <AlertCircle size={18} /> : <Save size={18} />}
          {saving ? "SAVING" : status === "saved" ? "SAVED" : status === "error" ? "RETRY SAVE" : "SAVE PAGE"}
        </button>
      </aside>

      <section className="glass cms-editor" style={{ padding: "3rem", borderRadius: "32px", border: "1px solid rgba(255,255,255,0.06)" }}>
        <header style={{ display: "flex", justifyContent: "space-between", gap: "2rem", alignItems: "flex-start", marginBottom: "3rem" }}>
          <div>
            <p style={{ color: "var(--accent)", fontSize: "0.72rem", fontWeight: 900, letterSpacing: "3px", textTransform: "uppercase", marginBottom: "0.8rem" }}>{page.path}</p>
            <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", textTransform: "uppercase", fontWeight: 900, letterSpacing: "-0.04em" }}>{page.label}</h1>
          </div>
          {page.path !== "shared" && (
            <Link href={page.path} target="_blank" style={{ color: "var(--accent)", display: "inline-flex", gap: "0.5rem", alignItems: "center", fontWeight: 900, fontSize: "0.75rem", textTransform: "uppercase" }}>
              View Page <ExternalLink size={15} />
            </Link>
          )}
        </header>

        {loading ? (
          <div style={{ padding: "7rem 0", textAlign: "center", color: "rgba(255,255,255,0.35)" }}>
            <Loader2 className="animate-spin" size={30} style={{ margin: "0 auto 1rem" }} />
            <p style={{ fontSize: "0.75rem", fontWeight: 900, letterSpacing: "2px" }}>LOADING PAGE DATA</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {page.fields.map((field) => (
              <FieldEditor
                key={field.key}
                field={field}
                value={content[field.key]}
                onUpdate={(value) => updateField(field.key, value)}
                uploadFile={uploadFile}
                uploadingField={uploadingField}
                fieldPath={field.key}
              />
            ))}
          </div>
        )}
      </section>

      <style jsx>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 1024px) {
          .cms-layout { grid-template-columns: 1fr !important; }
          .cms-sidebar { position: static !important; }
          .cms-nav { flex-direction: row !important; max-height: none !important; overflow-x: auto !important; padding-bottom: 0.75rem !important; }
          .cms-nav button { min-width: 220px !important; }
          .cms-editor { padding: 1.5rem !important; border-radius: 24px !important; }
        }
      `}</style>
    </div>
  );
}

function FieldEditor({
  field,
  value,
  onUpdate,
  uploadFile,
  uploadingField,
  fieldPath,
}: {
  field: FieldSchema;
  value: ContentValue | undefined;
  onUpdate: (value: ContentValue) => void;
  uploadFile: (fieldPath: string, file: File, onDone: (url: string) => void) => void;
  uploadingField: string | null;
  fieldPath: string;
}) {
  const type = field.type || guessType(field.key);
  const stringValue = typeof value === "string" ? value : "";

  if (type === "array:text") {
    const items = Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
    return (
      <FieldShell field={field}>
        <div style={{ display: "grid", gap: "0.85rem" }}>
          {items.map((item, index) => (
            <div key={index} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "0.75rem" }}>
              <input value={item || ""} onChange={(event) => onUpdate(items.map((entry, idx) => idx === index ? event.target.value : entry))} style={inputStyle} />
              <IconButton onClick={() => onUpdate(items.filter((_, idx) => idx !== index))}><Trash2 size={15} /></IconButton>
            </div>
          ))}
          <AddButton onClick={() => onUpdate([...items, ""])} label="Add Item" />
        </div>
      </FieldShell>
    );
  }

  if (type === "array:object") {
    const items = Array.isArray(value) ? value.filter(isContentObject) : [];
    const itemFields = field.itemFields || [];
    return (
      <FieldShell field={field}>
        <div style={{ display: "grid", gap: "1rem" }}>
          {items.map((item, index) => (
            <div key={index} style={{ padding: "1.25rem", borderRadius: "20px", background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", display: "grid", gap: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem", letterSpacing: "2px", textTransform: "uppercase" }}>Card {index + 1}</strong>
                <IconButton onClick={() => onUpdate(items.filter((_, idx) => idx !== index))}><Trash2 size={15} /></IconButton>
              </div>
              {itemFields.map((subField) => (
                <FieldEditor
                  key={subField.key}
                  field={subField}
                  value={item[subField.key] || ""}
                  onUpdate={(nextValue) => onUpdate(items.map((entry, idx) => idx === index ? { ...entry, [subField.key]: nextValue } : entry))}
                  uploadFile={uploadFile}
                  uploadingField={uploadingField}
                  fieldPath={`${fieldPath}.${index}.${subField.key}`}
                />
              ))}
            </div>
          ))}
          <AddButton onClick={() => onUpdate([...items, createEmptyObject(itemFields)])} label="Add Card" />
        </div>
      </FieldShell>
    );
  }

  if (type === "image") {
    return (
      <FieldShell field={field}>
        <div className="image-editor" style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: "1.25rem", alignItems: "center" }}>
          <div style={{ width: "180px", height: "120px", borderRadius: "16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {stringValue ? <img src={stringValue} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <ImageIcon size={28} color="rgba(255,255,255,0.18)" />}
          </div>
          <div style={{ display: "grid", gap: "0.8rem" }}>
            <input value={stringValue} onChange={(event) => onUpdate(event.target.value)} placeholder="Image or media URL" style={inputStyle} />
            <label style={{ ...uploadButtonStyle, opacity: uploadingField === fieldPath ? 0.5 : 1 }}>
              {uploadingField === fieldPath ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
              {uploadingField === fieldPath ? "Uploading" : "Upload File"}
              <input type="file" accept="image/*,video/*" style={{ display: "none" }} onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) uploadFile(fieldPath, file, onUpdate);
              }} />
            </label>
          </div>
          <style jsx>{`
            @media (max-width: 720px) {
              .image-editor { grid-template-columns: 1fr !important; }
            }
          `}</style>
        </div>
      </FieldShell>
    );
  }

  return (
    <FieldShell field={field}>
      {type === "textarea" ? (
        <textarea value={stringValue} onChange={(event) => onUpdate(event.target.value)} style={{ ...inputStyle, minHeight: "130px", resize: "vertical" }} />
      ) : (
        <input value={stringValue} onChange={(event) => onUpdate(event.target.value)} style={inputStyle} />
      )}
    </FieldShell>
  );
}

function FieldShell({ field, children }: { field: FieldSchema; children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gap: "0.8rem" }}>
      <label style={labelStyle}>{field.label}</label>
      {children}
    </div>
  );
}

function IconButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} type="button" style={{ width: "44px", borderRadius: "12px", border: "1px solid rgba(255,71,87,0.2)", background: "rgba(255,71,87,0.08)", color: "#ff6b7a", cursor: "pointer", display: "grid", placeItems: "center" }}>
      {children}
    </button>
  );
}

function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} type="button" style={{ padding: "1rem", borderRadius: "14px", border: "1px dashed rgba(255,255,255,0.18)", background: "rgba(255,255,255,0.03)", color: "#fff", cursor: "pointer", fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", textTransform: "uppercase", fontSize: "0.72rem", letterSpacing: "1px" }}>
      <Plus size={16} /> {label}
    </button>
  );
}

function guessType(key: string): FieldSchema["type"] {
  if (key.includes("image") || key.includes("thumbnail") || key.includes("logo") || key.includes("video")) return "image";
  if (key.includes("text") || key.includes("body") || key.includes("description") || key.includes("paragraph") || key.includes("statement")) return "textarea";
  return "text";
}

function createEmptyObject(fields: FieldSchema[]): ContentObject {
  return Object.fromEntries(fields.map((field) => [field.key, field.type === "array:text" ? [] : ""]));
}

function isContentObject(value: unknown): value is ContentObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const labelStyle = {
  fontSize: "0.72rem",
  fontWeight: 900,
  color: "rgba(255,255,255,0.42)",
  textTransform: "uppercase" as const,
  letterSpacing: "2px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "1rem 1.15rem",
  background: "rgba(255,255,255,0.025)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "14px",
  color: "#fff",
  outline: "none",
  fontSize: "0.95rem",
  fontWeight: 600,
};

const uploadButtonStyle: React.CSSProperties = {
  width: "fit-content",
  padding: "0.9rem 1.2rem",
  borderRadius: "999px",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "#fff",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "0.6rem",
  fontSize: "0.72rem",
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: "1px",
};

function saveButtonStyle(status: "idle" | "saved" | "error"): React.CSSProperties {
  return {
    marginTop: "1rem",
    width: "100%",
    padding: "1.15rem",
    borderRadius: "999px",
    background: status === "saved" ? "#22c55e" : status === "error" ? "#ff6b7a" : "var(--accent)",
    color: "#000",
    border: "none",
    fontWeight: 900,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.65rem",
    textTransform: "uppercase",
    letterSpacing: "1px",
  };
}
