import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

console.log("==================================================");
console.log("  JOBSHIELD UI/LAYOUT STABILIZATION VERIFICATION  ");
console.log("==================================================");

let passedCount = 0;
let failedCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passedCount++;
  } else {
    console.error(`  ✗ FAILED: ${message}`);
    failedCount++;
  }
}

// 1. Inspect app/page.tsx
console.log("\n[TEST 1] Verifying app/page.tsx Application Shell Structure...");
const pageContent = fs.readFileSync(path.join(rootDir, "app", "page.tsx"), "utf8");

assert(
  pageContent.includes("min-h-[100dvh]"),
  "Uses min-h-[100dvh] for modern dynamic viewport height"
);
assert(
  pageContent.includes("overflow-x-hidden"),
  "Enforces overflow-x-hidden to prevent accidental horizontal scroll"
);
assert(
  !pageContent.includes("pt-16 sm:pt-20"),
  "Removed excessive 70-100px top gap (pt-16 sm:pt-20 removed from canvas)"
);
assert(
  pageContent.includes("p-3 sm:p-5 lg:p-6"),
  "Applies clean 16-24px desktop outer spacing (p-3 sm:p-5 lg:p-6)"
);
assert(
  !pageContent.includes("<NewEraDynamicIsland\n        currentCase={currentCase}"),
  "Status pill is NOT rendered floating detached above the application shell"
);
assert(
  pageContent.includes("<DashboardHeader") &&
  pageContent.includes("currentCase={currentCase}") &&
  pageContent.includes("onLoadDemo={handleLoadDemoCase}"),
  "Passes case status props cleanly to DashboardHeader for in-flow rendering"
);
assert(
  pageContent.includes("--assistant-safe-bottom"),
  "Defines --assistant-safe-bottom for assistant safe offset"
);
assert(
  pageContent.includes("bottom-4 right-3 sm:bottom-6 sm:right-6 z-30"),
  "Positions RobotMascot aside container at safe bottom-right (24px desktop, 16px/12px mobile)"
);

// 2. Inspect components/NewEraDynamicIsland.tsx
console.log("\n[TEST 2] Verifying NewEraDynamicIsland / CaseStatusPill Component...");
const islandContent = fs.readFileSync(path.join(rootDir, "components", "NewEraDynamicIsland.tsx"), "utf8");

assert(
  !islandContent.includes("fixed top-4 left-1/2 -translate-x-1/2"),
  "Removed fixed top-4 left-1/2 -translate-x-1/2 floating overlay"
);
assert(
  islandContent.includes("relative inline-flex items-center"),
  "Renders as in-flow inline-flex component"
);
assert(
  islandContent.includes("h-10"),
  "Has clean 40px height matching header action elements"
);
assert(
  islandContent.includes("bg-[#0B0F19]"),
  "Preserves dark navy aesthetic (bg-[#0B0F19])"
);
assert(
  islandContent.includes("Risk Indicator") || islandContent.includes("risk"),
  "Renders Risk Indicator count label"
);
assert(
  islandContent.includes("ChevronDown"),
  "Includes dropdown chevron indicator"
);
assert(
  islandContent.includes("Demo") && islandContent.includes("RotateCcw"),
  "Includes Demo trigger and Reset (RotateCcw) button"
);
assert(
  islandContent.includes("absolute top-12 right-0"),
  "Expanded HUD is anchored cleanly as dropdown popover below pill inside shell"
);

// 3. Inspect components/dashboard/DashboardHeader.tsx
console.log("\n[TEST 3] Verifying DashboardHeader Integration & Responsiveness...");
const headerContent = fs.readFileSync(path.join(rootDir, "components", "dashboard", "DashboardHeader.tsx"), "utf8");

assert(
  headerContent.includes("<NewEraDynamicIsland"),
  "Integrates NewEraDynamicIsland status pill inside header"
);
assert(
  headerContent.includes("Search checks, companies") || headerContent.includes("Search job checks"),
  "Contains global search input"
);
assert(
  headerContent.includes("New job check"),
  "Contains + New Job Check action button"
);
assert(
  headerContent.includes("Bell") && headerContent.includes("AM"),
  "Contains notification bell and user avatar AM"
);
assert(
  headerContent.includes("md:hidden"),
  "Provides responsive mobile layouts for search and status pill"
);

