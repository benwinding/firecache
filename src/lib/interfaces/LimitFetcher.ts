import { Observable } from 'rxjs';

export interface LimitFetcher<T> {
  fetchNext(): Promise<T[]>;
  hasNext(): Observable<boolean>;
  destroy(): void;
  $realtimeAdded: Observable<T[]>;
  $realtimeModified: Observable<T[]>;
  $realtimeRemoved: Observable<T[]>;
}
