import { of, Observable } from 'rxjs';

// Let the app keep running by returning an empty result.
export function handleError<T>(result?: T): Observable<T> {
	return of(result);
}
