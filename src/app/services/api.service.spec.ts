import { ApiService } from './api.service';
import { IMocked, Mock, setupFunction } from '@morgan-stanley/ts-mocking-bird';
import { of, Observable, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Api } from '../interfaces/api';

describe('ApiService', () => {
	let mockHttp: IMocked<HttpClient>;
	const mockData: Api[] = [
		{ specificationLocation: 'http://localhost/trades/v2/api-docs', department: 'PB', displayName: 'Trades' },
		{ specificationLocation: 'http://localhost/positions/v2/api-docs', department: 'PB', displayName: 'Positions' },
		{
			specificationLocation: 'http://localhost/products/v2/api-docs',
			department: 'Shared',
			displayName: 'Products'
		}
	];

	function getInstance() {
		const instance = new ApiService(mockHttp.mock);
		return instance;
	}

	beforeEach(() => {
		mockHttp = Mock.create<HttpClient>().setup(setupFunction('get', () => of(mockData) as any));
	});

	it('should create the api service', () => {
		const apiService = getInstance();
		expect(apiService).toBeTruthy();
	});

	it('should render get apis once', () => {
		const apiService = getInstance();
		apiService.getApisAsync();

		expect(mockHttp.withFunction('get')).wasCalledOnce();
	});

	it('should fetch apis once', () => {
		const apiService = getInstance();
		apiService
			.getApisAsync()
			.subscribe(() =>
				apiService.getApisAsync().subscribe(() => expect(mockHttp.withFunction('get')).wasCalledOnce())
			);

		expect(mockHttp.withFunction('get')).wasCalledOnce();
	});

	it('should return array of apis', async () => {
		const apiService = getInstance();
		apiService.getApisAsync().subscribe(data => {
			expect(data).toBe(mockData);
		});
	});

	it('should return empty array of apis if there is an error', async () => {
		mockHttp.setupFunction('get', (err: any) => throwError(err)); // Mock trigger error
		const apiService = getInstance();

		apiService.getApisAsync().subscribe(data => {}, error => expect(error).toEqual('http://localhost/apis'));
	});

	it('should have two categories', async () => {
		const apiService = getInstance();
		const categories: Observable<Map<string, Api[]>> = apiService.getApisGroupedByCategory();
		categories.subscribe(data => {
			expect(data.size).toEqual(2);
		});
	});

	it('should fetch the data from the server', () => {
		const apiService = getInstance();
		apiService.fetchDataFromServerAsync('http/localhost');

		expect(mockHttp.withFunction('get')).wasCalledOnce();
	});
});
