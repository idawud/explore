import { ExplorerApiModelComponent } from './explorer-api-model.component';
import { ExplorerPanelApiService } from 'src/app/services/shared/explorer-panel-api.service';
import {
	setupFunction,
	IMocked,
	Mock,
	setupProperty,
	addMatchers,
	replacePropertiesBeforeEach
} from '@morgan-stanley/ts-mocking-bird';
import { Parameters, ExplorerEndpointDetails } from 'src/app/interfaces/apiSpecification';
import { ApiSpecificationService } from 'src/app/services/api_specification.service';
import * as rxjs from 'rxjs';
import { of, Subscription } from 'rxjs';
import { ConnectableService } from 'src/app/services/connectable.service';
import { ConnectableMap } from 'src/app/interfaces/api';
import { publishConnectableField, mockProductsEndpointDetails } from '../explorer-api-data/mock-sample-api-data';
import { Connectable } from 'src/app/interfaces/api';
import { mockedSpecificationData } from 'src/app/services/OpenApiSpecSamples';
import { mockReferenceModel } from 'src/app/services/ReferenceModelSample';
import { GridApi, GridReadyEvent, RowSelectedEvent, RowNode } from 'ag-grid-community';

describe('ExplorerApiModelComponent', () => {
	let mockApiSpecificationService: IMocked<ApiSpecificationService>;
	let mockExplorerPanelApiService: IMocked<ExplorerPanelApiService>;
	let mockConnectableService: IMocked<ConnectableService>;
	let mockSubscription: IMocked<Subscription>;
	let mockSubscriptionPackage: IMocked<typeof rxjs>;

	const mockConnectableAttributes: ConnectableMap = {
		productId: { endpointDetails: mockProductsEndpointDetails, displayName: 'Products' }
	};

	const mockEndpointDetails: ExplorerEndpointDetails = {
		endpoint: { path: '/trades', description: 'Returns all trades' },
		api: {
			specificationLocation: 'http://localhost/trades/v2/api-docs',
			department: 'PB',
			displayName: 'Trades'
		}
	};
	const mockPath = '/trades';
	const mockFields = [ 'tradeId', 'price', 'account', 'quantity', 'side', 'productDetails' ];

	const mockParameter: Parameters = { hasParameter: false, parameter: null };

	replacePropertiesBeforeEach(() => {
		mockSubscription = Mock.create<rxjs.Subscription>().setup(
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
		mockApiSpecificationService = Mock.create<ApiSpecificationService>().setup(
			setupFunction('getReferenceDefinitionModel', () => mockReferenceModel),
			setupFunction('getInputParameters', () => mockParameter),
			setupFunction('getSpecificationAsync', () => of(mockedSpecificationData))
		);
		mockConnectableService = Mock.create<ConnectableService>().setup(
			setupProperty('connectableField$', of(publishConnectableField)),
			setupFunction('getAllConnectablesFromSpecificationDocument', () => {}),
			setupFunction('getConnectables', () => mockConnectableAttributes)
		);
		mockExplorerPanelApiService = Mock.create<ExplorerPanelApiService>().setup(
			setupFunction('removeDataOutputFilter', () => of(mockPath)),
			setupFunction('addDataOutputFilter', () => of(mockPath, mockFields)),
			setupFunction('removeEndpointDetailsFromExplorerPanel', () => {})
		);
	});

	function getInstance() {
		const explorerApiModelComponent = new ExplorerApiModelComponent(
			mockApiSpecificationService.mock,
			mockExplorerPanelApiService.mock,
			mockConnectableService.mock
		);
		return explorerApiModelComponent;
	}

	it('should create Explorer Api Model Component', () => {
		const explorerApiModelComponent = getInstance();
		expect(explorerApiModelComponent).toBeDefined();
	});

	it('should check add subscription was called when init runs', () => {
		const explorerApiModelComponent = getInstance();
		explorerApiModelComponent.endpointDetails = mockEndpointDetails;
		explorerApiModelComponent.ngOnInit();

		expect(mockSubscription.withFunction('add')).wasCalledAtLeastOnce();
	});

	it('should check unsubscribe was called when destroy is invoked', () => {
		const explorerApiModelComponent = getInstance();
		explorerApiModelComponent.ngOnDestroy();

		expect(mockSubscription.withFunction('unsubscribe')).wasCalledOnce();
	});

	it('should set endpointDetails on init', () => {
		const schemaParams = mockedSpecificationData.paths['/products/{productId}'].get.parameters;
		mockApiSpecificationService.setupFunction('getInputParameters', () => ({
			hasParameter: true,
			parameter: schemaParams
		}));

		mockExplorerPanelApiService.setupFunction('addInputParameter', () => {});
		const explorerApiModelComponent = getInstance();
		explorerApiModelComponent.endpointDetails = mockEndpointDetails;
		explorerApiModelComponent.ngOnInit();

		expect(mockApiSpecificationService.withFunction('getReferenceDefinitionModel')).wasCalledOnce();
		expect(mockApiSpecificationService.withFunction('getInputParameters')).wasCalledOnce();
	});

	describe('isRowMaster', () => {
		it('should return values for empty string i.e. drillable field', () => {
			const explorerApiModelComponent = getInstance();
			const result = explorerApiModelComponent.isRowMaster({ type: '', values: [] });
			expect(result).toEqual([]);
		});

		it('should return false for non-empty string', () => {
			const explorerApiModelComponent = getInstance();
			const result = explorerApiModelComponent.isRowMaster({ type: 'string', values: [] });
			expect(result).toBeFalse();
		});
	});

	it('should set detailedRowData for expand rendering', () => {
		const mockGridParamsData = {
			node: {},
			data: mockReferenceModel,
			successCallback: () => {}
		};

		const mockConnectables: ConnectableMap = {
			tradeId: { endpointDetails: mockProductsEndpointDetails, displayName: 'Trades' }
		};

		const explorerApiModelComponent = getInstance();
		explorerApiModelComponent.connecTableField = mockConnectables;
		const cellRenderer = explorerApiModelComponent.gridOptions.detailCellRendererParams;

		cellRenderer.getDetailRowData(mockGridParamsData);

		expect(explorerApiModelComponent.detailRowData.length).toEqual(6);
	});

	it('should set rowData on ready', () => {
		const explorerApiModelComponent = getInstance();

		mockConnectableAttributes.tradeId = {
			endpointDetails: mockProductsEndpointDetails,
			displayName: 'Trades'
		};

		explorerApiModelComponent.connecTableField = mockConnectableAttributes;
		explorerApiModelComponent.endpointDetails = mockEndpointDetails;
		explorerApiModelComponent.ngOnInit();

		const gridApiMock: IMocked<GridApi> = Mock.create<GridApi>().setup(
			setupFunction('setRowData', () => {}),
			setupFunction('sizeColumnsToFit', () => {}),
			setupFunction('selectAll', () => {})
		);

		const gridReadyEventMock: IMocked<GridReadyEvent> = Mock.create<GridReadyEvent>().setup(
			setupProperty('api', gridApiMock.mock)
		);
		explorerApiModelComponent.gridOptions.onGridReady(gridReadyEventMock.mock);

		expect(explorerApiModelComponent.rowData.length).toEqual(6);
	});

	it('should select all fields under drillable field on ready', () => {
		const explorerApiModelComponent = getInstance();
		explorerApiModelComponent.connecTableField = mockConnectableAttributes;
		explorerApiModelComponent.endpointDetails = mockEndpointDetails;
		explorerApiModelComponent.ngOnInit();

		const gridApiMock: IMocked<GridApi> = Mock.create<GridApi>().setup(setupFunction('selectAll', () => {}));

		const gridReadyEventMock: IMocked<GridReadyEvent> = Mock.create<GridReadyEvent>().setup(
			setupProperty('api', gridApiMock.mock)
		);
		explorerApiModelComponent.gridOptions.detailCellRendererParams.detailGridOptions.onGridReady(
			gridReadyEventMock.mock
		);

		expect(gridApiMock.withFunction('selectAll')).wasCalledOnce();
	});

	it('should remove an endpoint from the explorer panel', () => {
		const explorerApiModelComponent = getInstance();
		explorerApiModelComponent.connecTableField = mockConnectableAttributes;
		explorerApiModelComponent.endpointDetails = mockEndpointDetails;
		explorerApiModelComponent.removeEndpoint();

		expect(
			mockExplorerPanelApiService
				.withFunction('removeEndpointDetailsFromExplorerPanel')
				.withParameters(mockEndpointDetails)
		).wasCalledOnce();
	});

	it('should duplicate an endpoint from the explorer panel', () => {
		mockExplorerPanelApiService.setupFunction('duplicateEndpointDetailsToExplorer', () => {});
		const explorerApiModelComponent = getInstance();
		explorerApiModelComponent.connecTableField = mockConnectableAttributes;
		explorerApiModelComponent.endpointDetails = mockEndpointDetails;
		explorerApiModelComponent.duplicateEndpoint();

		expect(
			mockExplorerPanelApiService
				.withFunction('duplicateEndpointDetailsToExplorer')
				.withParameters(mockEndpointDetails)
		).wasCalledOnce();
	});

	it('should get nodes if row is selected ', () => {
		const explorerApiModelComponent = getInstance();
		explorerApiModelComponent.endpointDetails = mockEndpointDetails;
		const mockRowNode: IMocked<RowNode> = Mock.create<RowNode>().setup(
			setupFunction('isSelected', () => true),
			setupProperty('data', { fieldName: 'account' })
		);

		const mockRowSelectedEvent: IMocked<RowSelectedEvent> = Mock.create<RowSelectedEvent>().setup(
			setupProperty('node', mockRowNode.mock)
		);

		explorerApiModelComponent.gridOptions.onRowSelected(mockRowSelectedEvent.mock);
		explorerApiModelComponent.gridOptions.onRowSelected(mockRowSelectedEvent.mock);
		expect(mockRowNode.withFunction('isSelected')).wasCalled(2);
	});

	it('should get nodes if row is not selected', () => {
		const explorerApiModelComponent = getInstance();
		explorerApiModelComponent.endpointDetails = mockEndpointDetails;
		const mockRowNode: IMocked<RowNode> = Mock.create<RowNode>().setup(
			setupFunction('isSelected', () => false),
			setupProperty('data', { fieldName: 'account' })
		);

		const mockRowSelectedEvent: IMocked<RowSelectedEvent> = Mock.create<RowSelectedEvent>().setup(
			setupProperty('node', mockRowNode.mock)
		);

		explorerApiModelComponent.gridOptions.onRowSelected(mockRowSelectedEvent.mock);
		expect(mockRowNode.withFunction('isSelected')).wasCalledOnce();
	});

	it('should get detailed nodes if row is selected', () => {
		const explorerApiModelComponent = getInstance();
		explorerApiModelComponent.endpointDetails = mockEndpointDetails;
		const mockRowNode: IMocked<RowNode> = Mock.create<RowNode>().setup(
			setupFunction('isSelected', () => false),
			setupProperty('data', { fieldName: 'account' })
		);

		const mockRowSelectedEvent: IMocked<RowSelectedEvent> = Mock.create<RowSelectedEvent>().setup(
			setupProperty('node', mockRowNode.mock)
		);

		explorerApiModelComponent.gridOptions.detailCellRendererParams.detailGridOptions.onRowSelected(
			mockRowSelectedEvent.mock
		);
		expect(mockRowNode.withFunction('isSelected')).wasCalledOnce();
	});
});
