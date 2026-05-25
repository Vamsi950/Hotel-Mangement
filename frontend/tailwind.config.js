/** @type {import('tailwindcss').Config} */
import forms from '@tailwindcss/forms';
import containerQueries from '@tailwindcss/container-queries';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      "colors": {
        "surface-container-highest": "#e3e2e6",
        "surface": "#faf9fd",
        "on-background": "#1a1c1e",
        "on-tertiary-container": "#d4903b",
        "surface-container": "#efedf1",
        "error-container": "#ffdad6",
        "surface-container-low": "#f4f3f7",
        "on-surface": "#1a1c1e",
        "surface-bright": "#faf9fd",
        "primary-fixed-dim": "#adc7f7",
        "secondary-fixed": "#d8e4eb",
        "on-error": "#ffffff",
        "on-secondary-fixed": "#111d22",
        "secondary-fixed-dim": "#bcc8cf",
        "on-tertiary-fixed-variant": "#673d00",
        "surface-container-lowest": "#ffffff",
        "inverse-on-surface": "#f1f0f4",
        "outline": "#74777f",
        "secondary-container": "#d5e2e9",
        "surface-tint": "#455f88",
        "on-primary": "#ffffff",
        "primary-fixed": "#d6e3ff",
        "tertiary-fixed-dim": "#ffb866",
        "on-secondary-fixed-variant": "#3c494e",
        "on-primary-container": "#86a0cd",
        "surface-dim": "#dad9dd",
        "surface-variant": "#e3e2e6",
        "on-tertiary-fixed": "#2b1700",
        "background": "#faf9fd",
        "on-tertiary": "#ffffff",
        "surface-container-high": "#e9e7eb",
        "secondary": "#546066",
        "primary": "#002045",
        "inverse-surface": "#2f3033",
        "on-error-container": "#93000a",
        "on-surface-variant": "#43474e",
        "on-secondary-container": "#58646a",
        "inverse-primary": "#adc7f7",
        "primary-container": "#1a365d",
        "on-primary-fixed": "#001b3c",
        "on-secondary": "#ffffff",
        "outline-variant": "#c4c6cf",
        "tertiary": "#321b00",
        "error": "#ba1a1a",
        "tertiary-fixed": "#ffddba",
        "tertiary-container": "#4f2e00",
        "on-primary-fixed-variant": "#2d476f"
      },
      "borderRadius": {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      "spacing": {
        "md": "24px",
        "xs": "4px",
        "lg": "48px",
        "base": "8px",
        "sm": "12px",
        "xl": "80px",
        "container-max": "1280px",
        "gutter": "24px"
      },
      "fontFamily": {
        "display-lg": ["Montserrat", "sans-serif"],
        "body-sm": ["Inter", "sans-serif"],
        "headline-md": ["Montserrat", "sans-serif"],
        "headline-sm": ["Montserrat", "sans-serif"],
        "body-md": ["Inter", "sans-serif"],
        "body-lg": ["Inter", "sans-serif"],
        "label-uppercase": ["Inter", "sans-serif"]
      },
      "fontSize": {
        "display-lg": ["48px", { "lineHeight": "56px", "letterSpacing": "-0.02em", "fontWeight": "700" }],
        "body-sm": ["14px", { "lineHeight": "20px", "fontWeight": "400" }],
        "headline-md": ["24px", { "lineHeight": "32px", "fontWeight": "600" }],
        "headline-sm": ["20px", { "lineHeight": "28px", "fontWeight": "600" }],
        "body-md": ["16px", { "lineHeight": "24px", "fontWeight": "400" }],
        "body-lg": ["18px", { "lineHeight": "28px", "fontWeight": "400" }],
        "label-uppercase": ["12px", { "lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "600" }]
      }
    },
  },
  plugins: [
    forms,
    containerQueries,
  ],
}
