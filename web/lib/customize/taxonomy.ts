export interface CustomizeOption {
  value: string;
  label: string;
  priceDelta?: number;
  meta?: Record<string, unknown>;
}

export interface CustomizeGroup {
  id: string;
  step: number;
  label: string;
  kind: "single" | "multi" | "swatch" | "color";
  options: CustomizeOption[];
}

export interface CustomizeSpec {
  selections: Record<string, string | string[]>;
  colorMatchReference: boolean;
  notes: string;
  occasion: string;
  budgetTier: string;
  requiredBy: string | null;
}

export const TAXONOMY: CustomizeGroup[] = [
  {
    id: "garment",
    step: 1,
    label: "Garment",
    kind: "single",
    options: [
      { value: "kurti", label: "Kurti" },
      { value: "kurta-set", label: "Kurta Set" },
      { value: "lehenga", label: "Lehenga" },
      { value: "anarkali", label: "Anarkali" },
      { value: "saree", label: "Saree" },
      { value: "gown", label: "Gown" },
      { value: "sharara", label: "Sharara" },
      { value: "co-ord-set", label: "Co-ord Set" },
      { value: "indo-western", label: "Indo-Western" },
      { value: "sherwani", label: "Sherwani (Men)" },
      { value: "pathani", label: "Pathani (Men)" },
      { value: "kurta", label: "Kurta (Men)" },
    ],
  },
  {
    id: "silhouette",
    step: 2,
    label: "Silhouette",
    kind: "single",
    options: [
      { value: "a-line", label: "A-Line" },
      { value: "straight", label: "Straight" },
      { value: "flared", label: "Flared" },
      { value: "fitted", label: "Fitted" },
      { value: "wrap", label: "Wrap" },
      { value: "asymmetric", label: "Asymmetric" },
      { value: "peplum", label: "Peplum" },
    ],
  },
  {
    id: "length",
    step: 2,
    label: "Length",
    kind: "single",
    options: [
      { value: "knee", label: "Knee" },
      { value: "mid-calf", label: "Mid-Calf" },
      { value: "ankle", label: "Ankle" },
      { value: "floor", label: "Floor" },
    ],
  },
  {
    id: "neckline",
    step: 3,
    label: "Neckline",
    kind: "swatch",
    options: [
      { value: "round", label: "Round" },
      { value: "v-neck", label: "V-Neck" },
      { value: "boat", label: "Boat" },
      { value: "sweetheart", label: "Sweetheart" },
      { value: "mandarin", label: "Mandarin Collar" },
      { value: "keyhole", label: "Keyhole" },
      { value: "halter", label: "Halter" },
      { value: "square", label: "Square" },
      { value: "off-shoulder", label: "Off-Shoulder" },
      { value: "one-shoulder", label: "One-Shoulder" },
      { value: "queen-anne", label: "Queen Anne" },
    ],
  },
  {
    id: "sleeve",
    step: 4,
    label: "Sleeves",
    kind: "swatch",
    options: [
      { value: "sleeveless", label: "Sleeveless" },
      { value: "cap", label: "Cap" },
      { value: "short", label: "Short" },
      { value: "elbow", label: "Elbow" },
      { value: "three-quarter", label: "3/4" },
      { value: "full", label: "Full" },
      { value: "bell", label: "Bell" },
      { value: "bishop", label: "Bishop" },
      { value: "puffed", label: "Puffed" },
      { value: "cold-shoulder", label: "Cold-Shoulder" },
      { value: "ruffled", label: "Ruffled" },
    ],
  },
  {
    id: "fabric",
    step: 5,
    label: "Fabric",
    kind: "single",
    options: [
      { value: "cotton", label: "Cotton" },
      { value: "mulmul", label: "Mulmul" },
      { value: "silk", label: "Silk" },
      { value: "chanderi", label: "Chanderi" },
      { value: "chiffon", label: "Chiffon" },
      { value: "georgette", label: "Georgette" },
      { value: "crepe", label: "Crepe" },
      { value: "linen", label: "Linen" },
      { value: "velvet", label: "Velvet" },
      { value: "organza", label: "Organza" },
      { value: "brocade", label: "Brocade" },
      { value: "tussar", label: "Tussar" },
    ],
  },
  {
    id: "color",
    step: 5,
    label: "Colour",
    kind: "color",
    options: [
      { value: "oxblood", label: "Oxblood", meta: { hex: "#4F200D" } },
      { value: "ivory", label: "Ivory", meta: { hex: "#F8F2E9" } },
      { value: "bottle-green", label: "Bottle Green", meta: { hex: "#1B4332" } },
      { value: "indigo", label: "Indigo", meta: { hex: "#1B2A4A" } },
      { value: "marigold", label: "Marigold", meta: { hex: "#D4A017" } },
      { value: "blush", label: "Blush", meta: { hex: "#E8B4B8" } },
      { value: "charcoal", label: "Charcoal", meta: { hex: "#36454F" } },
      { value: "champagne", label: "Champagne", meta: { hex: "#F7E7CE" } },
    ],
  },
  {
    id: "embellishment",
    step: 6,
    label: "Embellishment & Work",
    kind: "multi",
    options: [
      { value: "chikankari", label: "Chikankari" },
      { value: "zardozi", label: "Zardozi" },
      { value: "resham", label: "Resham" },
      { value: "aari", label: "Aari" },
      { value: "mirror", label: "Mirror" },
      { value: "gota-patti", label: "Gota Patti" },
      { value: "kantha", label: "Kantha" },
      { value: "threadwork", label: "Threadwork" },
      { value: "applique", label: "Appliqué" },
      { value: "beadwork", label: "Beadwork" },
      { value: "sequins", label: "Sequins" },
      { value: "none", label: "None (Plain)" },
    ],
  },
  {
    id: "occasion",
    step: 7,
    label: "Occasion",
    kind: "single",
    options: [
      { value: "casual", label: "Casual" },
      { value: "festive", label: "Festive" },
      { value: "wedding", label: "Wedding" },
      { value: "reception", label: "Reception" },
      { value: "mehendi", label: "Mehendi" },
      { value: "sangeet", label: "Sangeet" },
      { value: "cocktail", label: "Cocktail" },
      { value: "office", label: "Office" },
    ],
  },
  {
    id: "budget",
    step: 7,
    label: "Budget Preference",
    kind: "single",
    options: [
      { value: "under-5k", label: "Under ₹5,000" },
      { value: "5-10k", label: "₹5,000—10,000" },
      { value: "10-25k", label: "₹10,000—25,000" },
      { value: "25k-plus", label: "₹25,000+" },
    ],
  },
];

export function getGroup(id: string): CustomizeGroup | undefined {
  return TAXONOMY.find((g) => g.id === id);
}

export function getGroupsByStep(step: number): CustomizeGroup[] {
  return TAXONOMY.filter((g) => g.step === step);
}

export function getOptionLabel(groupId: string, value: string): string {
  const group = getGroup(groupId);
  if (!group) return value;
  const option = group.options.find((o) => o.value === value);
  return option?.label ?? value;
}

export function isValidSelection(
  groupId: string,
  value: string | string[],
): boolean {
  const group = getGroup(groupId);
  if (!group) return false;

  const validValues = group.options.map((o) => o.value);
  if (Array.isArray(value)) {
    if (group.kind !== "multi") return false;
    return value.every((v) => validValues.includes(v));
  }
  return validValues.includes(value);
}

export const REQUIRED_GROUPS = ["garment", "neckline"];

export const BUDGET_TIERS = ["under-5k", "5-10k", "10-25k", "25k-plus"] as const;

export const OCCASIONS = [
  "casual",
  "festive",
  "wedding",
  "reception",
  "mehendi",
  "sangeet",
  "cocktail",
  "office",
] as const;
