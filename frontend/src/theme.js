export const RAG_COLOR = { Red: "#FF4D6D", Amber: "#FFB020", Green: "#2ECC71", Unknown: "#9296C9" };

/* Every color used anywhere in the app is defined ONCE here as a
   CSS variable, then consumed via plain utility classes below
   (bg-app, text-primary, border-default, ...). To re-theme the
   whole app, edit only this block — nothing else needs to change. */
export const THEME_CSS = `
  .theme-dark {
    --bg-app: #1E2150;
    --bg-sidebar: #191C47;
    --bg-panel: #272B63;
    --bg-input: #323672;
    --bg-active: #333A7C;
    --bg-accent: #5B7CFA;
    --bg-accent-2: #2DD4BF;
    --bg-red: #FF4D6D;
    --bg-amber: #FFB020;
    --bg-warning: #3A2F5C;

    --border-default: #383C7E;
    --border-accent: #5B7CFA;
    --border-warning: #5B4A8A;

    --text-primary: #F5F6FF;
    --text-secondary: #C7CAF2;
    --text-tertiary: #A7ABDD;
    --text-muted: #9296C9;
    --text-dim: #9296C9;
    --text-onaccent: #FFFFFF;
    --text-bubble: #E6E7FA;
    --text-green: #2ECC71;
    --text-amber: #FFB020;
    --text-red: #FF4D6D;
    --text-accent: #8FA6FF;
    --text-warning: #F0C674;

    --shadow-card: 0 1px 2px rgba(10, 8, 40, 0.15), 0 8px 24px rgba(10, 8, 40, 0.22);
  }

  .theme-light {
    --bg-app: #F1F3F9;
    --bg-sidebar: #F8F9FD;
    --bg-panel: #FDFDFE;
    --bg-input: #EEF1FA;
    --bg-active: #E6EBFC;
    --bg-accent: #4A6EF5;
    --bg-accent-2: #14B8A6;
    --bg-red: #EF4444;
    --bg-amber: #F59E0B;
    --bg-warning: #FEF3E2;

    --border-default: #DFE3F0;
    --border-accent: #4A6EF5;
    --border-warning: #F7D9A3;

    --text-primary: #20222E;
    --text-secondary: #565A72;
    --text-tertiary: #767AA0;
    --text-muted: #9498AC;
    --text-dim: #A6AABD;
    --text-onaccent: #FFFFFF;
    --text-bubble: #1F2437;
    --text-green: #15803D;
    --text-amber: #C2680A;
    --text-red: #DC2626;
    --text-accent: #4A5FE0;
    --text-warning: #A2540A;

    --shadow-card: 0 1px 3px rgba(29, 30, 44, 0.05), 0 6px 18px rgba(60, 68, 130, 0.08);
  }

  .bg-app { background-color: var(--bg-app); }
  .bg-sidebar { background-color: var(--bg-sidebar); }
  .bg-panel { background-color: var(--bg-panel); box-shadow: var(--shadow-card); }
  .bg-input { background-color: var(--bg-input); }
  .bg-active { background-color: var(--bg-active); }
  .bg-accent { background-color: var(--bg-accent); }
  .bg-red-solid { background-color: var(--bg-red); }
  .bg-amber-solid { background-color: var(--bg-amber); }
  .bg-warning { background-color: var(--bg-warning); }

  .border-default { border-color: var(--border-default); }
  .border-accent { border-color: var(--border-accent); }
  .border-warning { border-color: var(--border-warning); }

  .text-primary { color: var(--text-primary); }
  .text-secondary { color: var(--text-secondary); }
  .text-tertiary { color: var(--text-tertiary); }
  .text-muted { color: var(--text-muted); }
  .text-dim { color: var(--text-dim); }
  .text-onaccent { color: var(--text-onaccent); }
  .text-bubble { color: var(--text-bubble); }
  .text-green { color: var(--text-green); }
  .text-amber { color: var(--text-amber); }
  .text-red { color: var(--text-red); }
  .text-accent { color: var(--text-accent); }
  .text-warning { color: var(--text-warning); }

  .gradient-accent { background-image: linear-gradient(135deg, var(--bg-accent), var(--bg-accent-2)); }
  .overlay-dim { background-color: rgba(10, 8, 40, 0.55); }

  .hover-bg-input:hover { background-color: var(--bg-input); }
  .hover-bg-active:hover { background-color: var(--bg-active); }
  .hover-text-bubble:hover { color: var(--text-bubble); }
  .hover-text-primary:hover { color: var(--text-primary); }

  .placeholder-dim::placeholder { color: var(--text-dim); }
`;
