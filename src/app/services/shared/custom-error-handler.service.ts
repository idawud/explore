import { Injectable, ErrorHandler } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

interface CustomError {
	name: string;
	message: string;
	status?: number;
}

@Injectable()
export class CustomErrorHandlerService implements ErrorHandler {
	customError: CustomError = {
		name: '',
		message: ''
	};

	handleError(error: any): void {
		if (error instanceof HttpErrorResponse) {
			this.customError = { name: error.name, message: error.message, status: error.status };
		}

		if (error instanceof Error) {
			this.customError = { name: error.name, message: error.message };
		}
	}
}
