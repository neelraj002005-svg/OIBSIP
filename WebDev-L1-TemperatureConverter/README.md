# ThermoShift — Temperature Converter

**Oasis Infobyte SIP Internship — Web Development & Designing**  
**Level 1 — Task 3: Temperature Converter**  
**Developer:** Neel Raj  
**Repository:** [neelraj002005-svg/OIBSIP](https://github.com/neelraj002005-svg/OIBSIP)  
**Task Folder:** `WebDev-L1-TemperatureConverter`

---

## 🌡️ Project Overview

**ThermoShift** is a modern, responsive, and interactive temperature conversion web application. It enables seamless conversion across **Celsius (°C)**, **Fahrenheit (°F)**, and **Kelvin (K)** with real-time visual feedback, strict input validation, physical absolute-zero boundary enforcement, and a reactive animated thermometer gauge.

The interface dynamically changes its ambient color palette based on the calculated temperature—shifting smoothly from icy blues and deep cyans in sub-zero conditions to comfortable ambers and fiery crimson at boiling temperatures.

---

## ✨ Features

- **Accurate Multi-Scale Conversion**:
  - Full bidirectional conversions among Celsius, Fahrenheit, and Kelvin using exact physical formulas.
  - Synchronized calculation: entering a value in any unit immediately displays results in all three units.
- **Segmented Radio-Button Unit Selector**:
  - Intuitive radio-button segmented control with a sliding accent indicator pill (no dropdowns).
  - Synchronized unit tag displayed directly inside the numeric input field.
- **Interactive Live Thermometer Gauge**:
  - Vertical liquid tube with level ticks and fluid bulb that visually reflects the temperature level.
  - Ambient color theme driven by dynamic CSS custom properties (`--h` hue calculation based on temperature in Celsius).
  - Live temperature status pill (e.g., *Freezing*, *Comfortable*, *Hot*, *Boiling and beyond*).
- **Quick Preset Buttons**:
  - Instant one-click presets for common reference points:
    - **Freezing**: 0 °C (32 °F / 273.15 K)
    - **Room**: 25 °C (77 °F / 298.15 K)
    - **Body**: 37 °C (98.6 °F / 310.15 K)
    - **Boiling**: 100 °C (212 °F / 373.15 K)
- **Robust Validation & Physical Bounds**:
  - Validates numeric input (rejects empty submissions, alphabetic characters, and malformed symbols).
  - Accepts positive and negative values, decimals, and comma or period decimal separators.
  - Enforces the laws of physics by rejecting temperatures below **Absolute Zero**:
    - Celsius: `< -273.15 °C`
    - Fahrenheit: `< -459.67 °F`
    - Kelvin: `< 0 K`
  - Accessible error feedback using `role="alert"` and shake visual indicators.
- **Source-Unit Result Highlighting**:
  - All three converted values are presented simultaneously in animated cards.
  - The input unit is automatically emphasized with an active accent border and glow (`.src`).
- **Fully Accessible & Responsive**:
  - Keyboard accessible with full `Tab` navigation, arrow key unit selection, and `Enter` key submission.
  - Mobile-first adaptive layout with custom breakpoints for desktop, tablet, and mobile displays.
  - Respects `prefers-reduced-motion` settings.

---

## 🛠️ Technologies Used

- **HTML5**: Semantic document layout, accessible form controls, ARIA live regions, and SVG icons.
- **CSS3**: Modern CSS Grid and Flexbox, custom properties (CSS variables), glassmorphism backdrop filters, 3D CSS transforms, and keyframe animations.
- **Vanilla JavaScript (ES6+)**: Event handling, rigorous input sanitization, floating-point rounding precision, color-interpolation math, and dynamic DOM manipulation.

---

## 📐 Conversion Formulas Applied

| From | To | Formula |
| :--- | :--- | :--- |
| **Celsius (°C)** | Fahrenheit (°F) | `°F = (°C × 9/5) + 32` |
| **Celsius (°C)** | Kelvin (K) | `K = °C + 273.15` |
| **Fahrenheit (°F)** | Celsius (°C) | `°C = (°F - 32) × 5/9` |
| **Fahrenheit (°F)** | Kelvin (K) | `K = ((°F - 32) × 5/9) + 273.15` |
| **Kelvin (K)** | Celsius (°C) | `°C = K - 273.15` |
| **Kelvin (K)** | Fahrenheit (°F) | `°F = ((K - 273.15) × 9/5) + 32` |

---

## 🚀 Local Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone https://github.com/neelraj002005-svg/OIBSIP.git
   cd OIBSIP/WebDev-L1-TemperatureConverter
   ```

2. **Open in Browser**:
   - Double click `index.html` to open directly in any modern browser (Chrome, Edge, Firefox, Safari).
   - Alternatively, serve via a local development server:
     ```bash
     # Using Python
     python -m http.server 8000

     # Using Node npx
     npx serve .
     ```
   - Navigate to `http://localhost:8000` in your web browser.

---

## 🧪 Verification & Testing Details

All conversions, validations, and UI behaviors have been rigorously tested:

| Test Case | Input | Expected Output | Status |
| :--- | :--- | :--- | :--- |
| **Freezing Point of Water** | `0` °C | `0 °C` = `32 °F` = `273.15 K` | Pass |
| **Boiling Point of Water** | `100` °C | `100 °C` = `212 °F` = `373.15 K` | Pass |
| **Fahrenheit Freezing** | `32` °F | `0 °C` = `32 °F` = `273.15 K` | Pass |
| **Kelvin Freezing** | `273.15` K | `0 °C` = `32 °F` = `273.15 K` | Pass |
| **Human Body Temperature** | `37` °C / `98.6` °F | `37 °C` = `98.6 °F` = `310.15 K` | Pass |
| **Celsius-Fahrenheit Coincidence** | `-40` °C | `-40 °C` = `-40 °F` = `233.15 K` | Pass |
| **Exact Absolute Zero (Celsius)** | `-273.15` °C | `-273.15 °C` = `-459.67 °F` = `0 K` | Pass |
| **Exact Absolute Zero (Fahrenheit)** | `-459.67` °F | `-273.15 °C` = `-459.67 °F` = `0 K` | Pass |
| **Exact Absolute Zero (Kelvin)** | `0` K | `-273.15 °C` = `-459.67 °F` = `0 K` | Pass |
| **Below Absolute Zero (Celsius)** | `-273.16` °C | Rejected: *"That is below absolute zero (-273.15°C)..."* | Pass |
| **Below Absolute Zero (Fahrenheit)** | `-460` °F | Rejected: *"That is below absolute zero (-459.67°F)..."* | Pass |
| **Below Absolute Zero (Kelvin)** | `-1` K | Rejected: *"That is below absolute zero (0 K)..."* | Pass |
| **Empty Input** | `""` (blank) | Rejected: *"Please enter a temperature value."* | Pass |
| **Invalid Text Input** | `"abc"`, `"12a"`, `"--5"` | Rejected: *"Only numbers are allowed (example: 25 or -4.5)."* | Pass |
| **Decimal Comma Support** | `"36,6"` °C | Normalized to `36.6` °C, converted successfully | Pass |
| **Quick Presets** | Click Freezing/Room/Body/Boiling | Immediately populates value and converts accurately | Pass |
| **Keyboard Accessibility** | `Tab`, `Arrow` keys, `Enter` | Focus outlines visible, form submits on Enter | Pass |
| **Mobile Responsiveness** | Viewports < 860px and < 480px | Fluid single-column layout, compact result cards | Pass |

---

## 📂 Project Structure

```
OIBSIP/
├── WebDev-L1-LandingPage/           # Task 1: FocusFlow Landing Page
├── WebDev-L1-PersonalPortfolio/     # Task 2: Personal Portfolio
├── WebDev-L1-TemperatureConverter/ # Task 3: ThermoShift Temperature Converter
│   ├── index.html                   # Semantic HTML5 markup & accessible layout
│   ├── style.css                    # CSS3 styling, glassmorphism, animations & media queries
│   ├── script.js                    # Core conversion engine, validation & gauge animations
│   └── README.md                    # Detailed documentation and verification test report
└── index.html                       # Oasis Infobyte Portfolio Hub
```

---

## 📄 License & Attribution

Developed as part of the **Oasis Infobyte SIP Internship (Web Development & Designing)**.  
Designed and implemented with pride by **Neel Raj**.
