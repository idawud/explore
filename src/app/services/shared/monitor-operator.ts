import { Observable, OperatorFunction, Observer } from 'rxjs';
import { Status } from './status-monitor';

export function monitor<T>(statusMonitor: Status): OperatorFunction<T, T> {
	return (source$: Observable<T>): Observable<T> => {
		statusMonitor.status = 'loading';
		return new Observable((observer: Observer<T>) => {
			source$.subscribe(
				data => {
					observer.next(data);
				},
				error => {
					statusMonitor.status = 'error';
					statusMonitor.message = error.message;
					observer.error(error);
				},
				() => {
					statusMonitor.status = 'loaded';
					statusMonitor.message = 'Api Loading Successful';
					observer.complete();
				}
			);
		});
	};
}
