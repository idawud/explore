import { ApiDetailsSchemaTableComponent } from './api-details-schema-table.component';
import {
	IMocked,
	setupFunction,
	Mock,
	setupProperty,
	replacePropertiesBeforeEach,
	addMatchers
} from '@morgan-stanley/ts-mocking-bird';
import { SharedEndpointDetailsService } from 'src/app/services/shared/shared-endpoint-details.service';
import { ApiSpecDefinitionModel } from 'src/app/interfaces/api';
import * as rxjs from 'rxjs';
import { of, Subscription } from 'rxjs';
import { GridReadyEvent, GridApi } from 'ag-grid-community';

describe('ApiDetailsSchemaTableComponent', () => {
	let mockSharedEndpointDetailsService: IMocked<SharedEndpointDetailsService>;
	let mockSubscription: IMocked<Subscription>;
	let mockSubscriptionPackage: IMocked<typeof rxjs>;

	const mockSchemaTableData: ApiSpecDefinitionModel = {
		description: 'table description',
		values: [
			{ fieldName: 'ask', drillable: false, properties: { type: 'number', description: 'ask description' } },
			{
				fieldName: 'productDetail',
				drillable: true,
				properties: { type: '#ref/definition/Product', description: 'productDetail description' },
				values: [
					{
						fieldName: 'productId',
						drillable: false,
						properties: { type: 'string', description: 'productId description' }
					}
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
		mockSharedEndpointDetailsService = Mock.create<SharedEndpointDetailsService>().setup(
			setupFunction('setEndPointsDetails', () => of(mockSchemaTableData)),
			setupProperty('endpointSchemaDetailsTable', of(mockSchemaTableData))
		);
	});

	function getInstance() {
		const apiDetailsSchemaTableComponent = new ApiDetailsSchemaTableComponent(
			mockSharedEndpointDetailsService.mock
		);
		return apiDetailsSchemaTableComponent;
	}

	it('should create apiDetailsSchemaTableComponent', () => {
		const apiDetailsSchemaTableComponent = getInstance();
		expect(apiDetailsSchemaTableComponent).toBeTruthy();
	});

	it('should set endpointDetails on init', () => {
		const apiDetailsSchemaTableComponent = getInstance();
		apiDetailsSchemaTableComponent.ngOnInit();
		expect(apiDetailsSchemaTableComponent.endpointDetails).toBe(mockSchemaTableData);
	});

	it('should check add subscription was called when init runs', () => {
		const apiDetailsSchemaTableComponent = getInstance();
		apiDetailsSchemaTableComponent.ngOnInit();

		expect(mockSubscription.withFunction('add')).wasCalledOnce();
	});

	it('should check unsubscribe was called when destroy is invoked', () => {
		const apiDetailsSchemaTableComponent = getInstance();
		apiDetailsSchemaTableComponent.ngOnDestroy();

		expect(mockSubscription.withFunction('unsubscribe')).wasCalledOnce();
	});

	it('should set rowData on ready', () => {
		const expectedRowData = [
			{ fieldName: 'ask', type: 'number', description: 'ask description', values: '' },
			{
				fieldName: 'productDetail',
				type: '',
				description: 'productDetail description',
				values: [
					{
						fieldName: 'productId',
						drillable: false,
						properties: { type: 'string', description: 'productId description' }
					}
				]
			}
		];
		const apiDetailsSchemaTableComponent = getInstance();
		const gridApiMock: IMocked<GridApi> = Mock.create<GridApi>().setup(
			setupFunction('setRowData', () => {}),
			setupFunction('sizeColumnsToFit', () => {})
		);

		const gridReadyEventMock: IMocked<GridReadyEvent> = Mock.create<GridReadyEvent>().setup(
			setupProperty('api', gridApiMock.mock)
		);

		apiDetailsSchemaTableComponent.gridOptions.onGridReady(gridReadyEventMock.mock);

		expect(apiDetailsSchemaTableComponent.rowData).toEqual(expectedRowData);
	});

	describe('isRowMaster', () => {
		it('should return values for empty string i.e. drillable field', () => {
			const apiDetailsSchemaTableComponent = getInstance();
			const result = apiDetailsSchemaTableComponent.isRowMaster({ type: '', values: [] });
			expect(result).toEqual([]);
		});

		it('should return false for non-empty string', () => {
			const apiDetailsSchemaTableComponent = getInstance();
			const result = apiDetailsSchemaTableComponent.isRowMaster({ type: 'string', values: [] });
			expect(result).toBeFalse();
		});
	});

	it('should set detailedRowData for expand rendering', () => {
		const mockGridParamsData = {
			node: {},
			data: {
				description: 'account description',
				fieldName: 'account',
				type: '',
				values: [
					{
						fieldName: 'accountId',
						drillable: false,
						properties: { type: 'string', description: 'accountId description' }
					},
					{
						fieldName: 'bookName',
						drillable: true,
						properties: { type: 'string', description: 'bookName description' }
					}
				]
			},
			successCallback: () => {}
		};

		const expected = [
			{ fieldName: 'accountId', type: 'string', description: 'accountId description' },
			{ fieldName: 'bookName', type: '', description: 'bookName description' }
		];
		const apiDetailsSchemaTableComponent = getInstance();
		const cellRenderer = apiDetailsSchemaTableComponent.gridOptions.detailCellRendererParams;

		cellRenderer.getDetailRowData(mockGridParamsData);

		expect(apiDetailsSchemaTableComponent.detailRowData).toEqual(expected);
	});

	it('should return description on tooltip if it is too long', () => {
		const message =
			'REST API which allows you to get live market prices, execute orders in real time and manage your orders.';
		const apiDetailsSchemaTableComponent = getInstance();

		const tooltipMessage = apiDetailsSchemaTableComponent.columnDefs[2].tooltipValueGetter({ value: message });

		expect(tooltipMessage).toEqual(message);
	});

	it('should not return description on tooltip if not too long', () => {
		const message = 'account trade was executed on';
		const apiDetailsSchemaTableComponent = getInstance();

		const tooltipMessage = apiDetailsSchemaTableComponent.columnDefs[2].tooltipValueGetter({ value: message });

		expect(tooltipMessage).toEqual(undefined);
	});

	it('should return description on tooltip if it is too long on detail grid', () => {
		const message =
			'REST API which allows you to get live market prices, execute orders in real time and manage your orders.';
		const apiDetailsSchemaTableComponent = getInstance();
		const detailGridOptions = apiDetailsSchemaTableComponent.gridOptions.detailCellRendererParams.detailGridOptions;
		const tooltipMessage = detailGridOptions.columnDefs[2].tooltipValueGetter({ value: message });

		expect(tooltipMessage).toEqual(message);
	});
});
