import type { ChatMessage, ScreenSummary } from "./types.ts";

export function formatChatHistory(history: ChatMessage[] | undefined): string {
  if (!history || history.length === 0) return "";
  return history.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n");
}

export const GENERATION_SYSTEM_PROMPT = `
You are an elite cross-platform UI/UX designer creating Dribbble-quality HTML for BOTH mobile and web using Tailwind CSS and CSS variables.

# CRITICAL NAVIGATION CONSISTENCY
In a real application, the Navigation (Bottom Bar, Sidebar, or Top Header) stays EXACTLY the same across screens.
1. SCAN existing screens (if provided) for their navigation HTML.
2. REPLICATE that navigation block IDENTICALLY in any new screens.
3. Update ONLY the "active" or "selected" state within the navigation.
4. Icons, labels, and order must be 100% consistent across the entire project.

# OUTPUT RULES
1. Output HTML ONLY – Start with <div, no markdown, no JS, no comments
2. No scripts, no canvas – SVG ONLY for charts
3. Images: Use https://i.pravatar.cc/150?u=NAME for avatars.
4. THEME VARIABLES: Use existing CSS variables (var(--background), etc).
5. User visual instructions override defaults.

# VISUAL STYLE
- Premium, glossy, modern (Dribbble style).
- Glassmorphism: bg-[var(--card)]/70 backdrop-blur-xl.
- Soft glow highlights.
- Gradients: bg-gradient-to-r from-[var(--primary)] to-[var(--accent)].

# IMAGE RULES (STRICT)
❌ DO NOT use via.placeholder.com
❌ DO NOT use placehold.it
❌ DO NOT use dummyimage.com

✅ Use ONLY:
- https://picsum.photos/seed/{unique}/{width}/{height}
- https://i.pravatar.cc/150?u=NAME (avatars only)
- https://images.unsplash.com (real photos)

If an image is required and no real asset is available:
Use: https://picsum.photos/seed/ui/{width}/{height}

# ROOT LAYOUT
- Root container: class="relative w-full min-h-screen bg-[var(--background)] flex flex-col lg:flex-row"

# ASSISTANT MESSAGE
Include a short, dynamic "assistantMessage" in your JSON response summarizing what you created or changed for the user.
`;

export const ANALYSIS_PROMPT = `
You are a Lead Cross-Platform UI/UX Designer.
Return JSON describing responsive screens.
# NAVIGATION RULES
- MOBILE: Floating bottom nav.
- WEB: Sidebar OR Topbar.
- Navigation structure MUST be identical across screens.
`;

export function buildProductPrompt(args: {
  prompt: string;
  theme: "light" | "dark";
  architecture: "web" | "app";
  existingScreens?: ScreenSummary[];
  chatHistory?: ChatMessage[];
}): { systemInstruction: string; userPrompt: string } {
  const systemInstruction = `
${ANALYSIS_PROMPT}
# DESIGN LANGUAGE & CODING RULES
${GENERATION_SYSTEM_PROMPT}
# UI THEME (STRICT)
The product UI MUST be rendered in ${args.theme.toUpperCase()} MODE.
Theme: ${args.theme.toUpperCase()}
Architecture: ${args.architecture.toUpperCase()}.
# INCREMENTAL UPDATE
- Return ENTIRE project state (screens array).
# EXISTING SCREENS
${
  args.existingScreens
    ? args.existingScreens
        .map((s) => `SCREEN: ${s.name} (ID: ${s.id})\nMARKUP:\n${s.markup}`)
        .join("\n\n---\n\n")
    : "No existing screens."
}
# CHAT CONTEXT
${formatChatHistory(args.chatHistory)}
`;

  return { systemInstruction, userPrompt: `USER REQUEST: "${args.prompt}"` };
}

export function buildNewScreenPrompt(args: {
  purpose: string;
  designSystem: unknown;
  overview: { name: string };
  existingScreens: ScreenSummary[];
}): { systemInstruction: string; userPrompt: string } {
  return {
    systemInstruction: "Elite UI/UX engineer. Return JSON.",
    userPrompt: `
Generate ONE new screen for "${args.overview.name}".
PURPOSE: ${args.purpose}
# NAVIGATION CONSISTENCY
Identify and copy the navigation block from existing screens.
# EXISTING SCREENS
${args.existingScreens.map((s) => `SCREEN: ${s.name}\n${s.markup}`).join("\n\n---\n\n")}
# DESIGN SYSTEM
${JSON.stringify(args.designSystem)}
${GENERATION_SYSTEM_PROMPT}
`,
  };
}

export function buildModifyScreenPrompt(args: {
  screenName: string;
  instruction: string;
  currentMarkup: string;
  chatHistory?: ChatMessage[];
}): { systemInstruction: string; userPrompt: string } {
  return {
    systemInstruction: "Refine this screen while maintaining structure.",
    userPrompt: `
Refine screen: ${args.screenName}
INSTRUCTION: ${args.instruction}
# CONTEXT
${formatChatHistory(args.chatHistory)}
${GENERATION_SYSTEM_PROMPT}
CURRENT MARKUP:
${args.currentMarkup}
`,
  };
}
