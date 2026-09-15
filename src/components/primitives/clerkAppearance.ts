import { dark } from "@clerk/themes";

/**
 * Shared Clerk theming.
 *
 * SignInNudge previously rendered <SignIn> with no appearance prop at all, so a
 * default light-mode Clerk card appeared inside a black brutalist dialog.
 * Both sign-in surfaces now use this.
 *
 * Clerk's appearance API resolves these at runtime and cannot read CSS custom
 * properties, so this is the one place literal hex values belong. Keep them in
 * step with src/styles/tokens.css.
 */
export const clerkAppearance = {
  baseTheme: dark,
  variables: {
    colorBackground: "#050505",
    colorInputBackground: "#000000",
    colorText: "#FFFFFF",
    colorTextSecondary: "#888888",
    colorPrimary: "#d4ff00",
    colorNeutral: "#FFFFFF",
    borderRadius: "0px",
    fontFamily: "'Inter', sans-serif",
    colorInputText: "#FFFFFF",
  },
  elements: {
    card: {
      boxShadow: "4px 4px 0 #333333",
      border: "2px solid #333333",
      background: "#0a0a0a",
      padding: "32px",
    },
    headerTitle: { display: "none" },
    headerSubtitle: { display: "none" },
    socialButtonsBlockButton: {
      border: "2px solid #333333",
      borderRadius: "0px",
      boxShadow: "2px 2px 0 #333333",
    },
    formButtonPrimary: {
      border: "2px solid #d4ff00",
      borderRadius: "0px",
      boxShadow: "4px 4px 0 #d4ff00",
      textTransform: "uppercase",
      fontWeight: "bold",
      color: "#000",
    },
    formFieldInput: {
      border: "2px solid #333333",
      borderRadius: "0px",
    },
  },
} as const;
