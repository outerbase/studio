import type { MDXComponents } from "mdx/types";
import CodeBlock from "./components/code-block";
import { Fragment } from "react";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    code: CodeBlock,
    pre: Fragment,
  };
}
