import { HttpInterceptorClassService } from './http-interceptor-class.service';
import { IMocked, Mock, setupFunction, setupProperty } from '@morgan-stanley/ts-mocking-bird';
import { CustomErrorHandlerService } from './custom-error-handler.service';
import { HttpRequest, HttpHandler, HttpEventType, HttpEvent } from '@angular/common/http';
import { throwError } from 'rxjs';
import { ErrorHandler } from '@angular/core';

describe('HttpInterceptorClassService', () => {
	let mockErrorHandler: IMocked<ErrorHandler>;
	let mockHttpRequest: IMocked<HttpRequest<any>>;
	let mockHttpHandler: IMocked<HttpHandler>;
	let mockHttpEvent: IMocked<HttpEvent<any>>;

	mockHttpEvent = Mock.create<HttpEvent<any>>().setup(setupProperty('type', HttpEventType.User));

	beforeEach(() => {
		mockErrorHandler = Mock.create<ErrorHandler>().setup(setupFunction('handleError', () => {}));

		mockHttpRequest = Mock.create<HttpRequest<any>>().setup(
			setupProperty('body', (err: any) => throwError(err)),
			setupProperty('method', 'GET'),
			setupProperty('url', 'http://localhost/apis')
		);
	});

	function getInstance() {
		return new HttpInterceptorClassService(mockErrorHandler.mock);
	}

	it('should create http interceptor class', () => {
		const httpInterceptorClassService = getInstance();
		expect(httpInterceptorClassService).toBeDefined();
	});

	it('should check handle error was called', async () => {
		const httpInterceptorClassService = getInstance();
		mockHttpHandler = Mock.create<HttpHandler>().setup(setupFunction('handle', () => throwError('error')));

		httpInterceptorClassService.intercept(mockHttpRequest.mock, mockHttpHandler.mock).subscribe(
			event => {},
			error => {
				expect(mockErrorHandler.withFunction('handleError').withParameters(error)).wasCalledOnce();
			}
		);
	});
});
