import { fakeAsync, tick } from '@angular/core/testing';
import { ExplorerApiDataComponent } from './explorer-api-data.component';
import { IMocked, Mock, setupFunction, setupProperty } from '@morgan-stanley/ts-mocking-bird';
import { ApiSpecificationService } from 'src/app/services/api_specification.service';
import { ExplorerPanelApiService } from 'src/app/services/shared/explorer-panel-api.service';
import { mockReferenceModel } from 'src/app/services/ReferenceModelSample';
import { of } from 'rxjs';
import { mockedSpecificationData } from 'src/app/services/OpenApiSpecSamples';
import { GridApi, GridReadyEvent } from 'ag-grid-community';
import { ApiService } from 'src/app/services/api.service';
import { mockedSpecificationDataV3 } from 'src/app/services/OpenApiSpecSamplesV3';
import { ConnectableService } from 'src/app/services/connectable.service';
import {
	mockConnectableAttributes,
	mockEndpointDetails,
	tradesObject,
	productObject,
	mockEndpointDetailsProductId,
	mockTradeColumnDefs,
	mockTradeGroupedColumns,
	mockProductColumnDefs,
	publishConnectableField,
	mockComplexColumnDefsWithNoConnectable,
	mockExplorerChangesWithInput,
	mockExplorerChanges
} from './mock-sample-api-data';
import { ExplorerApiColumnFactory } from './explorer-api-column-factory';
import { ColumnsGroupService } from 'src/app/services/shared/columns-group.service';
import { ExplorerApiDataParser } from './explorer-api-data-parser';
import { ExplorerChangesService } from 'src/app/services/explorer-changes.service';

