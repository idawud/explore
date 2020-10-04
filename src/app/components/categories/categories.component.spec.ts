import { CategoriesComponent } from './categories.component';
import { ApiService } from 'src/app/services/api.service';
import {
	IMocked,
	setupFunction,
	Mock,
	replacePropertiesBeforeEach,
	addMatchers,
	setupProperty
} from '@morgan-stanley/ts-mocking-bird';
import * as rxjs from 'rxjs';
import { of, Subscription } from 'rxjs';
import { Api } from 'src/app/interfaces/api';
import { tick, fakeAsync } from '@angular/core/testing';
import { ApiCallManagementService, ApiStore } from 'src/app/services/shared/api-call-management.service';

describe('CategoriesComponent', () => {
	let mockApiService: IMocked<ApiService>;
	let mockSubscription: IMocked<Subscription>;
	let mockSubscriptionPackage: IMocked<typeof rxjs>;
	let mockApiCallManagementService: IMocked<ApiCallManagementService>;

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

	const mockApiStore: ApiStore = {
		category: 'Shared',
		apis: [
			{
				api: {
					specificationLocation: 'http://localhost/products/v2/api-docs',
					department: 'Shared',
					displayName: 'Products'
				},
				endpoints: [
					{ path: '/products', description: 'Returns all products ' },
					{ path: '/products/{productId}', description: 'Returns a product by an Id' }
				]
			}
		]
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
		mockApiService = Mock.create<ApiService>().setup(setupFunction('getApisGroupedByCategory', () => of(mockData)));

		mockApiCallManagementService = Mock.create<ApiCallManagementService>().setup(
			setupFunction('addApiToStore', () => {}),
			setupProperty('apiStore$', of([ mockApiStore ]))
		);
	});

	function getInstance() {
		const categoriesComponent = new CategoriesComponent(mockApiService.mock, mockApiCallManagementService.mock);
		return categoriesComponent;
	}

	it('should create the categories component', () => {
		const categoriesComponent = getInstance();
		expect(categoriesComponent).toBeTruthy();
	});

	it(
		'should request apis by category on init',
		fakeAsync(() => {
			const categoriesComponent = getInstance();
			categoriesComponent.ngOnInit();
			tick();

			expect(mockApiService.withFunction('getApisGroupedByCategory')).wasCalledOnce();
			expect(mockApiCallManagementService.withFunction('addApiToStore')).wasCalledAtLeastOnce();
		})
	);

	it('should check add subscription was called when init runs', () => {
		const categoriesComponent = getInstance();
		categoriesComponent.ngOnInit();

		expect(mockSubscription.withFunction('add')).wasCalled(2);
	});

	it('should check unsubscribe was called when destroy is invoked', () => {
		const categoriesComponent = getInstance();
		categoriesComponent.ngOnDestroy();

		expect(mockSubscription.withFunction('unsubscribe')).wasCalledOnce();
	});
});
