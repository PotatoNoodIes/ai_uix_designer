import { dark } from "@clerk/themes";

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
