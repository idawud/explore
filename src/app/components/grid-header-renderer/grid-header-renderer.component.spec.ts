import { GridHeaderRendererComponent } from './grid-header-renderer.component';
import { IMocked, Mock, setupProperty, setupFunction } from '@morgan-stanley/ts-mocking-bird';
import { IHeaderParams, ColDef, Column } from 'ag-grid-community';

describe('GridHeaderRendererComponent', () => {
	let mockIHeaderParams: IMocked<IHeaderParams>;

	function getInstance() {
		return new GridHeaderRendererComponent();
	}

	function getMockColumn(isConnectable: boolean): IMocked<Column> {
		const renderer = isConnectable ? 'btnCellRenderer' : undefined;
		const mockColDef = Mock.create<ColDef>().setup(setupProperty('cellRenderer', renderer));
		const mockColumn = Mock.create<Column>().setup(setupFunction('getColDef', () => mockColDef.mock));
		return mockColumn;
	}

	beforeEach(() => {
		mockIHeaderParams = Mock.create<IHeaderParams>().setup(setupProperty('displayName', 'Products'));
	});

	it('should create CustomAgGridHeader Component', () => {
		const customAgGridHeaderComponent = getInstance();
		expect(customAgGridHeaderComponent).toBeDefined();
	});

	it('should set parameters on start with btnCellRenderer', () => {
		mockIHeaderParams.setupProperty('column', getMockColumn(true).mock);
		const customAgGridHeaderComponent = getInstance();
		customAgGridHeaderComponent.agInit(mockIHeaderParams.mock);

		expect(customAgGridHeaderComponent.label).toEqual('Products');
		expect(customAgGridHeaderComponent.show).toBeTrue();
	});

	it('should set parameters on start with no btnCellRenderer', () => {
		mockIHeaderParams.setupProperty('column', getMockColumn(false).mock);
		const customAgGridHeaderComponent = getInstance();
		customAgGridHeaderComponent.agInit(mockIHeaderParams.mock);

		expect(customAgGridHeaderComponent.label).toEqual('Products');
		expect(customAgGridHeaderComponent.show).toBeFalse();
	});
});
