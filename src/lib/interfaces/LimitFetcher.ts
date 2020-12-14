import { Observable } from 'rxjs';

export interface LimitFetcher<T> {
  fetchNext(): Promise<T[]>;
  hasNext(): Observable<boolean>;
  $newlyAdded: Observable<T[]>;
}
