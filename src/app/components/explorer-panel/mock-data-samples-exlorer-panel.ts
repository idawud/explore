import { ExplorerChanges } from 'src/app/services/explorer-changes.service';
import { ExplorerEndpointDetails } from 'src/app/interfaces/apiSpecification';

export const mockEndpointDetails: ExplorerEndpointDetails = {
	endpoint: { path: '/trades', description: 'View Trades' },
	api: {
		specificationLocation: 'http://localhost/trades/v2/api-docs',
		department: 'PB',
		displayName: 'Trades'
	}
};

export const mockExplorerChanges: ExplorerChanges = {
	dataOutputFilter: {
		Trades: {
			'/trades': [
				'account',
				'accountId',
				'accountType',
				'bookName',
				'price',
				'productDetail',
				'exchange',
				'productId',
				'ticker',
				'quantity',
				'side',
				'tradeId'
			]
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
