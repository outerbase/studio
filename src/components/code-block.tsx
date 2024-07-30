import { createHighlighter, type Highlighter } from "shiki";
import type { BundledLanguage } from "shiki/bundle/full";

const ALLOWED_LANGS: BundledLanguage[] = [
  "javascript",
  "typescript",
  "html",
  "css",
  "json",
  "markdown",
  "bash",
  "http",
  "jsx",
  "tsx",
];

interface CodeBlockProps {
  children: string;
  className?: string;
}

let highlighter: Highlighter | null = null;

async function getHighlighter() {
  if (!highlighter) {
    highlighter = await createHighlighter({
      themes: ["dracula", "snazzy-light"],
      langs: ALLOWED_LANGS,
    });
  }
  return highlighter;
}

async function CodeBlockInner({ children, className }: CodeBlockProps) {
  const language = className ? className.replace(/language-/, "") : "text";
  const validLang = ALLOWED_LANGS.includes(language as BundledLanguage)
    ? (language as BundledLanguage)
    : "text";

  const highlighter = await getHighlighter();
  const highlightedCode = highlighter.codeToHtml(children, {
    lang: validLang,
    themes: {
      dark: "dracula",
      light: "snazzy-light",
    },
  });

  // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
  return <div dangerouslySetInnerHTML={{ __html: highlightedCode }} />;
}

interface MDXCodeBlockProps {
  children?: React.ReactNode;
  className?: string;
}

async function CodeBlock(props: MDXCodeBlockProps) {
  if (typeof props.children === "string") {
    return <CodeBlockInner {...(props as CodeBlockProps)} />;
  }

  return (
    <pre>
      <code {...props} />
    </pre>
  );
}

export default CodeBlock;
