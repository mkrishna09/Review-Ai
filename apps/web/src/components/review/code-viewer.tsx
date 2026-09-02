"use client";

import { useEffect, useState } from "react";
import { codeToHtml } from "shiki";

interface CodeViewerProps {
  code: string;
  language?: string;
}

export default function CodeViewer({ code, language = "ts" }: CodeViewerProps) {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    codeToHtml(code, {
      lang: language,
      theme: "github-dark",
    })
      .then((highlighted) => {
        if (active) setHtml(highlighted);
      })
      .catch(() => {
        if (active) setHtml(null);
      });

    return () => {
      active = false;
    };
  }, [code, language]);

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-[#24292e] text-white">
      {html ? (
        <div
          className="[&_pre]:min-w-max [&_pre]:p-6 [&_pre]:m-0 [&_pre]:overflow-visible font-mono text-sm"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <pre className="min-w-max p-6 m-0 font-mono text-sm overflow-visible">
          <code>{code}</code>
        </pre>
      )}
    </div>
  );
}
