"use client";

import { useState, useEffect, Suspense, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import { getPageContent } from "@/lib/cms";
import { CONTACT_EMAIL } from "@/lib/content-defaults";
import {
    TALENT_INTERESTS,
    BRAND_INTERESTS,
    BRAND_SERVICE_TO_INTEREST,
    type ContactInterest,
} from "@/lib/contact-interest-options";
import { FormInput, FormTextarea } from "@/components/Form";
import { CheckCircle2, Mail, ArrowRight, ArrowLeft, Send, Sparkles } from "lucide-react";
import AmbientBackground from "@/components/AmbientBackground";
import Navbar from "@/components/Navbar";
import { useSearchParams } from "next/navigation";

type ContactPageContent = {
    hero_title: string;
    hero_text: string;
    success_title?: string;
    success_text?: string;
};

type GlobalContactContent = {
    email: string;
};

const STEP_LABELS = ["DETAILS", "INTEREST", "MESSAGE"] as const;
const STEP_HEADERS = [
    "STEP_01 — CONTACT INFO",
    "STEP_02 — WHAT YOU NEED",
    "STEP_03 — YOUR MESSAGE",
] as const;

export default function ContactPage() {
    return (
        <Suspense fallback={<div style={{ background: "var(--bv-bg-deep)", minHeight: "100vh" }} />}>
            <ContactContent />
        </Suspense>
    );
}

function ContactContent() {
    const searchParams = useSearchParams();
    const [userType, setUserType] = useState<"TALENT" | "BRAND">("TALENT");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [step, setStep] = useState(1);
    const [selectedInterestIds, setSelectedInterestIds] = useState<Set<string>>(new Set());

    const [pageContent, setPageContent] = useState<ContactPageContent>({
        hero_title: "Let's Build Something",
        hero_text:
            "Contact our team about creator management, brand campaign access, partnerships, or public appearances. Tell us what you're looking for — pick a few options or write it in your own words.",
        success_title: "Message Received.",
        success_text: "Your enquiry has been sent to the Beyond Vision team. We will be in touch shortly.",
    });

    const [globalContent, setGlobalContent] = useState<GlobalContactContent>({
        email: CONTACT_EMAIL,
    });

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        interestOther: "",
        inquiryDetails: "",
        message: "",
    });

    const interestOptions: ContactInterest[] = useMemo(
        () => (userType === "TALENT" ? TALENT_INTERESTS : BRAND_INTERESTS),
        [userType]
    );

    const applyUrlPrefill = useCallback(() => {
        const type = searchParams.get("type");
        const service = searchParams.get("service");
        const talent = searchParams.get("talent");

        if (type === "brand") setUserType("BRAND");
        else if (type === "talent" || type === "creator") setUserType("TALENT");

        if (service) {
            const interestId = BRAND_SERVICE_TO_INTEREST[service];
            if (interestId) {
                setUserType("BRAND");
                setSelectedInterestIds(new Set([interestId]));
            }
        }

        if (talent) {
            setUserType("BRAND");
            setSelectedInterestIds((prev) => new Set([...prev, "roster-access"]));
            setFormData((prev) => ({
                ...prev,
                inquiryDetails:
                    prev.inquiryDetails ||
                    `Interested in working with ${decodeURIComponent(talent)}.`,
            }));
        }
    }, [searchParams]);

    useEffect(() => {
        applyUrlPrefill();
    }, [applyUrlPrefill]);

    useEffect(() => {
        const fetchContent = async () => {
            const data = await getPageContent("contact");
            if (data) {
                let heroText = data.hero_text as string | undefined;
                if (typeof heroText === "string" && heroText.includes("performance desk")) {
                    heroText =
                        "Contact our team about creator management, brand campaign access, partnerships, or public appearances.";
                }
                setPageContent((prev) => ({
                    ...prev,
                    ...data,
                    hero_text: heroText || prev.hero_text,
                }));
            }
            const global = await getPageContent("global");
            if (global?.email) {
                setGlobalContent((prev) => ({ ...prev, email: global.email as string }));
            }
        };
        fetchContent();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const toggleInterest = (id: string) => {
        setSelectedInterestIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const switchUserType = (type: "TALENT" | "BRAND") => {
        setUserType(type);
        setStep(1);
        setSelectedInterestIds(new Set());
        setFormData((prev) => ({ ...prev, interestOther: "" }));
        if (type === "BRAND") {
            const service = searchParams.get("service");
            const interestId = service ? BRAND_SERVICE_TO_INTEREST[service] : undefined;
            if (interestId) setSelectedInterestIds(new Set([interestId]));
        }
    };

    const selectedLabels = interestOptions
        .filter((o) => selectedInterestIds.has(o.id))
        .map((o) => o.label);

    const hasOtherSelected = selectedInterestIds.has("other");
    const writtenDetail =
        formData.inquiryDetails.trim().length >= 10 || formData.message.trim().length >= 10;

    const isStepValid = () => {
        if (step === 1) {
            return (
                formData.firstName.trim() !== "" &&
                formData.lastName.trim() !== "" &&
                formData.email.includes("@") &&
                formData.phone.trim() !== ""
            );
        }
        if (step === 2) {
            if (selectedInterestIds.size === 0) return false;
            if (hasOtherSelected && !formData.interestOther.trim()) return false;
            return true;
        }
        if (step === 3) {
            return writtenDetail;
        }
        return true;
    };

    const handleFinalSubmit = async () => {
        if (!isStepValid()) return;
        setIsSubmitting(true);
        setSubmitError("");
        try {
            await addDoc(collection(getDb(), "enquiries"), {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                type: userType,
                interests: selectedLabels,
                interestIds: [...selectedInterestIds],
                interestOther: hasOtherSelected ? formData.interestOther.trim() : "",
                inquiryDetails: formData.inquiryDetails.trim(),
                message: formData.message.trim(),
                createdAt: serverTimestamp(),
            });
            setIsSubmitted(true);
        } catch {
            setSubmitError("Could not submit. Please reach out directly via email.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const totalSteps = 3;
    const progress = (step / totalSteps) * 100;

    return (
        <div
            className="contact-page"
            style={{
                height: "100vh",
                background: "var(--bv-bg-deep)",
                color: "#F5F5F5",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                position: "relative",
            }}
        >
            <AmbientBackground />
            <Navbar />

            <div
                className="contact-shell"
                style={{
                    flex: 1,
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    overflow: "hidden",
                    position: "relative",
                    zIndex: 10,
                }}
            >
                <div
                    className="contact-intro-panel"
                    style={{
                        padding: "4rem 5rem",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        borderRight: "1px solid rgba(255,255,255,0.05)",
                    }}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.6rem",
                                background: "rgba(74,222,128,0.08)",
                                color: "#4ade80",
                                padding: "0.5rem 1.2rem",
                                borderRadius: "100px",
                                fontSize: "0.7rem",
                                fontWeight: 900,
                                letterSpacing: "2px",
                                marginBottom: "2.5rem",
                                border: "1px solid rgba(74,222,128,0.2)",
                            }}
                        >
                            <Sparkles size={12} />
                            DON&apos;T BE SHY
                        </div>

                        <h1
                            style={{
                                fontSize: "clamp(2.8rem, 5vw, 5rem)",
                                fontWeight: 900,
                                lineHeight: 0.9,
                                textTransform: "uppercase",
                                letterSpacing: "-0.04em",
                                marginBottom: "2rem",
                            }}
                        >
                            {pageContent.hero_title}
                            <span style={{ color: "var(--accent)" }}>.</span>
                        </h1>

                        <p
                            style={{
                                fontSize: "1rem",
                                color: "rgba(255,255,255,0.4)",
                                maxWidth: "420px",
                                lineHeight: 1.7,
                                marginBottom: "3.5rem",
                            }}
                        >
                            {pageContent.hero_text}
                        </p>

                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <a
                                className="contact-email-link"
                                href={`mailto:${globalContent.email}`}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "1rem",
                                    padding: "1.2rem 2rem",
                                    background: "rgba(255,255,255,0.04)",
                                    border: "1px solid rgba(255,255,255,0.08)",
                                    borderRadius: "16px",
                                    color: "#fff",
                                    fontWeight: 900,
                                    fontSize: "0.9rem",
                                    textDecoration: "none",
                                    transition: "background 0.2s ease",
                                    cursor: "pointer",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                                }}
                            >
                                <div
                                    style={{
                                        width: "36px",
                                        height: "36px",
                                        background: "rgba(255,246,117,0.1)",
                                        borderRadius: "10px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Mail size={16} color="var(--accent)" />
                                </div>
                                {globalContent.email}
                            </a>
                        </div>

                        {!isSubmitted && (
                            <div
                                className="contact-progress"
                                style={{
                                    marginTop: "4rem",
                                    display: "flex",
                                    gap: "1rem",
                                    alignItems: "center",
                                }}
                            >
                                {[1, 2, 3].map((s) => (
                                    <div
                                        key={s}
                                        style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
                                    >
                                        <div
                                            style={{
                                                width: "28px",
                                                height: "28px",
                                                borderRadius: "50%",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: "0.7rem",
                                                fontWeight: 900,
                                                transition: "all 0.3s ease",
                                                background:
                                                    step >= s ? "var(--accent)" : "rgba(255,255,255,0.06)",
                                                color: step >= s ? "#000" : "rgba(255,255,255,0.3)",
                                                border:
                                                    step === s ? "none" : "1px solid rgba(255,255,255,0.1)",
                                            }}
                                        >
                                            {s}
                                        </div>
                                        {s < 3 && (
                                            <div
                                                style={{
                                                    width: "24px",
                                                    height: "1px",
                                                    background:
                                                        step > s ? "var(--accent)" : "rgba(255,255,255,0.1)",
                                                    transition: "all 0.3s ease",
                                                }}
                                            />
                                        )}
                                    </div>
                                ))}
                                <span
                                    style={{
                                        fontSize: "0.7rem",
                                        fontWeight: 900,
                                        color: "rgba(255,255,255,0.3)",
                                        letterSpacing: "2px",
                                        marginLeft: "0.5rem",
                                    }}
                                >
                                    {STEP_LABELS[step - 1]}
                                </span>
                            </div>
                        )}
                    </motion.div>
                </div>

                <div
                    className="contact-form-panel"
                    style={{
                        padding: "4rem 5rem",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        overflowY: "auto",
                    }}
                >
                    {!isSubmitted && (
                        <div
                            className="contact-type-toggle"
                            style={{
                                display: "flex",
                                background: "rgba(255,255,255,0.04)",
                                padding: "0.4rem",
                                borderRadius: "14px",
                                border: "1px solid rgba(255,255,255,0.08)",
                                marginBottom: "3rem",
                                width: "fit-content",
                                position: "relative",
                            }}
                        >
                            <motion.div
                                animate={{ x: userType === "TALENT" ? 0 : "100%" }}
                                transition={{ type: "spring", stiffness: 400, damping: 35 }}
                                style={{
                                    position: "absolute",
                                    top: "0.4rem",
                                    left: "0.4rem",
                                    width: "calc(50% - 0.4rem)",
                                    height: "calc(100% - 0.8rem)",
                                    background: "var(--accent)",
                                    borderRadius: "10px",
                                    zIndex: 1,
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => switchUserType("TALENT")}
                                style={{
                                    padding: "0.8rem 2.5rem",
                                    borderRadius: "10px",
                                    border: "none",
                                    background: "none",
                                    fontWeight: 900,
                                    fontSize: "0.75rem",
                                    cursor: "pointer",
                                    position: "relative",
                                    zIndex: 2,
                                    color: userType === "TALENT" ? "#000" : "rgba(255,255,255,0.4)",
                                    letterSpacing: "1px",
                                    textTransform: "uppercase",
                                }}
                            >
                                FOR CREATORS
                            </button>
                            <button
                                type="button"
                                onClick={() => switchUserType("BRAND")}
                                style={{
                                    padding: "0.8rem 2.5rem",
                                    borderRadius: "10px",
                                    border: "none",
                                    background: "none",
                                    fontWeight: 900,
                                    fontSize: "0.75rem",
                                    cursor: "pointer",
                                    position: "relative",
                                    zIndex: 2,
                                    color: userType === "BRAND" ? "#000" : "rgba(255,255,255,0.4)",
                                    letterSpacing: "1px",
                                    textTransform: "uppercase",
                                }}
                            >
                                FOR BRANDS
                            </button>
                        </div>
                    )}

                    {!isSubmitted && (
                        <div style={{ marginBottom: "3rem" }}>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    marginBottom: "0.75rem",
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: "0.7rem",
                                        fontWeight: 900,
                                        color: "var(--accent)",
                                        letterSpacing: "2px",
                                    }}
                                >
                                    {STEP_HEADERS[step - 1]}
                                </span>
                                <span
                                    style={{
                                        fontSize: "0.7rem",
                                        fontWeight: 900,
                                        color: "rgba(255,255,255,0.25)",
                                    }}
                                >
                                    {Math.round(progress)}%
                                </span>
                            </div>
                            <div
                                style={{
                                    height: "2px",
                                    background: "rgba(255,255,255,0.06)",
                                    borderRadius: "10px",
                                    overflow: "hidden",
                                }}
                            >
                                <motion.div
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.4 }}
                                    style={{
                                        height: "100%",
                                        background: "var(--accent)",
                                        borderRadius: "10px",
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    <AnimatePresence mode="wait">
                        {isSubmitted ? (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                style={{ textAlign: "center", padding: "2rem 0" }}
                            >
                                <div
                                    style={{
                                        width: "80px",
                                        height: "80px",
                                        background: "rgba(74,222,128,0.08)",
                                        borderRadius: "50%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        margin: "0 auto 2rem",
                                        border: "1px solid #4ade80",
                                    }}
                                >
                                    <CheckCircle2 size={36} color="#4ade80" />
                                </div>
                                <h2
                                    style={{
                                        fontSize: "2.5rem",
                                        fontWeight: 900,
                                        textTransform: "uppercase",
                                        marginBottom: "1rem",
                                        lineHeight: 1,
                                    }}
                                >
                                    {pageContent.success_title}
                                </h2>
                                <p
                                    style={{
                                        color: "rgba(255,255,255,0.45)",
                                        fontSize: "1rem",
                                        lineHeight: 1.7,
                                        maxWidth: "380px",
                                        margin: "0 auto 3rem",
                                    }}
                                >
                                    {pageContent.success_text}
                                </p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        window.location.href = "/";
                                    }}
                                    style={{
                                        background: "var(--accent)",
                                        color: "#000",
                                        padding: "1.1rem 3rem",
                                        borderRadius: "100px",
                                        border: "none",
                                        fontWeight: 900,
                                        fontSize: "0.85rem",
                                        textTransform: "uppercase",
                                        cursor: "pointer",
                                        letterSpacing: "1px",
                                    }}
                                >
                                    RETURN HOME
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key={`${userType}-${step}`}
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -30 }}
                                transition={{ duration: 0.25 }}
                                style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
                            >
                                {step === 1 && (
                                    <>
                                        <div
                                            className="contact-name-grid"
                                            style={{
                                                display: "grid",
                                                gridTemplateColumns: "1fr 1fr",
                                                gap: "1.5rem",
                                            }}
                                        >
                                            <FormInput
                                                label="First Name"
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleInputChange}
                                                placeholder="JOHN"
                                            />
                                            <FormInput
                                                label="Last Name"
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleInputChange}
                                                placeholder="DOE"
                                            />
                                        </div>
                                        <FormInput
                                            label="Email Address"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            type="email"
                                            placeholder="YOUR@EMAIL.COM"
                                        />
                                        <FormInput
                                            label="Phone Number"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            type="tel"
                                            placeholder="+44 000 000 000"
                                        />
                                    </>
                                )}

                                {step === 2 && (
                                    <>
                                        <div>
                                            <p
                                                style={{
                                                    fontSize: "0.75rem",
                                                    fontWeight: 900,
                                                    color: "var(--bv-muted)",
                                                    marginBottom: "0.35rem",
                                                    textTransform: "uppercase",
                                                    letterSpacing: "0.12em",
                                                }}
                                            >
                                                What are you looking for?
                                            </p>
                                            <p
                                                style={{
                                                    fontSize: "0.85rem",
                                                    color: "rgba(255,255,255,0.4)",
                                                    margin: "0 0 1.25rem",
                                                    lineHeight: 1.5,
                                                }}
                                            >
                                                Select everything that applies — you can add more detail below.
                                            </p>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    flexWrap: "wrap",
                                                    gap: "0.65rem",
                                                }}
                                            >
                                                {interestOptions.map((option) => {
                                                    const selected = selectedInterestIds.has(option.id);
                                                    return (
                                                        <button
                                                            key={option.id}
                                                            type="button"
                                                            onClick={() => toggleInterest(option.id)}
                                                            style={{
                                                                padding: "0.75rem 1.15rem",
                                                                borderRadius: "100px",
                                                                border: selected
                                                                    ? "1px solid var(--accent)"
                                                                    : "1px solid rgba(255,255,255,0.12)",
                                                                background: selected
                                                                    ? "rgba(255,246,117,0.15)"
                                                                    : "rgba(255,255,255,0.04)",
                                                                color: selected ? "#fff" : "rgba(255,255,255,0.55)",
                                                                fontSize: "0.72rem",
                                                                fontWeight: 800,
                                                                letterSpacing: "0.04em",
                                                                textTransform: "uppercase",
                                                                cursor: "pointer",
                                                                transition: "border-color 0.2s, background 0.2s",
                                                            }}
                                                        >
                                                            {option.label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            {selectedInterestIds.size === 0 && (
                                                <p
                                                    style={{
                                                        marginTop: "0.75rem",
                                                        fontSize: "0.8rem",
                                                        color: "rgba(255,255,255,0.35)",
                                                    }}
                                                >
                                                    Pick at least one option to continue.
                                                </p>
                                            )}
                                        </div>

                                        {hasOtherSelected && (
                                            <FormInput
                                                label="Describe what you need"
                                                name="interestOther"
                                                value={formData.interestOther}
                                                onChange={handleInputChange}
                                                placeholder="E.G. PODCAST TOUR, LONG-TERM RETAINER..."
                                            />
                                        )}

                                        <FormTextarea
                                            label="Tell us more (optional)"
                                            name="inquiryDetails"
                                            value={formData.inquiryDetails}
                                            onChange={handleInputChange}
                                            placeholder="Goals, timelines, platforms, budget range — anything that helps us route your enquiry."
                                            style={{ minHeight: "120px", textTransform: "none" }}
                                        />
                                    </>
                                )}

                                {step === 3 && (
                                    <>
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "1rem",
                                                padding: "1.2rem 1.5rem",
                                                background: "rgba(255,246,117,0.04)",
                                                border: "1px solid rgba(255,246,117,0.12)",
                                                borderRadius: "14px",
                                            }}
                                        >
                                            <Send size={18} color="var(--accent)" />
                                            <p
                                                style={{
                                                    fontSize: "0.85rem",
                                                    color: "rgba(255,255,255,0.5)",
                                                    margin: 0,
                                                    lineHeight: 1.5,
                                                }}
                                            >
                                                {formData.inquiryDetails.trim().length >= 10
                                                    ? "Add anything else below, or send as-is."
                                                    : "Almost there — add a short note about what you need (min. 10 characters), unless you already wrote enough on the previous step."}
                                            </p>
                                        </div>
                                        {selectedLabels.length > 0 && (
                                            <div
                                                style={{
                                                    display: "flex",
                                                    flexWrap: "wrap",
                                                    gap: "0.5rem",
                                                }}
                                            >
                                                {selectedLabels.map((label) => (
                                                    <span
                                                        key={label}
                                                        style={{
                                                            fontSize: "0.65rem",
                                                            fontWeight: 800,
                                                            letterSpacing: "0.06em",
                                                            textTransform: "uppercase",
                                                            padding: "0.4rem 0.75rem",
                                                            borderRadius: "100px",
                                                            background: "rgba(255,255,255,0.06)",
                                                            color: "rgba(255,255,255,0.45)",
                                                        }}
                                                    >
                                                        {label}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        <FormTextarea
                                            label="Your message"
                                            name="message"
                                            value={formData.message}
                                            onChange={handleInputChange}
                                            placeholder="HOW CAN WE HELP? (MIN. 10 CHARS IF YOU SKIPPED THE PREVIOUS BOX)"
                                            style={{ textTransform: "none" }}
                                        />
                                        {submitError && (
                                            <p
                                                style={{
                                                    color: "#fca5a5",
                                                    fontSize: "0.85rem",
                                                    lineHeight: 1.5,
                                                }}
                                            >
                                                {submitError}
                                            </p>
                                        )}
                                    </>
                                )}

                                <div
                                    className="contact-form-actions"
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        paddingTop: "0.5rem",
                                    }}
                                >
                                    {step > 1 ? (
                                        <button
                                            type="button"
                                            onClick={() => setStep(step - 1)}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "0.5rem",
                                                background: "none",
                                                border: "none",
                                                color: "rgba(255,255,255,0.35)",
                                                fontSize: "0.8rem",
                                                fontWeight: 900,
                                                letterSpacing: "2px",
                                                cursor: "pointer",
                                                textTransform: "uppercase",
                                            }}
                                        >
                                            <ArrowLeft size={14} /> BACK
                                        </button>
                                    ) : (
                                        <div />
                                    )}
                                    <button
                                        type="button"
                                        disabled={!isStepValid() || isSubmitting}
                                        onClick={() => (step < 3 ? setStep(step + 1) : handleFinalSubmit())}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "0.6rem",
                                            padding: "1rem 2.5rem",
                                            borderRadius: "100px",
                                            border: "none",
                                            fontWeight: 900,
                                            fontSize: "0.85rem",
                                            letterSpacing: "1.5px",
                                            cursor: isStepValid() ? "pointer" : "not-allowed",
                                            textTransform: "uppercase",
                                            transition: "background 0.3s ease, color 0.3s ease",
                                            background: isStepValid()
                                                ? "var(--accent)"
                                                : "rgba(255,255,255,0.05)",
                                            color: isStepValid() ? "#000" : "rgba(255,255,255,0.2)",
                                            opacity: isSubmitting ? 0.7 : 1,
                                        }}
                                    >
                                        {isSubmitting
                                            ? "SENDING..."
                                            : step === 3
                                              ? "SEND MESSAGE"
                                              : "CONTINUE"}
                                        {!isSubmitting && <ArrowRight size={15} />}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
            <style jsx>{`
                @media (max-width: 1024px) {
                    .contact-page {
                        height: auto !important;
                        min-height: 100dvh !important;
                        overflow: visible !important;
                    }

                    .contact-shell {
                        display: flex !important;
                        flex-direction: column !important;
                        overflow: visible !important;
                        padding-top: 6.5rem;
                    }

                    .contact-intro-panel,
                    .contact-form-panel {
                        padding: 2rem 1.5rem !important;
                        justify-content: flex-start !important;
                    }

                    .contact-intro-panel {
                        border-right: none !important;
                        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
                    }

                    .contact-form-panel {
                        overflow: visible !important;
                    }

                    .contact-progress {
                        margin-top: 2rem !important;
                    }
                }

                @media (max-width: 640px) {
                    .contact-shell {
                        padding-top: 5.75rem;
                    }

                    .contact-intro-panel,
                    .contact-form-panel {
                        padding: 1.5rem 1rem !important;
                    }

                    .contact-intro-panel h1 {
                        font-size: clamp(2.2rem, 12vw, 3.35rem) !important;
                        margin-bottom: 1.25rem !important;
                    }

                    .contact-intro-panel p {
                        margin-bottom: 1.75rem !important;
                    }

                    .contact-email-link {
                        padding: 1rem !important;
                        font-size: 0.76rem !important;
                        gap: 0.75rem !important;
                        overflow-wrap: anywhere;
                    }

                    .contact-progress {
                        flex-wrap: wrap;
                        gap: 0.65rem !important;
                    }

                    .contact-type-toggle {
                        width: 100% !important;
                        margin-bottom: 2rem !important;
                    }

                    .contact-type-toggle button {
                        flex: 1 1 0;
                        min-width: 0;
                        padding-left: 0.75rem !important;
                        padding-right: 0.75rem !important;
                    }

                    .contact-name-grid {
                        grid-template-columns: 1fr !important;
                        gap: 1.25rem !important;
                    }

                    .contact-form-actions {
                        align-items: stretch !important;
                        gap: 1rem;
                    }

                    .contact-form-actions > button {
                        min-height: 48px;
                        justify-content: center;
                    }
                }

                @media (max-width: 420px) {
                    .contact-form-actions {
                        flex-direction: column-reverse;
                    }

                    .contact-form-actions > div {
                        display: none;
                    }
                }
            `}</style>
        </div>
    );
}
