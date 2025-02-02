import React from "react";
import { createHighlighter } from "shiki";
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

async function getHighlighter() {
  return await createHighlighter({
    themes: ["dracula"],
    langs: ALLOWED_LANGS,
  });
}

function getValidLang(className?: string): BundledLanguage | "text" {
  const language = className ? className.replace(/language-/, "") : "text";
  return ALLOWED_LANGS.includes(language as BundledLanguage)
    ? (language as BundledLanguage)
    : "text";
}

async function CodeBlockInner({ children, className }: CodeBlockProps) {
  const validLang = getValidLang(className);
  const highlighter = await getHighlighter();
  const highlightedCode = highlighter.codeToHtml(children, {
    lang: validLang,
    themes: {
      dark: "dracula",
      light: "dracula",
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
    console.log("here");
    return <CodeBlockInner {...(props as CodeBlockProps)} />;
  }

  const codeElement = React.Children.toArray(props.children).find(
    (child) =>
      React.isValidElement(child) && (child as any).type().type === "code"
  ) as React.ReactElement | undefined;

  if (codeElement && typeof codeElement.props.children === "string") {
    return <CodeBlockInner {...(codeElement.props as CodeBlockProps)} />;
  }

  return (
    <pre>
      <code {...props} />
    </pre>
  );
}

export default CodeBlock;
