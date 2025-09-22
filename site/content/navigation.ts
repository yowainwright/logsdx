export interface NavItem {
  title: string;
  href?: string;
  items?: NavItem[];
  badge?: string;
  external?: boolean;
}

export const docsNavigation: NavItem[] = [
  {
    title: "Getting Started",
    items: [
      { title: "Installation", href: "/docs/getting-started/installation" },
      { title: "Quick Start", href: "/docs/getting-started/quick-start" },
      { title: "Configuration", href: "/docs/getting-started/configuration" },
    ],
  },
  {
    title: "API Reference",
    items: [
      { title: "LogsDX Class", href: "/docs/api/logsdx" },
      { title: "Themes", href: "/docs/api/themes" },
      { title: "Tokenizer", href: "/docs/api/tokenizer" },
      { title: "Renderer", href: "/docs/api/renderer" },
    ],
  },
  {
    title: "Guides",
    items: [
      { title: "Custom Themes", href: "/docs/guides/custom-themes" },
      { title: "CLI Usage", href: "/docs/guides/cli-usage" },
      { title: "Integrations", href: "/docs/guides/integrations" },
    ],
  },
];

export const mainNavigation: NavItem[] = [
  { title: "Documentation", href: "/docs" },
  { title: "API", href: "/docs/api" },
  {
    title: "GitHub",
    href: "https://github.com/yowainwright/logsdx",
    external: true,
  },
];
