export type ClientTestimonial = {
  name: string;
  brand: string;
  quote: string;
  type?: "client";
};

type RemoteClientTestimonial = {
  name?: string;
  brand?: string;
  quote?: string;
  type?: string;
};

export const CLIENT_TESTIMONIALS: ClientTestimonial[] = [
  {
    name: "Influencer Marketing Lead",
    brand: "Gauth",
    quote:
      "Beyond Vision sourced creators whose audiences already trusted education content. The campaign delivered 11M+ views with creative that felt native to TikTok, not like a forced ad read.",
    type: "client",
  },
  {
    name: "Partnerships Manager",
    brand: "Insta360",
    quote:
      "From brief to live content, the team kept creator selection, approvals, and posting tight. The Insta360 work performed strongly with our target audience and was easy to report on internally.",
    type: "client",
  },
  {
    name: "Brand Marketing Lead",
    brand: "Sheglam",
    quote:
      "They understood our category and matched us with creators whose content already looked like beauty TikTok. Strong engagement, clean delivery, and no unnecessary back-and-forth on the campaign.",
    type: "client",
  },
  {
    name: "Brand Partnerships Lead",
    brand: "DarryRing",
    quote:
      "Beyond Vision helped us run creator campaigns that felt personal and credible. The content landed well with family audiences and gave us repeatable learnings for the next wave of activations.",
    type: "client",
  },
  {
    name: "Growth Marketing Manager",
    brand: "Facemoji",
    quote:
      "Fast execution, clear communication, and creators who actually fit the product. The campaign gave us strong top-of-funnel reach without losing the product story in the creative.",
    type: "client",
  },
  {
    name: "Campaign Lead",
    brand: "Toxic",
    quote:
      "They handled sourcing, timelines, and creator comms so our team could stay focused on the launch. The content drove real momentum across multiple creator posts, not just one-off coverage.",
    type: "client",
  },
];

const PLACEHOLDER_NAME_PATTERN = /^(client name|creator partner)$/i;
const PLACEHOLDER_QUOTE_PATTERN = /placeholder testimonial/i;
const GENERIC_BRAND_PATTERN =
  /^(global brand partner|enterprise client|dtc brand|scale-up|lifestyle brand|tech client|brand partner|consumer brand|entertainment partner|creator)$/i;

export function isRealClientTestimonial(testimonial: RemoteClientTestimonial): testimonial is ClientTestimonial {
  if (testimonial.type && testimonial.type !== "client") return false;

  const name = testimonial.name?.trim();
  const brand = testimonial.brand?.trim();
  const quote = testimonial.quote?.trim();

  if (!name || !brand || !quote) return false;
  if (PLACEHOLDER_NAME_PATTERN.test(name)) return false;
  if (PLACEHOLDER_QUOTE_PATTERN.test(quote)) return false;
  if (GENERIC_BRAND_PATTERN.test(brand)) return false;

  return true;
}

export function resolveClientTestimonials(remote: RemoteClientTestimonial[]): ClientTestimonial[] {
  const filtered = remote.filter(isRealClientTestimonial);
  return filtered.length ? filtered : CLIENT_TESTIMONIALS;
}
