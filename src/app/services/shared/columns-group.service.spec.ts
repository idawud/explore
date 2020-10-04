import { ColumnsGroupService } from './columns-group.service';
import { CustomColDef } from 'src/app/components/explorer-api-data/explorer-api-column-factory';

describe('ColumnsGroupService', () => {
	const mockTradesColumnDefs: CustomColDef[] = [
		{ field: 'tradeId' },
		{ field: 'account/accountId' },
		{ field: 'account/bookName' },
		{ field: 'account/accountType' },
		{ field: 'side' },
		{ field: 'quantity' },
		{ field: 'price' },
		{
			field: 'productDetail/productId',
			cellRenderer: 'btnCellRenderer',
			cellRendererParams: {},
			headerTooltip: `\n\t\t\t\t<div>\n\t\t\t\t\t<b> <h5>Connectable</h5> </b>\n\t\t\t\t\tThis is connectable to 'Products API' -\n\t\t\t\t\tPlease select your option from the column below to continue\n\t\t\t\t</div>\n\t\t\t\t\t`,
			path: '/trades'
		},
		{ field: 'productDetail/exchange' },
		{ field: 'productDetail/ticker' }
	];

	const mockProductsColumnDefs: CustomColDef[] = [
		{ field: 'productId' },
		{ field: 'exchange' },
		{ field: 'ticker' },
		{ field: 'displayName' },
		{ field: 'open' },
		{ field: 'high' },
		{ field: 'ask' },
		{ field: 'volume' }
	];

	function getInstance() {
		return new ColumnsGroupService();
	}

	it('should create the ColumnsGroupService', () => {
		const columnsGroupService = getInstance();
		expect(columnsGroupService).toBeDefined();
	});

	it('should return grouped columns', () => {
		const expectedGroupedColumns = [
			{
				headerName: 'account',
				children: [
					{ field: 'account/accountId', headerName: 'accountId' },
					{ field: 'account/bookName', headerName: 'bookName' },
					{ field: 'account/accountType', headerName: 'accountType' }
				]
			},
			{
				headerName: 'productDetail',
				children: [
					{
						field: 'productDetail/productId',
						cellRenderer: 'btnCellRenderer',
						cellRendererParams: {},
						headerTooltip: `\n\t\t\t\t<div>\n\t\t\t\t\t<b> <h5>Connectable</h5> </b>\n\t\t\t\t\tThis is connectable to 'Products API' -\n\t\t\t\t\tPlease select your option from the column below to continue\n\t\t\t\t</div>\n\t\t\t\t\t`,
						path: '/trades',
						headerName: 'productId'
					},
					{ field: 'productDetail/exchange', headerName: 'exchange' },
					{ field: 'productDetail/ticker', headerName: 'ticker' }
				]
			},
			{ field: 'tradeId' },
			{ field: 'side' },
			{ field: 'quantity' },
			{ field: 'price' }
		];

		const columnsGroupService = getInstance();
		const groupedColumns = columnsGroupService.groupColumns(mockTradesColumnDefs);

		expect(groupedColumns).toEqual(expectedGroupedColumns);
	});

	it('should return columns if there is no grouping', () => {
		const columnsGroupService = getInstance();
		const groupedColumns = columnsGroupService.groupColumns(mockProductsColumnDefs);

		expect(groupedColumns).toEqual(mockProductsColumnDefs);
	});
});
