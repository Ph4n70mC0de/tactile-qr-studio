# Tactile QR Studio

Design and generate QR codes with a Neumorphic editor.

## Overview

QR Studio is a client-side React application for creating, customizing, and exporting QR codes. It runs entirely in the browser: no server, no API keys, and no external dependencies for QR generation.

## Features

Five content types: text, URL, email, phone, and Wi-Fi. Live preview renders QR codes in real time using `qr-code-styling`.

Appearance options include foreground and background colors, transparent backgrounds, pixel styles (square, dots, rounded), corner/finder styles (square, dot, extra-rounded), error correction levels (L, M, Q, H), custom QR sizes from 128px to 1024px, quiet zone margin control, and an optional center logo with size control.

Design presets offer one-click appearance themes: Classic, Soft, High Contrast, Minimal, Dark Mode, and Accent.

Validation includes input checks for each content type, contrast ratio checking (WCAG 4.5:1 minimum), logo size and error-correction guidance, payload density warnings, and logo URL validation.

Export formats are PNG and SVG with auto-generated filenames.

Accessibility features include keyboard navigation, ARIA labels and roles, visible focus indicators, reduced motion support, and screen reader announcements. The design is responsive and works on mobile, tablet, and desktop.

## Getting Started

### Prerequisites

- Node.js 18+ (tested with Node.js 22)
- npm 10+

### Installation

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) to view the app in your browser.

### Build

Create a production build:

```bash
npm run build
```

### Preview

Preview the production build locally:

```bash
npm run preview
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Run ESLint with auto-fix |
| `npm test` | Run tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:ui` | Run tests with the Vitest UI |
| `npm run clean` | Remove the build output directory |

## Quality Gates

Every pull request should pass all four gates:

```bash
npm run typecheck  # TypeScript type checking
npm run lint       # ESLint
npm test           # Vitest
npm run build      # Vite production build
```

## Architecture

```
src/
├── App.tsx                    # Main application component
├── main.tsx                   # React entry point
├── index.css                  # Global styles and Neumorphic theme
├── types.ts                   # Domain type definitions
├── domain/                    # Business logic layer
│   ├── qrPayload.ts           # QR payload string generation
│   ├── qrValidation.ts        # Input and reliability validation
│   ├── qrAppearance.ts        # Appearance defaults and constraints
│   ├── qrExport.ts            # Export format and filename utilities
├── hooks/
│   └── useQREditor.ts         # Editor state management
├── lib/
│   ├── presets.ts             # Design presets
│   └── utils.ts               # Shared utilities (class merging, contrast)
├── components/
│   ├── QRPreview.tsx          # Live QR code preview
│   ├── QRContentForm.tsx      # Content type forms
│   ├── QRAppearanceForm.tsx   # Appearance customization controls
│   └── ui/                    # Reusable UI components
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       ├── Label.tsx
│       ├── Slider.tsx
│       └── Textarea.tsx
```

## Domain Model

### Content Types

| Type | Fields | Validation |
|------|--------|------------|
| `text` | `text: string` | Non-empty, warns on payloads > 4296 chars |
| `url` | `url: string` | Non-empty, HTTP/HTTPS only, auto-adds https:// |
| `email` | `email`, `subject?`, `body?` | Valid email format, subject ≤ 255 chars |
| `phone` | `phone: string` | Digits, spaces, +, -, (), . |
| `wifi` | `ssid`, `password?`, `encryption`, `hidden` | SSID required, password for encrypted networks |

### Appearance

| Property | Range | Default |
|----------|-------|---------|
| `size` | 128 – 1024 | 300 |
| `margin` | 0 – 40 | 10 |
| `foregroundColor` | Any hex color | `#000000` |
| `backgroundColor` | Any hex color | `#ffffff` |
| `transparentBackground` | boolean | `false` |
| `moduleStyle` | `square` \| `dots` \| `rounded` | `square` |
| `finderStyle` | `square` \| `dot` \| `extra-rounded` | `square` |
| `errorCorrectionLevel` | `L` \| `M` \| `Q` \| `H` | `M` |
| `logoUrl` | URL string | `undefined` |
| `logoSize` | 0 – 0.8 | `0.4` |

## Technology Stack

- React 19: UI framework
- TypeScript 5.8: Type safety
- Vite 6: Build tooling and dev server
- Tailwind CSS 4: Styling
- qr-code-styling: QR code generation
- Lucide React: Icons
- ESLint 9: Linting
- Vitest: Testing
- @testing-library/react: Component testing

## License

[MIT](./LICENSE)
