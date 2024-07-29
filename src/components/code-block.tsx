"use client";

import { useState, useEffect } from "react";
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

const CodeBlockInner: React.FC<CodeBlockProps> = ({ children, className }) => {
  const [highlightedCode, setHighlightedCode] = useState<string>("");
  const language = className ? className.replace(/language-/, "") : "text";

  useEffect(() => {
    let highlighter: Highlighter;

    const highlight = async () => {
      highlighter = await createHighlighter({
        themes: ["dracula"],
        langs: ALLOWED_LANGS,
      });

      // Validate the language

      const validLang = ALLOWED_LANGS.includes(language as BundledLanguage)
        ? (language as BundledLanguage)
        : "text";

      const highlighted = highlighter.codeToHtml(children, {
        lang: validLang,
        themes: {
          dark: "dracula",
          light: "dracula",
        },
      });
      setHighlightedCode(highlighted);
    };

    highlight();

    return () => {
      if (highlighter) {
        highlighter.dispose();
      }
    };
  }, [children, language]);

  // biome-ignore lint/security/noDangerouslySetInnerHtml: We are using controlled html
  return <div dangerouslySetInnerHTML={{ __html: highlightedCode }} />;
};

interface MDXCodeBlockProps {
  children?: React.ReactNode;
  className?: string;
}

const CodeBlock: React.FC<MDXCodeBlockProps> = (props) => {
  if (typeof props.children === "string") {
    return <CodeBlockInner {...(props as CodeBlockProps)} />;
  }
  return (
    <pre>
      <code {...props} />
    </pre>
  );
};

export default CodeBlock;
