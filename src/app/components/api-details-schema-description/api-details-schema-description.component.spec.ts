import { ApiDetailsSchemaDescriptionComponent } from './api-details-schema-description.component';
import {
	IMocked,
	setupFunction,
	Mock,
	setupProperty,
	replacePropertiesBeforeEach,
	addMatchers
} from '@morgan-stanley/ts-mocking-bird';
import { SharedEndpointDetailsService } from 'src/app/services/shared/shared-endpoint-details.service';
import * as rxjs from 'rxjs';
import { of, Subscription } from 'rxjs';
import { ApiDetailsDescription, ExplorerEndpointDetails } from 'src/app/interfaces/apiSpecification';
import { ExplorerPanelApiService } from 'src/app/services/shared/explorer-panel-api.service';
import { ConnectableService } from 'src/app/services/connectable.service';

describe('ApiDetailsSchemaDescriptionComponent', () => {
	let mockSharedEndpointDetailsService: IMocked<SharedEndpointDetailsService>;
	let mockExplorerPanelApiService: IMocked<ExplorerPanelApiService>;
	let mockConnectableService: IMocked<ConnectableService>;
	let mockSubscription: IMocked<Subscription>;
	let mockSubscriptionPackage: IMocked<typeof rxjs>;

	const mockEndPointsDescriptionData: ApiDetailsDescription = {
		summary: 'Returns all trades ',
		description: 'Multiple trades object values, separated by comma',
		apiDescription: 'trades api description'
	};

	const mockEndpointDetails: ExplorerEndpointDetails = {
		endpoint: { path: '/trades', description: 'Returns all trades' },
		api: {
			specificationLocation: 'http://localhost/trades/v2/api-docs',
			department: 'PB',
			displayName: 'Trades'
		}
	};
                                       
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
		mockSharedEndpointDetailsService = Mock.create<SharedEndpointDetailsService>().setup(
			setupFunction('setEndPointDescription', () => of(mockEndPointsDescriptionData)),
			setupProperty('endpointDescription', of(mockEndPointsDescriptionData)), 
			setupProperty('explorerEndpointDetails$', of(mockEndpointDetails))
		);
		mockExplorerPanelApiService = Mock.create<ExplorerPanelApiService>().setup(
			setupProperty('explorerEndpointDetails$', of([ mockEndpointDetails ])),
			setupFunction('getExplorerEndpointDetails', () => [ mockEndpointDetails ])
		);
		mockConnectableService = Mock.create<ConnectableService>().setup(
			setupFunction('publishAllConnectableEndpointsFromAPI', () => {})
		);
	});

	function getInstance() {
		const apiDetailsSchemaDescriptionComponent = new ApiDetailsSchemaDescriptionComponent(
			mockSharedEndpointDetailsService.mock,
			mockExplorerPanelApiService.mock,
			mockConnectableService.mock
		);
		return apiDetailsSchemaDescriptionComponent;
	}

	it('should create api details schema description component', () => {
		const apiDetailsSchemaDescriptionComponent = getInstance();
		expect(apiDetailsSchemaDescriptionComponent).toBeDefined();
	});

	it('should check add subscription was called three times when init runs', () => {
		mockSharedEndpointDetailsService.setupProperty('explorerEndpointDetails$', of(mockEndpointDetails));
		const apiDetailsSchemaDescriptionComponent = getInstance();
		apiDetailsSchemaDescriptionComponent.ngOnInit();

		expect(mockSubscription.withFunction('add')).wasCalled(3);
		expect(apiDetailsSchemaDescriptionComponent.isAvailableToAddToExplorer).toBeFalse();
	});

	it('should check unsubscribe was called when destroy is invoked', () => {
		const apiDetailsSchemaDescriptionComponent = getInstance();
		apiDetailsSchemaDescriptionComponent.ngOnDestroy();

		expect(mockSubscription.withFunction('unsubscribe')).wasCalledOnce();
	});

	it('should check add endpoint details to explorer was called', () => {
		const apiDetailsSchemaDescriptionComponent = getInstance();

		mockExplorerPanelApiService.setupProperty('explorerEndpointDetails$', of([ mockEndpointDetails ])); 

		mockExplorerPanelApiService
			.setupFunction('addEndpointDetailsToExplorer')
			.withParametersEqualTo(mockEndpointDetails);
		mockConnectableService
			.setupFunction('publishAllConnectableEndpointsFromAPI')
			.withParametersEqualTo(mockEndpointDetails.api);

		apiDetailsSchemaDescriptionComponent.ngOnInit();
		apiDetailsSchemaDescriptionComponent.addEndpointToExplorer();

		expect(mockExplorerPanelApiService.withFunction('addEndpointDetailsToExplorer')).wasCalledOnce();
	});

	it('should return explorer Endpoint Details when init is called', () => {
		const apiDetailsSchemaDescriptionComponent = getInstance();
		apiDetailsSchemaDescriptionComponent.ngOnInit();

		expect(apiDetailsSchemaDescriptionComponent.explorerEndpointDetails).toEqual(mockEndpointDetails);
	});
});
