import { Link } from 'react-router-dom';

interface NoticeTemplatePageNotFoundProps {
  listUrl: string;
}

export function NoticeTemplatePageNotFound({ listUrl }: NoticeTemplatePageNotFoundProps) {
  return (
    <div className="space-y-4 py-10 text-center">
      <p className="text-muted-foreground">Template not found.</p>
      <Link to={listUrl} className="text-sm text-primary hover:underline">
        Back to templates
      </Link>
    </div>
  );
}
