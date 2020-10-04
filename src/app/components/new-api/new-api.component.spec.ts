import { NewApiComponent } from './new-api.component';
import {
	IMocked,
	Mock,
	setupProperty,
	setupFunction,
	addMatchers,
	replacePropertiesBeforeEach
} from '@morgan-stanley/ts-mocking-bird';
import { ApiService } from 'src/app/services/api.service';
import { ExplorerPanelApiService } from 'src/app/services/shared/explorer-panel-api.service';
import { ConnectableService } from 'src/app/services/connectable.service';
import { of, Subscription } from 'rxjs';
import * as rxjs from 'rxjs';
import { Api, ApiEndpoints } from 'src/app/interfaces/api';
import { ApiPathDescription, ExplorerEndpointDetails } from 'src/app/interfaces/apiSpecification';
import { fakeAsync, tick } from '@angular/core/testing';
import { ApiCallManagementService, ApiStore } from 'src/app/services/shared/api-call-management.service';
import { ElementRef } from '@angular/core';
import { mockEndpointDetails, publishConnectableField } from '../explorer-api-data/mock-sample-api-data';

describe('NewApiComponent', () => {
	let mockApiService: IMocked<ApiService>;
	let mockExplorerPanelApiService: IMocked<ExplorerPanelApiService>;
	let mockConnetableService: IMocked<ConnectableService>;
	let mockApiCallManagementService: IMocked<ApiCallManagementService>;
	let mockSubscription: IMocked<Subscription>;
	let mockSubscriptionPackage: IMocked<typeof rxjs>;
	let mocApiSearchElement: IMocked<ElementRef>;

	const pbValues = [
		{
			specificationLocation: 'http://localhost/trades/v2/api-docs',
			department: 'PB',
			displayName: 'Trades'
		},
		{
			specificationLocation: 'http://localhost/positions/v2/api-docs',
			department: 'PB',
			displayName: 'Positions'
		}
	];
	const sharedValues = [
		{
			specificationLocation: 'http://localhost/products/v2/api-docs',
			department: 'Shared',
			displayName: 'Products'
		}
	];
	const mockData: Map<string, Api[]> = new Map<string, Api[]>();

	mockData.set('PB', pbValues);
	mockData.set('Shared', sharedValues);

	const mockApi: Api = {
		specificationLocation: 'http://localhost/trades/v2/api-docs',
		department: 'PB',
		displayName: 'Trades'
	};

	const mockApiPathDescription: ApiPathDescription = {
		path: '/trades',
		description: 'Returns all trades'
	};

	const mockApiEndpoint: ExplorerEndpointDetails = {
		api: { specificationLocation: 'http://localhost/trades/v2/api-docs', department: 'PB', displayName: 'Trades' },
		endpoint: { path: '/trades', description: 'Returns all trades' }
	};

	const mockApiEndpoints: ApiEndpoints = {
		api: {
			specificationLocation: 'http://localhost/products/v2/api-docs',
			department: 'Shared',
			displayName: 'Products'
		},
		endpoints: []
	};

	const expectedStore: ApiStore = { category: 'Shared', apis: [mockApiEndpoints] };

	const path = '/trades';

	const mockNativeElement =
		'<input _ngcontent-mbl-c25="" type="text" placeholder="search..." class="search-field py-1 px-2 bg-light border">';

	function getInstance() {
		return new NewApiComponent(
			mockExplorerPanelApiService.mock,
			mockApiCallManagementService.mock,
			mockConnetableService.mock
		);
	}

	replacePropertiesBeforeEach(() => {
		mockSubscription = Mock.create<Subscription>().setup(setupFunction('unsubscribe'), setupFunction('add'));
		mockSubscriptionPackage = Mock.create<typeof rxjs>().setup(
			setupFunction('Subscription', (() => mockSubscription.mock) as any),
			setupFunction('fromEvent', () => of({ target: { value: 'trades' } }))
		); // recreate mocks for each test run to reset call counts
		return [{ package: rxjs, mocks: { ...mockSubscriptionPackage.mock } }];
	});

	beforeEach(() => {
		addMatchers();
		mockApiService = Mock.create<ApiService>().setup(setupFunction('getApisGroupedByCategory', () => of(mockData)));

		mocApiSearchElement = Mock.create<ElementRef>().setup(setupProperty('nativeElement', mockNativeElement));

		mockExplorerPanelApiService = Mock.create<ExplorerPanelApiService>().setup(
			setupProperty('explorerEndpointDetails$', of([mockApiEndpoint])),
			setupProperty('removeEndpointDetails$', of(mockEndpointDetails))
		);
		mockConnetableService = Mock.create<ConnectableService>();
		mockApiCallManagementService = Mock.create<ApiCallManagementService>().setup(
			setupFunction('addEndpointsToStore', () => {}),
			setupFunction('isEndpointsSetToStore', () => false),
			setupProperty('apiStore$', of([expectedStore]))
		);
	});

	it('should create new api component', () => {
		const newApiComponent = getInstance();
		expect(newApiComponent).toBeTruthy();
	});

	it('should add subscription on ngOnInit', () => {
		const newApiComponent = getInstance();
		newApiComponent.apiSearchInput = mocApiSearchElement.mock;
		newApiComponent.ngOnInit();
		expect(mockSubscription.withFunction('add')).wasCalled(4);
	});

	it('should remove api from the list  ', () => {
		const newApiComponent = getInstance();
		newApiComponent.apiSearchInput = mocApiSearchElement.mock;
		newApiComponent.endpointListToAdd = [mockApiEndpoint];
		newApiComponent.paths = ['/trades'];
		newApiComponent.removeApiFromList(mockApiEndpoint);
		expect(newApiComponent.endpointListToAdd).toEqual([]);
		expect(newApiComponent.paths).toEqual([]);
	});

	it('should check unsubscribe was called when destroy is invoked', () => {
		const newApiComponent = getInstance();
		newApiComponent.ngOnDestroy();
		expect(mockSubscription.withFunction('unsubscribe')).wasCalledOnce();
	});

	it('should add selected api to a list', () => {
		const newApiComponent = getInstance();
		newApiComponent.addToList(mockApi, mockApiPathDescription, path);
		expect(newApiComponent.endpointListToAdd).toEqual([mockApiEndpoint]);
	});

	it('should return empty list when api is not selected', () => {
		const newApiComponent = getInstance();
		newApiComponent.addToList(mockApi, mockApiPathDescription, path);
		newApiComponent.addToList(mockApi, mockApiPathDescription, path);
		expect(newApiComponent.endpointListToAdd).toEqual([]);
	});

	it('should return true if the api is available', () => {
		const newApiComponent = getInstance();
		newApiComponent.filteredApis = [mockApiEndpoints];
		expect(newApiComponent.isFilterApisAvailable).toBeTrue();
	});

	it('should return false if the api is empty', () => {
		const newApiComponent = getInstance();
		newApiComponent.filteredApis = [];
		expect(newApiComponent.isFilterApisAvailable).toBeFalse();
	});

	it('should return list when search matches', () => {
		const newApiComponent = getInstance();
		newApiComponent.availableApis = [mockApiEndpoints];
		expect(newApiComponent.filterApi('Product').length).toBe(1);
	});

	it('should add api to list when checked or selected', () => {
		const newApiComponent = getInstance();
		newApiComponent.endpointListToAddChangeValue(mockApiEndpoint);
		expect(newApiComponent.endpointListToAdd).toEqual([mockApiEndpoint]);
	});

	it('should return empty list when search do not match', () => {
		const newApiComponent = getInstance();
		newApiComponent.availableApis = [];
		expect(newApiComponent.filterApi('yyy')).toEqual([]);
	});

	it('should return all api when search input is empty', () => {
		const newApiComponent = getInstance();
		newApiComponent.availableApis = [mockApiEndpoints];
		expect(newApiComponent.filterApi('').length).toBe(1);
	});

	it(
		'should check if publishApisToExplorer was called',
		fakeAsync(() => {
			const endpointListToAdd = [mockApiEndpoint];
			const newApiComponent = getInstance();

			mockExplorerPanelApiService
				.setupFunction('addEndpointDetailsToExplorer')
				.withParametersEqualTo(mockApiEndpoint);
			mockExplorerPanelApiService.setupProperty('explorerEndpointDetails$', of(endpointListToAdd));

			mockConnetableService
				.setupFunction('publishAllConnectableEndpointsFromAPI')
				.withParametersEqualTo(mockApiEndpoint.api);
			mockConnetableService.setupProperty('connectableField$', of(publishConnectableField));
			newApiComponent.endpointListToAdd = endpointListToAdd;

			newApiComponent.publishApisToExplorer();
			tick();
			expect(mockExplorerPanelApiService.withFunction('addEndpointDetailsToExplorer')).wasCalledOnce();
		})
	);
});
