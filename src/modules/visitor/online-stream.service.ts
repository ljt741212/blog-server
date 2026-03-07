import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { concat, defer, from, Observable, Subject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { VisitorService } from './visitor.service';

export interface OnlineStatsPayload {
  count: number;
  list: Array<{
    id: number;
    ip: string;
    userAgent: string | null;
    lastActiveAt: Date | null;
    visitorId: string | null;
  }>;
}

@Injectable()
export class OnlineStreamService {
  private readonly activity$ = new Subject<void>();

  constructor(
    @Inject(forwardRef(() => VisitorService))
    private readonly visitorService: VisitorService,
  ) {}

  trigger(): void {
    this.activity$.next();
  }

  getStream(minutes = 5): Observable<{ data: OnlineStatsPayload }> {
    const fetchStats = () =>
      from(this.visitorService.getOnlineStats(minutes)).pipe(
        map((data) => ({ data })),
      );
    return concat(
      defer(() => fetchStats()),
      this.activity$.pipe(switchMap(() => fetchStats())),
    );
  }
}
