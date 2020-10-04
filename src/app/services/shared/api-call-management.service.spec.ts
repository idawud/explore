import { ApiCallManagementService, ApiStore } from './api-call-management.service';
import { ApiEndpoints, Api } from 'src/app/interfaces/api';
import { ApiPathDescription } from 'src/app/interfaces/apiSpecification';
import { ApiSpecificationService } from '../api_specification.service';
import { IMocked, Mock, setupFunction, replacePropertiesBeforeEach } from '@morgan-stanley/ts-mocking-bird';
import { mockedSpecificationData } from 'src/app/services/OpenApiSpecSamples';
import * as rxjs from 'rxjs';
import { of, BehaviorSubject } from 'rxjs';

describe('ApiCallManagementService', () => {
	let mockApiSpecificationService: IMocked<ApiSpecificationService>;
	let mockBehaviorSubject: IMocked<BehaviorSubject<ApiStore[]>>;
	let mockBehaviorSubjectPackage: IMocked<typeof rxjs>;

	const mockApiEndpoints: ApiEndpoints = {
		api: {
			specificationLocation: 'http://localhost/products/v2/api-docs',
			department: 'Shared',
			displayName: 'Products'
		},
		endpoints: [
			{ path: '/products', description: 'Returns all products ' },
			{ path: '/products/{productId}', description: 'Returns a product by an Id' }
		]
	};

	const mockTradeApiEndpoints: ApiEndpoints = {
		api: {
			specificationLocation: 'http://localhost/trades/v2/api-docs',
			department: 'PB',
			displayName: 'Trades'
		},
		endpoints: [ { path: '/trades', description: 'Returns all trades ' } ]
	};

	const mockPrductApiEndpoint: ApiEndpoints = {
		api: {
			specificationLocation: 'http://localhost/products/v2/api-docs',
			department: 'Shared',
			displayName: 'Products'
		},
		endpoints: []
	};

	const mockEndpoints: ApiPathDescription[] = [
		{ path: '/products', description: 'Returns all products ' },
		{ path: '/products/{productId}', description: 'Returns a product by an Id' }
	];

	const mockApi: Api = {
		specificationLocation: 'http://localhost/products/v2/api-docs',
		department: 'Shared',
		displayName: 'Products'
	};

	const expectedStore: ApiStore = { category: 'Shared', apis: [ mockApiEndpoints ] };

	const apiStore: ApiStore = { category: 'Shared', apis: [ mockPrductApiEndpoint ] };

	replacePropertiesBeforeEach(() => {
		mockBehaviorSubject = Mock.create<BehaviorSubject<ApiStore[]>>().setup(
			setupFunction('next', (() => mockBehaviorSubject.mock) as any),
			setupFunction('asObservable', (() => of([])) as any),
			setupFunction('getValue', (() => [ expectedStore ]) as any)
		);
		mockBehaviorSubjectPackage = Mock.create<typeof rxjs>().setup(
			setupFunction('BehaviorSubject', (() => mockBehaviorSubject.mock) as any)
		); // recreate mocks for each test run to reset call counts
		return [ { package: rxjs, mocks: { ...mockBehaviorSubjectPackage.mock } } ];
	});

	beforeEach(() => {
		mockApiSpecificationService = Mock.create<ApiSpecificationService>().setup(
			setupFunction('getSpecificationAsync', () => of(mockedSpecificationData) as any),
			setupFunction('getAllAvailablePaths', () => mockEndpoints)
		);
	});

	function getInstance() {
		return new ApiCallManagementService(mockApiSpecificationService.mock);
	}

	it('should create ApiCallManagement Service', () => {
		const apiCallManagementService = getInstance();
		expect(apiCallManagementService).toBeDefined();
	});

	it('should be empty be default', () => {
		const apiCallManagementService = getInstance();
		mockBehaviorSubject.setupFunction('getValue', (() => []) as any);
		apiCallManagementService.apiStore$.subscribe(apiStore => {
			expect(apiStore).toEqual([]);
		});
	});

	it('should not publish endpoints if api and category is not found', async () => {
		const apiCallManagementService = getInstance();
		apiCallManagementService.addEndpointsToStore('Shared', mockTradeApiEndpoints.api, mockEndpoints);
		expect(mockBehaviorSubject.withFunction('next')).wasNotCalled();
	});

	it('should not store duplicate apis', async () => {
		mockBehaviorSubject.setupFunction('getValue', () => []);
		const apiCallManagementService = getInstance();
		apiCallManagementService.addApiToStore('Shared', [ mockApiEndpoints ]);
		expect(mockBehaviorSubject.withFunction('next')).wasCalledOnce();
	});

	it('should return true if endpoint is set', async () => {
		const apiCallManagementService = getInstance();
		mockApiEndpoints.endpoints = mockEndpoints;
		apiCallManagementService.addApiToStore('Shared', [ mockApiEndpoints ]);
		apiCallManagementService.addEndpointsToStore('Shared', mockApi, mockEndpoints);
		const isEndpointsSetToStore = apiCallManagementService.isEndpointsSetToStore('Shared', mockApi);
		expect(isEndpointsSetToStore).toBeTrue();
	});

	it('should return false if endpoint is not set', async () => {
		const apiCallManagementService = getInstance();
		mockApiEndpoints.endpoints = [];
		apiCallManagementService.addApiToStore('Shared', [ mockApiEndpoints ]);
		const isEndpointsSetToStore = apiCallManagementService.isEndpointsSetToStore('Shared', mockApi);
		expect(isEndpointsSetToStore).toBeFalsy();
	});

	it('should return true if endpoint is set to store by url', async () => {
		mockBehaviorSubject.setupFunction('getValue', () => [ apiStore ]);
		const apiCallManagementService = getInstance();
		apiCallManagementService.setEndpointsToStoreByApiUrl(
			mockApiEndpoints.api.specificationLocation,
			mockPrductApiEndpoint
		);
		apiCallManagementService.setEndpointsToStoreByApiUrl(
			mockApiEndpoints.api.specificationLocation,
			mockPrductApiEndpoint
		);

		expect(
			mockApiSpecificationService
				.withFunction('getSpecificationAsync')
				.withParametersEqualTo(mockApiEndpoints.api.specificationLocation)
		).wasCalledOnce();

		expect(mockBehaviorSubject.withFunction('next')).wasCalled(2);

		expect(
			mockApiSpecificationService
				.withFunction('getAllAvailablePaths')
				.withParametersEqualTo(mockedSpecificationData.paths)
		).wasCalledOnce();

		const isEndpointsSetToStore = apiCallManagementService.isEndpointsSetToStore('Shared', mockApi);
		expect(isEndpointsSetToStore).toBeTrue();
	});

	it('should addEndpointsToStore was called with the right parameter', () => {
		const apiCallManagementService = getInstance();
		mockApiSpecificationService
			.setupFunction('getSpecificationAsync', () => of(mockedSpecificationData))
			.withParametersEqualTo(mockApiEndpoints.api.specificationLocation);
		mockApiSpecificationService
			.withFunction('getAllAvailablePaths')
			.withParametersEqualTo(mockedSpecificationData.paths);

		apiCallManagementService
			.setEndpointsToStoreByApi(mockApiEndpoints.api)
			.subscribe(data => expect(data).toEqual(mockedSpecificationData));
	});
});
