import { codeToHtml } from "shiki";

interface CodeViewerProps {
  code: string;
  language?: string;
}

export default async function CodeViewer({
  code,
  language = "ts",
}: CodeViewerProps) {
  const html = await codeToHtml(code, {
    lang: language,
    theme: "github-dark",
  });

  return (
    <div className="overflow-x-auto rounded-2xl border border-border">
      <div
        className="[&_pre]:min-w-max [&_pre]:p-6 [&_pre]:m-0 [&_pre]:overflow-visible"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
