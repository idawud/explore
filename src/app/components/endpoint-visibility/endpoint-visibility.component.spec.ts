
import { IMocked, Mock, setupProperty, setupFunction, addMatchers,
	replacePropertiesBeforeEach } from '@morgan-stanley/ts-mocking-bird';
import { EndpointVisibilityComponent } from './endpoint-visibility.component';
import { of, Subscription } from 'rxjs';
import * as rxjs from 'rxjs';
import { ExplorerPanelApiService } from 'src/app/services/shared/explorer-panel-api.service';
import { ExplorerEndpointDetails, ApiPathDescription } from 'src/app/interfaces/apiSpecification';

describe('EndpointVisibilityComponent', () => {
	let mockSubscription: IMocked<Subscription>;
	let mockSubscriptionPackage: IMocked<typeof rxjs>;
	let mockExplorerPanelApiService: IMocked<ExplorerPanelApiService>;

	const mockApiEndpoint: ExplorerEndpointDetails = {
		api: { specificationLocation: 'http://localhost/trades/v2/api-docs', department: 'PB', displayName: 'Trades' },
		endpoint: { path: '/trades', description: 'Returns all trades' }
	};
	const mockedTradesApiEndpoints: ApiPathDescription = { path: '/trades', description: 'Returns all trades' };
	const mockedProductsApiEndpoints: ApiPathDescription = { path: '/product', description: 'Returns all products' };

	replacePropertiesBeforeEach(() => {
		mockSubscription = Mock.create<Subscription>().setup(
			setupFunction('unsubscribe'),
			setupFunction('add', (() => mockSubscription.mock) as any)
		);
		mockSubscriptionPackage = Mock.create<typeof rxjs>().setup(
			setupFunction('Subscription', (() => mockSubscription.mock) as any)
		); // recreate mocks for each test run to reset call counts
		return [ { package: rxjs, mocks: { ...mockSubscriptionPackage.mock } } ];
	});

	beforeEach(() => {
		addMatchers();
		mockExplorerPanelApiService = Mock.create<ExplorerPanelApiService>().setup(
			setupProperty('explorerEndpointDetails$', of([mockApiEndpoint]))
		);
	});

	function getInstance() {
		return new EndpointVisibilityComponent(mockExplorerPanelApiService.mock);
	}

	it('should create the categories component', () => {
		const endpointVisibilityComponent = getInstance();
		expect(endpointVisibilityComponent).toBeTruthy();
	});

	it('should check add subscription was called when init runs', () => {
		const endpointVisibilityComponent = getInstance();
		endpointVisibilityComponent.ngOnInit();

		expect(mockSubscription.withFunction('add')).wasCalledOnce();
	});
	it('should check unsubscribe was called when destroy is invoked', () => {
		const endpointVisibilityComponent = getInstance();
		endpointVisibilityComponent.ngOnDestroy();

		expect(mockSubscription.withFunction('unsubscribe')).wasCalledOnce();
	});
	it('should return true if endpoint exist in explorere apis', () => {
		const endpointVisibilityComponent = getInstance();
		endpointVisibilityComponent.endpoint = mockedTradesApiEndpoints;
		endpointVisibilityComponent.explorerEndpointDetails$ = [mockApiEndpoint];
		endpointVisibilityComponent.ngOnInit();
		expect(endpointVisibilityComponent.Ischecked).toBeTruthy();
	});
	it('should return false if endpoint exist in explorere apis', () => {
		const endpointVisibilityComponent = getInstance();
		endpointVisibilityComponent.endpoint = mockedProductsApiEndpoints;
		endpointVisibilityComponent.explorerEndpointDetails$ = [mockApiEndpoint];
		endpointVisibilityComponent.ngOnInit();
		expect(endpointVisibilityComponent.Ischecked).toBeFalsy();
	});

	it('should check if endpointListToAddChangeValue was emitted', () => {
		const endpointVisibilityComponent = getInstance();
		spyOn(endpointVisibilityComponent.endpointListToAddChangeValue, 'emit');
		endpointVisibilityComponent.explorerEndpointDetails.api = mockApiEndpoint.api;
		endpointVisibilityComponent.explorerEndpointDetails.endpoint = mockApiEndpoint.endpoint;
		endpointVisibilityComponent.addToList();

		expect(endpointVisibilityComponent.endpointListToAddChangeValue.emit).toHaveBeenCalled();

	});
});
