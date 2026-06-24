import { getDb } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import { PAGE_DEFAULTS, resolveContactEmail } from "./content-defaults";

export async function getPageContent(pageId: string) {
    const defaults = PAGE_DEFAULTS[pageId] || {};
    try {
        const docRef = doc(getDb(), "site_content", pageId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const content = { ...defaults, ...docSnap.data() };
            if (pageId === "global" && typeof content.email === "string") {
                content.email = resolveContactEmail(content.email);
            }
            return content;
        }
    } catch (error) {
        console.error(`Error fetching page content for ${pageId}:`, error);
    }
    return defaults;
}
