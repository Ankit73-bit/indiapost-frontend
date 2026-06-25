interface NoticeVersionDraftUploadRestrictionProps {
  onDuplicateVersion: () => void;
  editLabel: string;
}

export function NoticeVersionDraftUploadRestriction({
  onDuplicateVersion,
  editLabel,
}: NoticeVersionDraftUploadRestrictionProps) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
      File uploads are only allowed on draft versions.{' '}
      <button
        type="button"
        className="font-medium text-primary hover:underline"
        onClick={() => void onDuplicateVersion()}
      >
        Duplicate this version
      </button>{' '}
      to edit {editLabel}.
    </div>
  );
}
