/**
 * JobShield Centralized Design & Brand Color Tokens
 * Dodger Blue brand identity system
 * 
 * Strict Brand Guidelines:
 * - Primary Brand: Dodger Blue #1E90FF
 * - Primary Hover: #1877D2
 * - Primary Light Background: #EAF4FF
 * - Primary Subtle Background: #F4F9FF
 * - Text Primary: Deep navy #101828
 * - Text Secondary: #667085
 * - Borders: #E4E7EC
 * - Background: #F8FAFC
 * - Cards: #FFFFFF
 * - Semantic risk severity colors (High=red, Medium=amber, Low=green/blue) are preserved.
 */

export const BRAND = {
  // Primary Dodger Blue brand colors
  primary: "#1E90FF",
  primaryHover: "#1877D2",
  primaryLight: "#EAF4FF",
  primarySubtle: "#F4F9FF",
  primaryBorder: "#B9DCFE",

  // Typography & Neutrals
  textPrimary: "#101828", // Deep navy
  textSecondary: "#667085", // Secondary text
  border: "#E4E7EC", // Borders
  background: "#F8FAFC", // Main background
  card: "#FFFFFF", // Card surface

  // Structural Navy (for high-contrast structural text / deep elements)
  navy: "#101828",
  navyHover: "#1D2939",

  // Focus ring class
  focusRing: "focus:outline-none focus:ring-2 focus:ring-[#1E90FF] focus:ring-offset-1",

  // Semantic Risk Severity (NEVER recolored to blue)
  semantic: {
    high: {
      color: "#F43F5E",
      bg: "#FFF1F2",
      text: "#BE123C",
      border: "#FECDD3",
    },
    medium: {
      color: "#F59E0B",
      bg: "#FFFBEB",
      text: "#B45309",
      border: "#FDE68A",
    },
    low: {
      color: "#10B981",
      bg: "#ECFDF5",
      text: "#047857",
      border: "#A7F3D0",
    },
  },
} as const;

// Common reusable Tailwind CSS class sets
export const BRAND_CLASSES = {
  // Primary CTA buttons: Dodger Blue
  primaryButton:
    "bg-[#1E90FF] hover:bg-[#1877D2] active:bg-[#1565C0] text-white font-bold shadow-md shadow-[#1E90FF]/25 border-none transition-all duration-200 cursor-pointer active:scale-95",

  // Secondary / Outline buttons
  secondaryButton:
    "bg-white hover:bg-[#F4F9FF] text-[#101828] font-bold border border-[#E4E7EC] hover:border-[#B9DCFE] shadow-2xs transition-all duration-200 cursor-pointer active:scale-95",

  // Active navigation item
  activeNavItem:
    "bg-[#EAF4FF] text-[#1E90FF] font-bold shadow-xs",
  inactiveNavItem:
    "text-[#667085] hover:text-[#101828] hover:bg-[#F4F9FF] font-medium",

  // Active folder item (Dodger blue icon, light blue bg, dark navy label)
  activeFolderItem:
    "bg-[#EAF4FF] text-[#101828] font-bold border border-[#B9DCFE]",
  inactiveFolderItem:
    "text-[#667085] hover:text-[#101828] hover:bg-slate-100/60 font-medium",

  // Pill badge
  brandPill:
    "bg-[#EAF4FF] text-[#101828] border border-[#B9DCFE]",

  // Card styles
  card:
    "bg-white rounded-[24px] border border-[#E4E7EC] shadow-xs",
  cardHighlighted:
    "bg-[#F4F9FF] rounded-[24px] border-2 border-[#1E90FF] shadow-md shadow-[#1E90FF]/15",
} as const;
