interface NoticeVersionFileListProps {
  title: string;
  files: string[];
}

export function NoticeVersionFileList({ title, files }: NoticeVersionFileListProps) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-muted-foreground">{title}</p>
      <ul className="divide-y divide-border rounded-lg border border-border">
        {files.map((f) => (
          <li key={f} className="px-3 py-2 font-mono text-xs text-muted-foreground">
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}
