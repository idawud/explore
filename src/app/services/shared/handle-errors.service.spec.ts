import { handleError } from './handle-errors.service';
import { Api } from 'src/app/interfaces/api';

describe('HandleErrors', () => {

	it('should create an observable of a type (empty Api array)', async () => {
		const result = handleError<Api[]>([]);
		result.subscribe( data => {
			expect(data.length).toEqual(0);
		});
	});
});