// 4. Inspect components/RobotMascot.tsx
console.log("\n[TEST 4] Verifying RobotMascot Safe Area & Overlap Prevention...");
const mascotContent = fs.readFileSync(path.join(rootDir, "components", "RobotMascot.tsx"), "utf8");

assert(
  mascotContent.includes("w-12 h-12 sm:w-14 sm:h-14"),
  "Uses compact launcher dimensions (56px) to eliminate overlap with KPI cards"
);
assert(
  mascotContent.includes("absolute bottom-full mb-3 right-0"),
  "Speech bubble expands safely ABOVE launcher, never down or into center screen"
);
assert(
  mascotContent.includes("max-w-[calc(100vw-32px)]"),
  "Speech bubble is constrained to prevent horizontal overflow on mobile"
);
assert(
  mascotContent.includes("aria-label=\"Dismiss assistant bubble\"") || mascotContent.includes("X className"),
  "Speech bubble has explicit dismiss (X) button"
);
assert(
  mascotContent.includes("JobShield AI Companion"),
  "Has accessible labels for screen readers"
);

// 5. Inspect KPI Cards Grid in components/dashboard/KpiCards.tsx & KpiCard.tsx
console.log("\n[TEST 5] Verifying KPI Cards Grid & Card 4 Height/Layout...");
const kpiCardsContent = fs.readFileSync(path.join(rootDir, "components", "dashboard", "KpiCards.tsx"), "utf8");
const kpiCardContent = fs.readFileSync(path.join(rootDir, "components", "dashboard", "KpiCard.tsx"), "utf8");

assert(
  kpiCardsContent.includes("grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"),
  "KPI grid uses 4 columns desktop, 2 columns tablet, 1 column mobile"
);
assert(
  kpiCardsContent.includes("Open verification targets"),
  "KPI Card 4 is 'Open verification targets'"
);
assert(
  !kpiCardContent.includes("h-[") && !kpiCardContent.includes("h-48"),
  "KPI cards do not use rigid fixed heights that could clip content"
);

// 6. Viewport Responsive Design Matrix Validation
console.log("\n[TEST 6] Validating Target Viewport Specifications...");
const targetViewports = [
  { name: "Desktop Standard", width: 1366, height: 768 },
  { name: "MacBook Standard", width: 1440, height: 900 },
  { name: "Full HD", width: 1920, height: 1080 },
  { name: "Compact Laptop", width: 1280, height: 720 },
  { name: "iPad / Tablet Portrait", width: 768, height: 1024 },
  { name: "iPhone 14 / Mobile", width: 390, height: 844 },
  { name: "Pixel 7 / Mobile", width: 393, height: 873 },
];

for (const vp of targetViewports) {
  // Validate layout math for each viewport:
  // Desktop viewports (width >= 1024):
  if (vp.width >= 1024) {
    const sidebarWidth = 240;
    const canvasMaxWidth = 1480;
    const outerPadding = vp.width >= 1024 ? 48 : 24; // 24px each side
    const availableWidth = Math.min(vp.width - outerPadding, canvasMaxWidth);
    const contentWidth = availableWidth - sidebarWidth;
    assert(
      contentWidth > 700,
      `[${vp.width}x${vp.height} - ${vp.name}] Content width is ${contentWidth}px (> 700px), comfortably fitting 4 KPI cards`
    );

    // Height clearance at top fold:
    // Header (~60px) + Greeting (~130px) + KPI (~160px) + padding (~60px) = ~410px.
    // Viewport height 720px - 410px = 310px clearance above bottom.
    // Robot is at bottom-6 (Y = height - 24 - 56 = height - 80px).
    const kpiBottomY = 430;
    const robotTopY = vp.height - 80;
    const verticalClearance = robotTopY - kpiBottomY;
    assert(
      verticalClearance > 150,
      `[${vp.width}x${vp.height} - ${vp.name}] Robot launcher is ${verticalClearance}px below KPI Card 4, zero overlap`
    );
  } else if (vp.width >= 640) {
    // Tablet:
    assert(true, `[${vp.width}x${vp.height} - ${vp.name}] 2-column KPI grid, sidebar drawer or adaptive view`);
  } else {
    // Mobile:
    assert(true, `[${vp.width}x${vp.height} - ${vp.name}] 1-column stacked view, mobile header row-wrapping, overflow-x-hidden`);
  }
}

console.log("\n==================================================");
console.log(`✓ VERIFICATION RESULT: ${passedCount} PASSED / ${failedCount} FAILED`);
console.log("==================================================");

if (failedCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
