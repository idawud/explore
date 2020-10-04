import { ApiListComponent } from './api-list.component';
import {
	IMocked,
	Mock,
	setupFunction,
	addMatchers,
	replacePropertiesBeforeEach,
	setupProperty
} from '@morgan-stanley/ts-mocking-bird';
import * as rxjs from 'rxjs';
import { of, Subscription } from 'rxjs';
import { ApiCallManagementService } from 'src/app/services/shared/api-call-management.service';
import { ApiEndpoints } from 'src/app/interfaces/api';
import { mockedSpecificationData } from 'src/app/services/OpenApiSpecSamples';

describe('ApiListComponent', () => {
	let mockSubscription: IMocked<Subscription>;
	let mockSubscriptionPackage: IMocked<typeof rxjs>;
	let mockApiCallManagementService: IMocked<ApiCallManagementService>;

	const mockApiEndpoints: ApiEndpoints = {
		api: {
			specificationLocation: 'http://localhost/products/v2/api-docs',
			department: 'Shared',
			displayName: 'Products'
		},
		endpoints: []
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
		mockApiCallManagementService = Mock.create<ApiCallManagementService>().setup(
			setupFunction('setEndpointsToStoreByApiUrl', () => {}),
			setupProperty('apiSpecificationDoc$', of(mockedSpecificationData))
		);
	});

	function getInstance() {
		const apiListComponent = new ApiListComponent(mockApiCallManagementService.mock);
		return apiListComponent;
	}

	it('should create api list Component', () => {
		const apiListComponent = getInstance();
		expect(apiListComponent).toBeDefined();
	});

	it('should check add subscription was called when ngOnInit is invoked', () => {
		const apiListComponent = getInstance();
		apiListComponent.apiStore = mockApiEndpoints;
		apiListComponent.ngOnInit();
		expect(mockSubscription.withFunction('add')).wasCalledOnce();
	});

	it('should check unsubscribe was called when destroy is invoked', () => {
		const apiListComponent = getInstance();
		apiListComponent.apiStore = mockApiEndpoints;
		apiListComponent.ngOnDestroy();

		expect(mockSubscription.withFunction('unsubscribe')).wasCalledOnce();
	});

	it('should get the populated `api` on the component', () => {
		const apiListComponent = getInstance();
		apiListComponent.apiStore = mockApiEndpoints;

		const getApiData = apiListComponent.getApiData();
		expect(getApiData).toEqual(mockApiEndpoints);
	});

	it('should populate the api endpoints on setEndPoints if it already exits in cache', () => {
		mockApiCallManagementService.setupFunction('isEndpointsSetToStore', () => true);
		const apiListComponent = getInstance();
		apiListComponent.apiStore = mockApiEndpoints;
		apiListComponent.setEndPoints(mockApiEndpoints.api.specificationLocation);

		expect(mockSubscription.withFunction('add')).wasCalled(0);
	});
});
