export default function CodePreview({ code }: { code: string }) {
  return (
    <code className="p-2 bg-secondary block overflow-x-auto w-full text-sm">
      <pre>{code}</pre>
    </code>
  );
}