describe('ExplorerApiDataComponent', () => {
	let mockApiSpecificationService: IMocked<ApiSpecificationService>;
	let mockExplorerPanelApiService: IMocked<ExplorerPanelApiService>;
	let mockApiService: IMocked<ApiService>;
	let mockConnectableService: IMocked<ConnectableService>;
	let explorerApiColumnFactory: IMocked<ExplorerApiColumnFactory>;
	let mockColumnsGroupService: IMocked<ColumnsGroupService>;
	let explorerApiDataParser: IMocked<ExplorerApiDataParser>;
	let mockExplorerChangesService: IMocked<ExplorerChangesService>;

	const mockColumnDef = [
		{ field: 'tradeId' },
		{ field: 'account/accountId' },
		{ field: 'account/bookName' },
		{ field: 'account/accountType' },
		{ field: 'side' },
		{ field: 'quantity' },
		{ field: 'price' },
		{ field: 'productDetail/exchange' },
		{ field: 'productDetail/ticker' },
		{ field: 'productDetail/productId' }
	];

	const gridApiMock: IMocked<GridApi> = Mock.create<GridApi>().setup(
		setupFunction('setRowData', () => {}),
		setupFunction('setColumnDefs', () => {}),
		setupFunction('sizeColumnsToFit', () => {})
	);

	const gridReadyEventMock: IMocked<GridReadyEvent> = Mock.create<GridReadyEvent>().setup(
		setupProperty('api', gridApiMock.mock)
	);

	beforeEach(() => {
		mockApiSpecificationService = Mock.create<ApiSpecificationService>().setup(
			setupFunction('getReferenceDefinitionModel', () => mockReferenceModel),
			setupFunction('getSpecificationAsync', () => of(mockedSpecificationData))
		);
		mockExplorerPanelApiService = Mock.create<ExplorerPanelApiService>().setup(
			setupFunction('removeEndpointDetailsFromExplorerPanel', () => {})
		);
		mockApiService = Mock.create<ApiService>();
		mockConnectableService = Mock.create<ConnectableService>().setup(
			setupProperty('connectableField$', of(publishConnectableField)),
			setupFunction('getConnectables', () => mockConnectableAttributes)
		);
		explorerApiColumnFactory = Mock.create<ExplorerApiColumnFactory>().setup(
			setupFunction('createColumnDef', () => ({ field: 'exchange' } as any)),
			setupFunction('createColumnDefs', () => mockTradeColumnDefs)
		);
		mockColumnsGroupService = Mock.create<ColumnsGroupService>().setup(
			setupFunction('groupColumns', () => mockTradeGroupedColumns)
		);

		explorerApiDataParser = Mock.create<ExplorerApiDataParser>().setup(
			setupFunction('parseRowDataAndColumns', () => ({
				rowData: tradesObject,
				columnDef: mockColumnDef
			}))
		);
		mockExplorerChangesService = Mock.create<ExplorerChangesService>().setup(
			setupFunction('publishChanges', () => {}),
			setupProperty('explorerChanges$', of(mockExplorerChanges)),
			setupProperty('hasChanges$', of(true))
		);
	});

	function getInstance() {
		const explorerApiDataComponent = new ExplorerApiDataComponent(
			mockApiService.mock,
			mockApiSpecificationService.mock,
			mockExplorerPanelApiService.mock,
			mockConnectableService.mock,
			mockColumnsGroupService.mock,
			explorerApiDataParser.mock,
			explorerApiColumnFactory.mock,
			mockExplorerChangesService.mock
		);
		return explorerApiDataComponent;
	}

	it('should create Explorer Api Data Component', () => {
		const explorerApiDataComponent = getInstance();
		expect(explorerApiDataComponent).toBeDefined();
	});

	it(
		'should create subscription when init is called',
		fakeAsync(() => {
			const explorerApiModelComponent = getInstance();
			explorerApiModelComponent.endpointDetails = mockEndpointDetails;
			explorerApiModelComponent.ngOnInit();
			tick();

			expect(explorerApiModelComponent.subscription.closed).toBe(false);
		})
	);

	it(
		'should remove subscription when destroy is called',
		fakeAsync(() => {
			const explorerApiModelComponent = getInstance();
			explorerApiModelComponent.ngOnDestroy();
			tick();

			expect(explorerApiModelComponent.subscription.closed).toBe(true);
		})
	);

	it('should set No rowData on ready if no data available', () => {
		const explorerApiModelComponent = getInstance();
		mockApiService.setupFunction('fetchDataFromServerAsync', () => of(undefined));

		explorerApiModelComponent.endpointDetails = mockEndpointDetails;
		explorerApiModelComponent.ngOnInit();

		explorerApiModelComponent.gridOptions.onGridReady(gridReadyEventMock.mock);

		expect(explorerApiModelComponent.rowData.length).toEqual(0);
	});

	it('should set single rowData on ready for objects', () => {
		const explorerApiModelComponent = getInstance();
		explorerApiDataParser.setupFunction('parseRowDataAndColumns', () => ({
			rowData: [ tradesObject[0] ],
			columnDef: mockColumnDef
		}));
		mockApiService.setupFunction('fetchDataFromServerAsync', () => of(tradesObject[0]) as any);
		explorerApiModelComponent.endpointDetails = mockEndpointDetails;
		explorerApiModelComponent.ngOnInit();

		explorerApiModelComponent.gridOptions.onGridReady(gridReadyEventMock.mock);

		expect(mockColumnsGroupService.withFunction('groupColumns')).wasCalledAtLeastOnce();
		expect(explorerApiModelComponent.rowData.length).toEqual(1);
	});

	it('should set multiple rowData on ready for arrays', () => {
		const explorerApiModelComponent = getInstance();
		mockApiService.setupFunction('fetchDataFromServerAsync', () => of(tradesObject) as any);

		explorerApiModelComponent.endpointDetails = mockEndpointDetails;
		explorerApiModelComponent.ngOnInit();

		explorerApiModelComponent.gridOptions.onGridReady(gridReadyEventMock.mock);

		expect(mockColumnsGroupService.withFunction('groupColumns')).wasCalledAtLeastOnce();
		expect(explorerApiModelComponent.columnDefs.length).toEqual(6);
	});

	it('should set multiple rowData on ready for data with connectable', () => {
		explorerApiColumnFactory.setupFunction('createColumnDefs', () => mockProductColumnDefs);
		mockColumnsGroupService.setupFunction('groupColumns', () => mockProductColumnDefs);
		const explorerApiModelComponent = getInstance();
		mockApiService.setupFunction('fetchDataFromServerAsync', () => of(productObject) as any);

		explorerApiModelComponent.endpointDetails = mockEndpointDetails;
		explorerApiModelComponent.ngOnInit();

		explorerApiModelComponent.gridOptions.onGridReady(gridReadyEventMock.mock);

		expect(mockColumnsGroupService.withFunction('groupColumns')).wasCalledAtLeastOnce();
		expect(explorerApiModelComponent.columnDefs.length).toEqual(7);
	});

	it('should set multiple rowData on ready for data with connectable for complex data', () => {
		explorerApiColumnFactory.setupFunction('createColumnDefs', () => mockProductColumnDefs);
		mockColumnsGroupService.setupFunction('groupColumns', () => mockComplexColumnDefsWithNoConnectable);
		const explorerApiModelComponent = getInstance();
		mockApiService.setupFunction('fetchDataFromServerAsync', () => of(productObject) as any);

		explorerApiModelComponent.endpointDetails = mockEndpointDetails;
		explorerApiModelComponent.ngOnInit();

		explorerApiModelComponent.gridOptions.onGridReady(gridReadyEventMock.mock);

		expect(mockColumnsGroupService.withFunction('groupColumns')).wasCalledAtLeastOnce();
		expect(explorerApiModelComponent.columnDefs.length).toEqual(5);
	});

	it('should not update column if no connectables observed', () => {
		mockConnectableService.setupProperty('connectableField$', of(null));
		const explorerApiModelComponent = getInstance();
		mockApiService.setupFunction('fetchDataFromServerAsync', () => of(tradesObject[0]) as any);

		explorerApiModelComponent.endpointDetails = mockEndpointDetails;
		explorerApiModelComponent.ngOnInit();

		explorerApiModelComponent.gridOptions.onGridReady(gridReadyEventMock.mock);

		expect(mockColumnsGroupService.withFunction('groupColumns')).wasCalledAtLeastOnce();
		expect(explorerApiModelComponent.rowData.length).toEqual(4);
	});

	it('should set rowData on ready for input parameters', () => {
		mockApiSpecificationService.setupFunction('getSpecificationAsync', () => of(mockedSpecificationData));
		mockExplorerChangesService.setupProperty('explorerChanges$', of(mockExplorerChangesWithInput));

		const explorerApiModelComponent = getInstance();
		mockApiService.setupFunction('fetchDataFromServerAsync', () => of(productObject) as any);

		explorerApiModelComponent.endpointDetails = mockEndpointDetailsProductId;
		explorerApiModelComponent.ngOnInit();

		explorerApiModelComponent.gridOptions.onGridReady(gridReadyEventMock.mock);

		expect(mockColumnsGroupService.withFunction('groupColumns')).wasCalledAtLeastOnce();
		expect(explorerApiDataParser.withFunction('parseRowDataAndColumns')).wasCalledAtLeastOnce();
		expect(explorerApiModelComponent.rowData.length).toEqual(4);
	});

	it('should set array rowData on ready', () => {
		const explorerApiModelComponent = getInstance();
		explorerApiDataParser.setupFunction('parseRowDataAndColumns', () => ({
			rowData: [ tradesObject[0] ],
			columnDef: mockColumnDef
		}));
		mockApiService.setupFunction('fetchDataFromServerAsync', () => of(tradesObject) as any);
		explorerApiModelComponent.endpointDetails = mockEndpointDetails;
		explorerApiModelComponent.ngOnInit();

		explorerApiModelComponent.gridOptions.onGridReady(gridReadyEventMock.mock);

		expect(explorerApiDataParser.withFunction('parseRowDataAndColumns')).wasCalledAtLeastOnce();
		expect(explorerApiModelComponent.rowData.length).toEqual(1);
	});

	it('should set array rowData on reload', () => {
		mockApiSpecificationService.setupFunction('getSpecificationAsync', () => of(mockedSpecificationData));
		mockExplorerChangesWithInput.inputParameters = { Products: { '': 'css' } };
		mockExplorerChangesService.setupProperty('explorerChanges$', of(mockExplorerChangesWithInput));
		mockApiService.setupFunction('fetchDataFromServerAsync', () => of() as any);

		const explorerApiModelComponent = getInstance();
		explorerApiModelComponent.endpointDetails = mockEndpointDetailsProductId;
		explorerApiModelComponent.ngOnInit();
		explorerApiModelComponent.hostURL = 'http://localhost/products/products/';
		explorerApiModelComponent.loadEndpoint();
		explorerApiModelComponent.gridOptions.onGridReady(gridReadyEventMock.mock);

		expect(explorerApiModelComponent.rowData.length).toEqual(0);
	});

	it('should set no rowData on ready if no input parameters not published to data output', async () => {
		mockApiSpecificationService.setupFunction('getSpecificationAsync', () => of(mockedSpecificationDataV3));
		mockExplorerChangesWithInput.inputParameters = {};
		mockExplorerChangesService.setupProperty('explorerChanges$', of(mockExplorerChangesWithInput));

		const explorerApiModelComponent = getInstance();

		expect(explorerApiModelComponent.rowData.length).toEqual(0);
	});

	it('should set no rowData on ready for empty input  parameters', () => {
		mockApiSpecificationService.setupFunction('getSpecificationAsync', () => of(mockedSpecificationDataV3));
		mockExplorerChangesWithInput.inputParameters = { Products: { '/products/{productId}': '' } };
		mockExplorerChangesService.setupProperty('explorerChanges$', of(mockExplorerChangesWithInput));

		const explorerApiModelComponent = getInstance();
		mockApiService.setupFunction('fetchDataFromServerAsync', () => of() as any);

		explorerApiModelComponent.endpointDetails = mockEndpointDetailsProductId;
		explorerApiModelComponent.hostURL = 'http://localhost/products/products/';
		explorerApiModelComponent.ngOnInit();

		explorerApiModelComponent.gridOptions.onGridReady(gridReadyEventMock.mock);

		expect(explorerApiModelComponent.rowData.length).toEqual(0);
	});

	it('should set rowData on ready for input parameters', () => {
		mockApiSpecificationService.setupFunction('getSpecificationAsync', () => of(mockedSpecificationData));
		mockExplorerChangesWithInput.inputParameters = { Products: { '/products/{productId}': 'P999' } };
		mockExplorerChangesService.setupProperty('explorerChanges$', of(mockExplorerChangesWithInput));

		const explorerApiModelComponent = getInstance();
		mockApiService.setupFunction('fetchDataFromServerAsync', () => of(productObject) as any);

		explorerApiModelComponent.endpointDetails = mockEndpointDetailsProductId;
		explorerApiModelComponent.ngOnInit();

		explorerApiModelComponent.gridOptions.onGridReady(gridReadyEventMock.mock);

		expect(explorerApiDataParser.withFunction('parseRowDataAndColumns')).wasCalledAtLeastOnce();
		expect(explorerApiModelComponent.rowData.length).toEqual(4);
	});

	it('should set rowData on ready for input parameters', () => {
		mockApiSpecificationService.setupFunction('getSpecificationAsync', () => of(mockedSpecificationData));
		mockExplorerChangesWithInput.inputParameters = { Products: { '/products/{productId}': '' } };
		mockExplorerChangesService.setupProperty('explorerChanges$', of(mockExplorerChangesWithInput));

		const explorerApiModelComponent = getInstance();
		mockApiService.setupFunction('fetchDataFromServerAsync', () => of(productObject) as any);

		explorerApiModelComponent.endpointDetails = mockEndpointDetailsProductId;
		explorerApiModelComponent.ngOnInit();

		explorerApiModelComponent.gridOptions.onGridReady(gridReadyEventMock.mock);

		expect(explorerApiDataParser.withFunction('parseRowDataAndColumns')).wasCalledAtLeastOnce();
		expect(explorerApiModelComponent.rowData.length).toEqual(4);
	});

	it('should set no rowData on ready if path does not match', () => {
		mockApiSpecificationService.setupFunction('getSpecificationAsync', () => of(mockedSpecificationData));
		mockExplorerChangesWithInput.inputParameters = { Products: { '': 'css' } };
		mockExplorerChangesService.setupProperty('explorerChanges$', of(mockExplorerChangesWithInput));
		mockApiService.setupFunction('fetchDataFromServerAsync', () => of() as any);

		const explorerApiModelComponent = getInstance();
		explorerApiModelComponent.endpointDetails = mockEndpointDetailsProductId;
		explorerApiModelComponent.ngOnInit();
		explorerApiModelComponent.hostURL = 'http://localhost/products/products/cs';
		explorerApiModelComponent.gridOptions.onGridReady(gridReadyEventMock.mock);

		expect(explorerApiModelComponent.rowData.length).toEqual(0);
	});

	it('should set no rowData on ready for invalid input parameters', () => {
		mockApiSpecificationService.setupFunction('getSpecificationAsync', () => of(mockedSpecificationData));
		mockExplorerChangesWithInput.inputParameters = { Products: { '/products/{productId}': 'css' } };
		mockExplorerChangesService.setupProperty('explorerChanges$', of(mockExplorerChangesWithInput));
		mockApiService.setupFunction('fetchDataFromServerAsync', () => of() as any);

		const explorerApiModelComponent = getInstance();
		explorerApiModelComponent.endpointDetails = mockEndpointDetailsProductId;
		explorerApiModelComponent.ngOnInit();
		explorerApiModelComponent.hostURL = 'http://localhost/products/products/cs';
		explorerApiModelComponent.gridOptions.onGridReady(gridReadyEventMock.mock);

		expect(explorerApiModelComponent.rowData.length).toEqual(0);
	});

	it('should remove an endpoint from the explorer panel', () => {
		const explorerApiModelComponent = getInstance();
		explorerApiModelComponent.endpointDetails = mockEndpointDetails;
		explorerApiModelComponent.removeEndpoint();

		expect(
			mockExplorerPanelApiService
				.withFunction('removeEndpointDetailsFromExplorerPanel')
				.withParameters(mockEndpointDetails)
		).wasCalledOnce();
	});
});
