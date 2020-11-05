import { Observable, BehaviorSubject } from "rxjs";
import { take } from "rxjs/operators";

export function convertObservableToBehaviorSubject<T>(
  observable: Observable<T>,
  initValue: T
): BehaviorSubject<T> {
  const subject = new BehaviorSubject(initValue);

  observable.subscribe({
    complete: () => subject.complete(),
    error: (x) => subject.error(x),
    next: (x) => subject.next(x),
  });

  return subject;
}

export async function observableToPromise<T>(
  observable: Observable<T>
): Promise<T> {
  const val = observable.pipe(take(1)).toPromise();
  return val;
}
