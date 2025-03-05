import { createGlobalStyle } from 'styled-components';

/**
 * GlobalStyles - Global styling for the IT Service Desk application
 * 
 * This file defines global styles using styled-components.
 * It includes reset styles, typography, common elements styling,
 * utility classes, and responsive design adjustments.
 */
const GlobalStyles = createGlobalStyle`
  /* CSS Reset */
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  /* Custom Properties (CSS Variables) */
  :root {
    /* Color Palette */
    --color-primary: #2563eb;
    --color-primary-light: #3b82f6;
    --color-primary-dark: #1d4ed8;
    
    --color-secondary: #10b981;
    --color-secondary-light: #34d399;
    --color-secondary-dark: #059669;
    
    --color-danger: #ef4444;
    --color-danger-light: #f87171;
    --color-danger-dark: #dc2626;
    
    --color-warning: #f59e0b;
    --color-warning-light: #fbbf24;
    --color-warning-dark: #d97706;
    
    --color-info: #3b82f6;
    --color-info-light: #60a5fa;
    --color-info-dark: #2563eb;
    
    --color-success: #10b981;
    --color-success-light: #34d399;
    --color-success-dark: #059669;
    
    /* Neutral Colors */
    --color-white: #ffffff;
    --color-black: #000000;
    --color-gray-50: #f9fafb;
    --color-gray-100: #f3f4f6;
    --color-gray-200: #e5e7eb;
    --color-gray-300: #d1d5db;
    --color-gray-400: #9ca3af;
    --color-gray-500: #6b7280;
    --color-gray-600: #4b5563;
    --color-gray-700: #374151;
    --color-gray-800: #1f2937;
    --color-gray-900: #111827;
    
    /* Status Colors for Incidents */
    --status-new: #3b82f6;
    --status-assigned: #8b5cf6;
    --status-in-progress: #f59e0b;
    --status-on-hold: #6b7280;
    --status-resolved: #10b981;
    --status-closed: #1f2937;
    --status-cancelled: #ef4444;
    
    /* Priority Colors for Incidents */
    --priority-low: #10b981;
    --priority-medium: #f59e0b;
    --priority-high: #ef4444;
    --priority-critical: #b91c1c;
    
    /* Equipment Status Colors */
    --equipment-available: #10b981;
    --equipment-in-use: #3b82f6;
    --equipment-under-maintenance: #f59e0b;
    --equipment-broken: #ef4444;
    --equipment-decommissioned: #6b7280;
    
    /* Typography */
    --font-family-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    --font-family-mono: 'JetBrains Mono', 'SF Mono', 'Fira Code', Consolas, 'Courier New', monospace;
    
    /* Font Sizes */
    --font-size-xs: 0.75rem;   /* 12px */
    --font-size-sm: 0.875rem;  /* 14px */
    --font-size-base: 1rem;    /* 16px */
    --font-size-lg: 1.125rem;  /* 18px */
    --font-size-xl: 1.25rem;   /* 20px */
    --font-size-2xl: 1.5rem;   /* 24px */
    --font-size-3xl: 1.875rem; /* 30px */
    --font-size-4xl: 2.25rem;  /* 36px */
    
    /* Font Weights */
    --font-weight-light: 300;
    --font-weight-normal: 400;
    --font-weight-medium: 500;
    --font-weight-semibold: 600;
    --font-weight-bold: 700;
    
    /* Line Heights */
    --line-height-tight: 1.25;
    --line-height-snug: 1.375;
    --line-height-normal: 1.5;
    --line-height-relaxed: 1.625;
    --line-height-loose: 2;
    
    /* Spacing */
    --spacing-0: 0;
    --spacing-1: 0.25rem;  /* 4px */
    --spacing-2: 0.5rem;   /* 8px */
    --spacing-3: 0.75rem;  /* 12px */
    --spacing-4: 1rem;     /* 16px */
    --spacing-5: 1.25rem;  /* 20px */
    --spacing-6: 1.5rem;   /* 24px */
    --spacing-8: 2rem;     /* 32px */
    --spacing-10: 2.5rem;  /* 40px */
    --spacing-12: 3rem;    /* 48px */
    --spacing-16: 4rem;    /* 64px */
    --spacing-20: 5rem;    /* 80px */
    --spacing-24: 6rem;    /* 96px */
    
    /* Border Radius */
    --border-radius-none: 0;
    --border-radius-sm: 0.125rem;  /* 2px */
    --border-radius-md: 0.25rem;   /* 4px */
    --border-radius-lg: 0.5rem;    /* 8px */
    --border-radius-xl: 0.75rem;   /* 12px */
    --border-radius-2xl: 1rem;     /* 16px */
    --border-radius-full: 9999px;
    
    /* Shadows */
    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    --shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    --shadow-inner: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
    
    /* Z-index */
    --z-index-0: 0;
    --z-index-10: 10;
    --z-index-20: 20;
    --z-index-30: 30;
    --z-index-40: 40;
    --z-index-50: 50;
    --z-index-auto: auto;
    
    /* Transitions */
    --transition-fast: 150ms;
    --transition-normal: 300ms;
    --transition-slow: 500ms;
    
    /* Layout */
    --header-height: 64px;
    --sidebar-width: 250px;
    --sidebar-collapsed-width: 64px;
    --content-max-width: 1200px;
    
    /* Breakpoints */
    --breakpoint-sm: 640px;
    --breakpoint-md: 768px;
    --breakpoint-lg: 1024px;
    --breakpoint-xl: 1280px;
    --breakpoint-2xl: 1536px;
  }

  /* Dark Mode Theme Variables */
  [data-theme="dark"] {
    --color-primary: #3b82f6;
    --color-primary-light: #60a5fa;
    --color-primary-dark: #2563eb;
    
    /* Background and Text Colors */
    --bg-primary: var(--color-gray-900);
    --bg-secondary: var(--color-gray-800);
    --bg-tertiary: var(--color-gray-700);
    --text-primary: var(--color-gray-100);
    --text-secondary: var(--color-gray-300);
    --text-tertiary: var(--color-gray-400);
    
    /* Form Elements */
    --input-bg: var(--color-gray-800);
    --input-border: var(--color-gray-700);
    --input-text: var(--color-gray-100);
    --input-placeholder: var(--color-gray-500);
    
    /* Card and Container */
    --card-bg: var(--color-gray-800);
    --card-border: var(--color-gray-700);
    
    /* Sidebar and Header */
    --sidebar-bg: var(--color-gray-900);
    --sidebar-text: var(--color-gray-100);
    --header-bg: var(--color-gray-900);
    --header-text: var(--color-gray-100);
  }

  /* Light Mode Theme Variables (default) */
  :root, [data-theme="light"] {
    /* Background and Text Colors */
    --bg-primary: var(--color-white);
    --bg-secondary: var(--color-gray-50);
    --bg-tertiary: var(--color-gray-100);
    --text-primary: var(--color-gray-900);
    --text-secondary: var(--color-gray-700);
    --text-tertiary: var(--color-gray-500);
    
    /* Form Elements */
    --input-bg: var(--color-white);
    --input-border: var(--color-gray-300);
    --input-text: var(--color-gray-900);
    --input-placeholder: var(--color-gray-400);
    
    /* Card and Container */
    --card-bg: var(--color-white);
    --card-border: var(--color-gray-200);
    
    /* Sidebar and Header */
    --sidebar-bg: var(--color-gray-800);
    --sidebar-text: var(--color-gray-100);
    --header-bg: var(--color-white);
    --header-text: var(--color-gray-900);
  }

  /* Base HTML Elements */
  html {
    font-size: 16px;
    scroll-behavior: smooth;
  }

  body {
    font-family: var(--font-family-sans);
    font-size: var(--font-size-base);
    line-height: var(--line-height-normal);
    color: var(--text-primary);
    background-color: var(--bg-secondary);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
  }

  /* Typography */
  h1, h2, h3, h4, h5, h6 {
    margin-bottom: var(--spacing-4);
    font-weight: var(--font-weight-bold);
    line-height: var(--line-height-tight);
    color: var(--text-primary);
  }

  h1 {
    font-size: var(--font-size-3xl);
  }

  h2 {
    font-size: var(--font-size-2xl);
  }

  h3 {
    font-size: var(--font-size-xl);
  }

  h4 {
    font-size: var(--font-size-lg);
  }

  h5 {
    font-size: var(--font-size-base);
  }

  h6 {
    font-size: var(--font-size-sm);
  }

  p {
    margin-bottom: var(--spacing-4);
  }

  a {
    color: var(--color-primary);
    text-decoration: none;
    transition: color var(--transition-fast) ease-in-out;
  }

  a:hover {
    color: var(--color-primary-dark);
    text-decoration: underline;
  }

  small {
    font-size: var(--font-size-sm);
  }

  strong, b {
    font-weight: var(--font-weight-bold);
  }

  code, pre {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-sm);
    background-color: var(--bg-tertiary);
    border-radius: var(--border-radius-md);
  }

  code {
    padding: var(--spacing-1) var(--spacing-2);
  }

  pre {
    padding: var(--spacing-4);
    overflow-x: auto;
    margin-bottom: var(--spacing-4);
  }

  hr {
    margin: var(--spacing-6) 0;
    border: 0;
    border-top: 1px solid var(--color-gray-200);
  }

  /* Lists */
  ul, ol {
    margin-bottom: var(--spacing-4);
    padding-left: var(--spacing-6);
  }

  li {
    margin-bottom: var(--spacing-2);
  }

  /* Form Elements */
  input, textarea, select, button {
    font-family: var(--font-family-sans);
    font-size: var(--font-size-base);
  }

  input, textarea, select {
    width: 100%;
    padding: var(--spacing-2) var(--spacing-3);
    background-color: var(--input-bg);
    border: 1px solid var(--input-border);
    border-radius: var(--border-radius-md);
    color: var(--input-text);
    transition: border-color var(--transition-fast) ease-in-out, box-shadow var(--transition-fast) ease-in-out;
  }

  input:focus, textarea:focus, select:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  input::placeholder, textarea::placeholder {
    color: var(--input-placeholder);
  }

  input:disabled, textarea:disabled, select:disabled {
    background-color: var(--color-gray-100);
    cursor: not-allowed;
  }

  button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-2) var(--spacing-4);
    font-weight: var(--font-weight-medium);
    border-radius: var(--border-radius-md);
    border: none;
    cursor: pointer;
    transition: background-color var(--transition-fast) ease-in-out, color var(--transition-fast) ease-in-out, box-shadow var(--transition-fast) ease-in-out;
  }

  /* Tables */
  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: var(--spacing-6);
  }

  th, td {
    padding: var(--spacing-3) var(--spacing-4);
    text-align: left;
    border-bottom: 1px solid var(--color-gray-200);
  }

  th {
    font-weight: var(--font-weight-semibold);
    background-color: var(--bg-tertiary);
  }

  tr:hover {
    background-color: var(--bg-tertiary);
  }

  /* Cards */
  .card {
    background-color: var(--card-bg);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-md);
    padding: var(--spacing-6);
    margin-bottom: var(--spacing-6);
    border: 1px solid var(--card-border);
  }

  /* Layout Utilities */
  .container {
    width: 100%;
    max-width: var(--content-max-width);
    margin: 0 auto;
    padding: 0 var(--spacing-4);
  }

  .main-content {
    margin-left: var(--sidebar-width);
    padding: var(--spacing-6);
    min-height: calc(100vh - var(--header-height));
    transition: margin-left var(--transition-normal) ease-in-out;
  }

  .main-content.sidebar-collapsed {
    margin-left: var(--sidebar-collapsed-width);
  }

  /* Flexbox Utilities */
  .flex {
    display: flex;
  }

  .flex-col {
    flex-direction: column;
  }

  .items-center {
    align-items: center;
  }

  .justify-center {
    justify-content: center;
  }

  .justify-between {
    justify-content: space-between;
  }

  .flex-wrap {
    flex-wrap: wrap;
  }

  .flex-1 {
    flex: 1;
  }

  .gap-1 {
    gap: var(--spacing-1);
  }

  .gap-2 {
    gap: var(--spacing-2);
  }

  .gap-4 {
    gap: var(--spacing-4);
  }

  /* Spacing Utilities */
  .m-0 {
    margin: var(--spacing-0);
  }

  .m-1 {
    margin: var(--spacing-1);
  }

  .m-2 {
    margin: var(--spacing-2);
  }

  .m-4 {
    margin: var(--spacing-4);
  }

  .mt-1 {
    margin-top: var(--spacing-1);
  }

  .mt-2 {
    margin-top: var(--spacing-2);
  }

  .mt-4 {
    margin-top: var(--spacing-4);
  }

  .mb-1 {
    margin-bottom: var(--spacing-1);
  }

  .mb-2 {
    margin-bottom: var(--spacing-2);
  }

  .mb-4 {
    margin-bottom: var(--spacing-4);
  }

  .ml-1 {
    margin-left: var(--spacing-1);
  }

  .ml-2 {
    margin-left: var(--spacing-2);
  }

  .ml-4 {
    margin-left: var(--spacing-4);
  }

  .mr-1 {
    margin-right: var(--spacing-1);
  }

  .mr-2 {
    margin-right: var(--spacing-2);
  }

  .mr-4 {
    margin-right: var(--spacing-4);
  }

  .p-0 {
    padding: var(--spacing-0);
  }

  .p-1 {
    padding: var(--spacing-1);
  }

  .p-2 {
    padding: var(--spacing-2);
  }

  .p-4 {
    padding: var(--spacing-4);
  }

  .pt-1 {
    padding-top: var(--spacing-1);
  }

  .pt-2 {
    padding-top: var(--spacing-2);
  }

  .pt-4 {
    padding-top: var(--spacing-4);
  }

  .pb-1 {
    padding-bottom: var(--spacing-1);
  }

  .pb-2 {
    padding-bottom: var(--spacing-2);
  }

  .pb-4 {
    padding-bottom: var(--spacing-4);
  }

  .pl-1 {
    padding-left: var(--spacing-1);
  }

  .pl-2 {
    padding-left: var(--spacing-2);
  }

  .pl-4 {
    padding-left: var(--spacing-4);
  }

  .pr-1 {
    padding-right: var(--spacing-1);
  }

  .pr-2 {
    padding-right: var(--spacing-2);
  }

  .pr-4 {
    padding-right: var(--spacing-4);
  }

  /* Text Utilities */
  .text-center {
    text-align: center;
  }

  .text-left {
    text-align: left;
  }

  .text-right {
    text-align: right;
  }

  .text-sm {
    font-size: var(--font-size-sm);
  }

  .text-base {
    font-size: var(--font-size-base);
  }

  .text-lg {
    font-size: var(--font-size-lg);
  }

  .text-xl {
    font-size: var(--font-size-xl);
  }

  .font-bold {
    font-weight: var(--font-weight-bold);
  }

  .font-semibold {
    font-weight: var(--font-weight-semibold);
  }

  .font-medium {
    font-weight: var(--font-weight-medium);
  }

  .font-normal {
    font-weight: var(--font-weight-normal);
  }

  .text-primary {
    color: var(--text-primary);
  }

  .text-secondary {
    color: var(--text-secondary);
  }

  .text-tertiary {
    color: var(--text-tertiary);
  }

  /* Status and Priority Badges */
  .badge {
    display: inline-flex;
    align-items: center;
    padding: var(--spacing-1) var(--spacing-2);
    border-radius: var(--border-radius-full);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-medium);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  /* Status Badges */
  .badge-status-new {
    background-color: var(--status-new);
    color: white;
  }

  .badge-status-assigned {
    background-color: var(--status-assigned);
    color: white;
  }

  .badge-status-in-progress {
    background-color: var(--status-in-progress);
    color: white;
  }

  .badge-status-on-hold {
    background-color: var(--status-on-hold);
    color: white;
  }

  .badge-status-resolved {
    background-color: var(--status-resolved);
    color: white;
  }

  .badge-status-closed {
    background-color: var(--status-closed);
    color: white;
  }

  .badge-status-cancelled {
    background-color: var(--status-cancelled);
    color: white;
  }

  /* Priority Badges */
  .badge-priority-low {
    background-color: var(--priority-low);
    color: white;
  }

  .badge-priority-medium {
    background-color: var(--priority-medium);
    color: white;
  }

  .badge-priority-high {
    background-color: var(--priority-high);
    color: white;
  }

  .badge-priority-critical {
    background-color: var(--priority-critical);
    color: white;
  }

  /* Equipment Status Badges */
  .badge-equipment-available {
    background-color: var(--equipment-available);
    color: white;
  }

  .badge-equipment-in-use {
    background-color: var(--equipment-in-use);
    color: white;
  }

  .badge-equipment-under-maintenance {
    background-color: var(--equipment-under-maintenance);
    color: white;
  }

  .badge-equipment-broken {
    background-color: var(--equipment-broken);
    color: white;
  }

  .badge-equipment-decommissioned {
    background-color: var(--equipment-decommissioned);
    color: white;
  }

  /* Button Variants */
  .btn-primary {
    background-color: var(--color-primary);
    color: white;
  }

  .btn-primary:hover {
    background-color: var(--color-primary-dark);
  }

  .btn-secondary {
    background-color: var(--color-secondary);
    color: white;
  }

  .btn-secondary:hover {
    background-color: var(--color-secondary-dark);
  }

  .btn-danger {
    background-color: var(--color-danger);
    color: white;
  }

  .btn-danger:hover {
    background-color: var(--color-danger-dark);
  }

  .btn-warning {
    background-color: var(--color-warning);
    color: white;
  }

  .btn-warning:hover {
    background-color: var(--color-warning-dark);
  }

  .btn-info {
    background-color: var(--color-info);
    color: white;
  }

  .btn-info:hover {
    background-color: var(--color-info-dark);
  }

  .btn-success {
    background-color: var(--color-success);
    color: white;
  }

  .btn-success:hover {
    background-color: var(--color-success-dark);
  }

  .btn-outline {
    background-color: transparent;
    border: 1px solid var(--color-gray-300);
    color: var(--text-primary);
  }

  .btn-outline:hover {
    background-color: var(--bg-tertiary);
  }

  .btn-sm {
    padding: var(--spacing-1) var(--spacing-2);
    font-size: var(--font-size-sm);
  }

  .btn-lg {
    padding: var(--spacing-3) var(--spacing-6);
    font-size: var(--font-size-lg);
  }

  .btn-icon {
    padding: var(--spacing-2);
    border-radius: var(--border-radius-full);
  }

  .btn-disabled, button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* Responsive Design */
  @media (max-width: 1024px) {
    :root {
      --sidebar-width: 200px;
    }
    
    .container {
      padding: 0 var(--spacing-3);
    }
  }

  @media (max-width: 768px) {
    :root {
      --sidebar-width: 0;
    }
    
    .main-content {
      margin-left: 0;
      padding: var(--spacing-4);
    }
    
    .main-content.sidebar-collapsed {
      margin-left: 0;
    }
    
    h1 {
      font-size: var(--font-size-2xl);
    }
    
    h2 {
      font-size: var(--font-size-xl);
    }
  }

  @media (max-width: 640px) {
    html {
      font-size: 14px;
    }
    
    .card {
      padding: var(--spacing-4);
    }
  }

  /* Animations */
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideInLeft {
    from {
      transform: translateX(-20px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideInRight {
    from {
      transform: translateX(20px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideInUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  /* Animation Utilities */
  .animate-fade-in {
    animation: fadeIn var(--transition-normal) ease-in-out;
  }

  .animate-slide-in-left {
    animation: slideInLeft var(--transition-normal) ease-in-out;
  }

  .animate-slide-in-right {
    animation: slideInRight var(--transition-normal) ease-in-out;
  }

  .animate-slide-in-up {
    animation: slideInUp var(--transition-normal) ease-in-out;
  }

  /* Accessibility */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }

  /* Focus Styles for Accessibility */
  :focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }

  /* Scrollbar Styling */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: var(--bg-tertiary);
  }

  ::-webkit-scrollbar-thumb {
    background: var(--color-gray-400);
    border-radius: var(--border-radius-full);
  }

  ::-webkit-scrollbar-thumb:hover {
    background: var(--color-gray-500);
  }
`;

export default GlobalStyles;