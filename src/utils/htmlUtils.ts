export const getFullHtml = (markup: string, design: any): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"></script>
  <link href="https://fonts.googleapis.com/css2?family=${
    design.font.replace(/\s+/g, "+") || "Inter"
  }:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: ${design.colors.primary};
      --secondary: ${design.colors.secondary};
      --accent: ${design.colors.accent};
      --background: ${design.colors.background};
      --foreground: ${design.colors.text};
      --card: ${design.colors.surface};
      --muted: ${design.colors.muted || "#64748b"};
      --muted-foreground: ${design.colors.muted || "#94a3b8"};
      --border: ${design.colors.border || design.colors.surface};
      --radius: ${design.radius || "1rem"};
    }
    body { 
      background: var(--background); 
      color: var(--foreground); 
      font-family: '${design.font}', sans-serif; 
      margin: 0; 
      padding: 0; 
      min-height: 100vh; 
      width: 100%;
    }
    #root { width: 100%; min-height: 100vh; }
    ::-webkit-scrollbar { display: none; }
    .scrollbar-none::-webkit-scrollbar { display: none; }
    iconify-icon { vertical-align: middle; }
  </style>
</head>
<body class="scrollbar-none overflow-x-hidden">
  <div id="root">${markup || ""}</div>
</body>
</html>`.trim();
};
