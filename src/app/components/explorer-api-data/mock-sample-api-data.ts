import { ExplorerEndpointDetails } from 'src/app/interfaces/apiSpecification';
import { CustomColDef } from './explorer-api-column-factory';
import { ConnectableMap, Connectable } from 'src/app/interfaces/api';
import { ExplorerChanges } from 'src/app/services/explorer-changes.service';

export const mockEndpointDetails: ExplorerEndpointDetails = {
	endpoint: { path: '/trades', description: 'Returns all trades' },
	api: {
		specificationLocation: 'http://localhost/trades/v2/api-docs',
		department: 'PB',
		displayName: 'Trades'
	}
};

export const mockEndpointDetailsProductId: ExplorerEndpointDetails = {
	endpoint: { path: '/products/{productId}', description: 'single products object value with matching id' },
	api: {
		specificationLocation: 'http://localhost/products/v2/api-docs',
		department: 'Shared',
		displayName: 'Products'
	}
};

export const tradesObject: object[] = [
	{
		tradeId: 'T12345',
		account: { accountId: 'ACC1', bookName: 'Euro Trades', accountType: 'Client' },
		side: 'BUY',
		quantity: 100,
		price: 10.2,
		productDetail: { productId: 'P999', exchange: 'EPA', ticker: 'ORA' }
	},

	{
		tradeId: 'T12346',
		account: { accountId: 'ACC1', bookName: 'Euro Trades', accountType: 'Client' },
		side: 'SELL',
		quantity: 5,
		price: 676.5,
		productDetail: { productId: 'P556', exchange: 'LSE', ticker: '0AI4' }
	},

	{
		tradeId: 'T12347',
		account: { accountId: 'ACC3', bookName: 'Tech Trades', accountType: 'Special' },
		side: 'BUY',
		quantity: 53,
		price: 179.89,
		productDetail: { productId: 'P821', exchange: 'NASDAQ', ticker: 'ZM' }
	},

	{
		tradeId: 'T12348',
		account: { accountId: 'ACC3', bookName: 'Tech Trades', accountType: 'Special' },
		side: 'BUY',
		quantity: 25,
		price: 1431.5,
		productDetail: { productId: 'P387', exchange: 'NASDAQ', ticker: 'GOOGL' }
	}
];

export const productObject: object = {
	productId: 'P999',
	exchange: 'EPA',
	ticker: 'ORA',
	displayName: 'Orange SA',
	open: 10.74,
	high: 11.02,
	ask: 10.84,
	volume: 7052056
};

export const mockProductColumnDefs: CustomColDef[] = [
	{ field: 'productId' },
	{ field: 'exchange' },
	{ field: 'ticker' },
	{ field: 'displayName' },
	{ field: 'open' },
	{ field: 'quantity' },
	{ field: 'volume' }
];

export const mockComplexColumnDefsWithNoConnectable = [
	{ field: 'displayName' },
	{ field: 'open' },
	{ field: 'quantity' },
	{ field: 'volume' },
	{
		headerName: 'productDetail',
		children: [ { field: 'productDetail/productId', headerName: 'productId' } ]
	}
];

export const mockTradeColumnNames: string[] = [
	'tradeId',
	'account/accountId',
	'account/bookName',
	'account/accountType',
	'side',
	'quantity',
	'price',
	'productDetail/productId',
	'productDetail/exchange',
	'productDetail/ticker'
];

export const mockTradeColumnDefs: CustomColDef[] = [
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

export const mockTradeGroupedColumns = [
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

export const mockProductsEndpointDetails: ExplorerEndpointDetails = {
	endpoint: { path: '/products/{productId}', description: 'Returns a product by an Id' },
	api: {
		specificationLocation: 'http://localhost/products/v2/api-docs',
		department: 'Shared',
		displayName: 'Products'
	}
};

export const mockAccountsEndpointDetails: ExplorerEndpointDetails = {
	endpoint: { path: '/accounts/{accountId}', description: 'Returns a account by an Id' },
	api: {
		specificationLocation: 'http://localhost/account/v2/api-docs',
		department: 'Shared',
		displayName: 'Accounts'
	}
};

export const publishConnectableField: Connectable = {
	fieldName: 'productId',
	endpointDetails: mockProductsEndpointDetails,
	displayName: 'Products'
};

export const mockConnectableAttributes: ConnectableMap = {
	productId: { displayName: 'Products', endpointDetails: mockProductsEndpointDetails },
	accountId: { displayName: 'Accounts', endpointDetails: mockAccountsEndpointDetails }
};

export const mockExplorerChangesWithInput: ExplorerChanges = {
	dataOutputFilter: {
		Product: {
			'/products/{productId}': [
				'ask',
				'open',
				'productId',
				'displayName',
				'exchange',
				'high',
				'ticker',
				'volume'
			]
		}
	},
	inputParameters: { Products: { '/products/{productId}': 'P999' } },
	explorerEndpointDetails: [
		{
			api: {
				specificationLocation: 'http://localhost/products/v2/api-docs',
				department: 'Shared',
				displayName: 'Products'
			},
			endpoint: { path: '/products{productId}', description: 'View Trades' }
		}
	]
};

export const mockExplorerChanges: ExplorerChanges = {
	dataOutputFilter: {
		Trades: {
			'/trades': [ 'tradeId', 'account', 'side', 'quantity', 'price', 'productDetail', 'exchange', 'productId' ]
		}
	},
	inputParameters: {},
	explorerEndpointDetails: [
		{
			api: {
				specificationLocation: 'http://localhost/trades/v2/api-docs',
				department: 'PB',
				displayName: 'Trades'
			},
			endpoint: { path: '/trades', description: 'View Trades' }
		}
	]
};
