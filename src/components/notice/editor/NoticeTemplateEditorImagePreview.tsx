interface NoticeTemplateEditorImagePreviewProps {
  activeFile: string;
  imageUrl?: string;
}

export function NoticeTemplateEditorImagePreview({
  activeFile,
  imageUrl,
}: NoticeTemplateEditorImagePreviewProps) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center justify-center bg-muted/20 p-8">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={activeFile}
          className="max-h-full max-w-full rounded-lg border border-border object-contain shadow-sm"
        />
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-card px-8 py-12 text-center">
          <p className="text-sm text-muted-foreground">{activeFile}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Upload an image using the + button in the files panel.
          </p>
        </div>
      )}
    </div>
  );
}
