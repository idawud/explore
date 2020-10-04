import { Injectable, ErrorHandler } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { CustomErrorHandlerService } from './custom-error-handler.service';

@Injectable({
	providedIn: 'root'
})
export class HttpInterceptorClassService implements HttpInterceptor {
	constructor(private errorHandler: ErrorHandler) {}

	intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		return next.handle(req).pipe(
			retry(1),
			catchError(error => {
				this.errorHandler.handleError(error);
				throw error;
			})
		);
	}
}
