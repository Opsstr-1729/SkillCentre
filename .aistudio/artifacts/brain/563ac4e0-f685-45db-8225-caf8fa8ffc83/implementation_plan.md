# Centre Infrastructure & Facility Data Collection

A streamlined, institutional data collection portal and executive intelligence dashboard designed for government departments (Employment, ASAP, KASE, and ITD) with an authoritative `#0e5774` deep teal palette, conditional intake sections, active 3:00 PM deadline tracking, automated real-time summary reporting, and instant Google Sheets & Excel export.

### User Review & Critical Decisions

> [!IMPORTANT]
> Revised with your requested `#0e5774` color palette and streamlined workflow.

- **Color Palette Update**: Primary palette anchored around `#0e5774` (Deep Institutional Teal) with cohesive light tints (`#eaf4f8`, `#f2f8fb`), dark slate typography, and clean contrast.
- **Streamlined Workflow**: Direct, no-fluff intake interface matching the exact prompt structure:
  - Stakeholder Category selector (Employment, ASAP, KASE, ITD)
  - General Centre Details (Centre Name, District)
  - Conditional Department Parts (2A for Employment, 2B for ASAP, 2C for KASE, 2D for ITD)
- **Automated Summary Report**: Real-time KPI cards and departmental breakdowns that automatically recalculate with each submission, printable as an executive summary.
- **Google Sheets & Excel Integration**: One-click Google Sheet export (formatted TSV/CSV with automatic copy-to-clipboard, direct Google Sheets link, and downloadable file).

---

### 1. Overview & Core Concept

The portal provides an authoritative, single-screen data collection workflow for:
1. **Employment Centres**: Built-up sq. ft., interview/counseling room availability, condition & amenities.
2. **ASAP (Community Skill Parks)**: CSP name, operational status, trainee capacity, specialized labs/machinery.
3. **KASE Centres**: Total land area (Acres/Cents), built-up space, utilization status, vacant space specifics.
4. **ITD Centres**: Computer labs count, functional systems total, internet connectivity level, smart classrooms/projectors.

Includes a live 3:00 PM deadline countdown and automatic audit timestamps on every record.

---

### 2. User Experience & Visual Design

#### Visual Identity & Theme
- **Primary Color**: `#0e5774` (Deep Teal) for top header, primary action buttons, active navigation states, and key metric emphasis.
- **Secondary & Surface Palette**:
  - Background: `#f8fafc` soft neutral with `#ffffff` card surfaces.
  - Surface accents: `#eaf4f8` (subtle teal-tinted background for active states and banners).
  - Borders: `#e2e8f0` crisp hairline dividers.
  - Text: `#0f172a` (high-contrast slate for headings) and `#334155` for body labels.
- **Typography**: Clean contemporary typography with tabular numerals (`font-mono tabular-nums`) for exact numeric alignment in summary tables.
- **Layout Rhythm**:
  - Fixed top bar with title, department badges, and live 3:00 PM deadline counter.
  - Main tab switcher between **"Data Collection Form"**, **"Executive Summary Report"**, and **"All Submissions Ledger"**.

---

### 3. Key Product Decisions & Architecture

- **Color Discipline**: Strict use of `#0e5774` as the 10% high-intent accent and brand anchor, maintaining WCAG AA contrast.
- **Instant Persistence & Export**: Submissions persist immediately to client storage. "Export to Google Sheets" opens a dedicated modal with:
  1. Instant "Copy for Google Sheets" button (tab-separated values ready to paste into any new or existing Google Sheet).
  2. "Open Google Sheets" quick-action link.
  3. "Download CSV / Excel" for offline distribution.
- **Real-Time Automated Summary**:
  - Dynamic KPI aggregation without page reload.
  - Print-ready CSS for generating a clean 1-page executive PDF/paper report.
  - Pre-seeded Kerala sample records for instant testing of all four departments.
