import { AlertCircle, Loader2 } from 'lucide-react';
import { ArticleStatusBadge } from '@/components/shared/StatusBadge';
import { formatDateTime } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import type { TrackingEvent } from '@/types';

interface ArticleSheetTrackingTimelineProps {
  eventsLoading: boolean;
  eventsError: boolean;
  events: TrackingEvent[];
}

export function ArticleSheetTrackingTimeline({
  eventsLoading,
  eventsError,
  events,
}: ArticleSheetTrackingTimelineProps) {
  return (
    <section className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Tracking timeline
      </h3>

      {eventsLoading && (
        <div className="flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-8 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading events…
        </div>
      )}

      {eventsError && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          Failed to load tracking events.
        </div>
      )}

      {!eventsLoading && !eventsError && events.length === 0 && (
        <div className="rounded-lg border border-dashed border-border bg-muted/20 px-3 py-6 text-center text-sm text-muted-foreground">
          No tracking events yet.
        </div>
      )}

      {!eventsLoading && !eventsError && events.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <ol className="space-y-0">
            {events.map((event, index) => (
              <li key={event._id} className="flex gap-3">
                <div className="flex w-3 shrink-0 flex-col items-center">
                  <span
                    className={cn(
                      'mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full border-2',
                      index === 0
                        ? 'border-primary bg-primary'
                        : 'border-border bg-background',
                    )}
                    aria-hidden
                  />
                  {index < events.length - 1 && (
                    <span
                      className="my-1 w-px flex-1 bg-border"
                      aria-hidden
                    />
                  )}
                </div>
                <div
                  className={cn(
                    'min-w-0 flex-1 pb-5',
                    index === events.length - 1 && 'pb-0',
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={cn(
                        'text-sm leading-snug',
                        index === 0
                          ? 'font-medium text-foreground'
                          : 'text-foreground/90',
                      )}
                    >
                      {event.rawEvent}
                    </p>
                    <ArticleStatusBadge
                      status={event.normalizedStatus}
                      className="shrink-0"
                    />
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {event.office}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatDateTime(event.eventDate)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}
