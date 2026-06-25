interface NoticeConfigUploadedBannerProps {
  uploadedFileName: string;
}

export function NoticeConfigUploadedBanner({
  uploadedFileName,
}: NoticeConfigUploadedBannerProps) {
  return (
    <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-800 dark:text-emerald-200">
      Loaded from <span className="font-mono font-medium">{uploadedFileName}</span>
      — review and edit fields below.
    </div>
  );
}
