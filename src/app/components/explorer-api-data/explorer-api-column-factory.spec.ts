import { IMocked, Mock, setupFunction } from '@morgan-stanley/ts-mocking-bird';
import {
	mockConnectableAttributes,
	mockTradeColumnNames,
	mockTradeColumnDefs,
	mockProductsEndpointDetails
} from './mock-sample-api-data';
import { ConnectableService } from 'src/app/services/connectable.service';
import { ExplorerApiColumnFactory } from './explorer-api-column-factory';
import { ExplorerPanelApiService } from 'src/app/services/shared/explorer-panel-api.service';
import { ExplorerChangesService } from 'src/app/services/explorer-changes.service';

describe('ExplorerApiColumnFactory', () => {
	let explorerPanelApiService: IMocked<ExplorerPanelApiService>;
	let mockConnectableService: IMocked<ConnectableService>;
	let mockExplorerChangesService: IMocked<ExplorerChangesService>;

	beforeEach(() => {
		explorerPanelApiService = Mock.create<ExplorerPanelApiService>().setup(
			setupFunction('duplicateConnectableEndpointDetailsToExplorer', () => mockProductsEndpointDetails),
			setupFunction('addInputParameter', () => {})
		);
		mockConnectableService = Mock.create<ConnectableService>().setup(
			setupFunction('getConnectables', () => mockConnectableAttributes)
		);
		mockExplorerChangesService = Mock.create<ExplorerChangesService>().setup(
			setupFunction('publishConnectable', () => {})
		);
	});

	function getInstance() {
		return new ExplorerApiColumnFactory(
			mockConnectableService.mock,
			explorerPanelApiService.mock,
			mockExplorerChangesService.mock
		);
	}

	const headerTooltip = `
				<div>
					<b> <h5>Connectable</h5> </b>
					This is connectable to 'Products API' -
					Please select your option from the column below to continue
				</div>
					`;

	it('should create ExplorerApiColumnFactory class', () => {
		const explorerApiColumnFactory = getInstance();
		expect(explorerApiColumnFactory).toBeDefined();
	});

	it('should fetch connectable data on click', () => {
		const explorerApiColumnFactory = getInstance();
		const columnDef = explorerApiColumnFactory.createColumnDef('productDetail/productId', '/trades', true);

		columnDef.cellRendererParams.onClick({
			field: 'productDetails/productId',
			value: 'P999',
			path: '/trades'
		});

		columnDef.cellRendererParams.onClick({
			field: 'productId',
			value: 'P225',
			path: '/products'
		});

		columnDef.cellRendererParams.onClick({
			field: 'productDetails/productId',
			value: 'P851',
			path: '/trades'
		});

		expect(explorerPanelApiService.withFunction('addInputParameter')).wasCalledAtLeastOnce();
		expect(
			explorerPanelApiService.withFunction('duplicateConnectableEndpointDetailsToExplorer')
		).wasCalledAtLeastOnce();
		expect(mockExplorerChangesService.withFunction('publishConnectable')).wasCalledAtLeastOnce();
	});

	it('should create a simple ag grid column definition', () => {
		const explorerApiColumnFactory = getInstance();
		const columnDef = explorerApiColumnFactory.createColumnDef('productId', '/trades', false);

		expect(columnDef).toEqual({ field: 'productId' });
	});

	it('should return a collection ag grid column definition for each column name', () => {
		const explorerApiColumnFactory = getInstance();
		const columnDef = explorerApiColumnFactory.createColumnDefs(mockTradeColumnNames, '/trades', false);

		expect(columnDef.length).toEqual(mockTradeColumnDefs.length);
	});

	it('should create a ag grid column definition with btnCellRenderer', () => {
		const explorerApiColumnFactory = getInstance();
		const columnDef = explorerApiColumnFactory.createColumnDef('productDetail/productId', '/trades', true);

		expect(columnDef.field).toEqual('productDetail/productId');
		expect(columnDef.cellRenderer).toEqual('btnCellRenderer');
		expect(columnDef.headerTooltip).toEqual(headerTooltip);
		expect(columnDef.path).toEqual('/trades');
	});
});
