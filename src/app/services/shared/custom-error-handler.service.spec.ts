import { CustomErrorHandlerService } from './custom-error-handler.service';
import { HttpErrorResponse } from '@angular/common/http';

describe('CustomErrorHandlerService', () => {
	function getInstance() {
		return new CustomErrorHandlerService();
	}

	it('should create custom error handler class', () => {
		const customErrorHandlerService = getInstance();
		expect(customErrorHandlerService).toBeDefined();
	});

	it('should check if error is instance of HttpErrorResponse', () => {
		const customErrorHandlerService = getInstance();
		customErrorHandlerService.handleError(new HttpErrorResponse({}));

		expect(customErrorHandlerService.customError.name).toEqual('HttpErrorResponse');
	});

	it('should check if error is instance of Error', () => {
		const customErrorHandlerService = getInstance();
		customErrorHandlerService.handleError(new Error('error message'));

		expect(customErrorHandlerService.customError.name).toEqual('Error');
	});
});
