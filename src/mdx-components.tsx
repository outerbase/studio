import type { MDXComponents } from "mdx/types";
import CodeBlock from "./components/code-block";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    code: (props) => {
      return <code {...props} />;
    },
    pre: CodeBlock,
  };
}
