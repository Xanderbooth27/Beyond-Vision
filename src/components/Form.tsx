"use client";

import React from "react";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

export function FormInput({ label, style, ...props }: FormInputProps) {
    return (
        <div className="form-field" style={{ position: "relative", width: "100%" }}>
            <label style={labelStyle}>{label}</label>
            <input {...props} style={{ ...inputStyle, ...style }} />
        </div>
    );
}

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
}

export function FormTextarea({ label, style, ...props }: FormTextareaProps) {
    return (
        <div className="form-field" style={{ position: "relative", width: "100%" }}>
            <label style={labelStyle}>{label}</label>
            <textarea {...props} style={{ ...inputStyle, minHeight: "150px", resize: "vertical", ...style }} />
        </div>
    );
}

const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.75rem",
    fontWeight: 900,
    color: "var(--bv-muted)",
    marginBottom: "0.8rem",
    textTransform: "uppercase",
    letterSpacing: "0.12em"
};

const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "var(--bv-surface)",
    border: "1px solid var(--bv-border)",
    borderRadius: "var(--bv-radius-md)",
    padding: "1.25rem 1.5rem",
    color: "#fff",
    fontSize: "1rem",
    fontWeight: 600,
    outline: "none",
    transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
    textTransform: "uppercase",
    letterSpacing: "1px"
};
