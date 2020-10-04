import { ExplorerApiDataParser } from './explorer-api-data-parser';
import { IMocked, Mock, setupFunction } from '@morgan-stanley/ts-mocking-bird';
import { ExplorerApiColumnFactory } from './explorer-api-column-factory';
import { tradesObject, mockEndpointDetails, mockEndpointDetailsProductId } from './mock-sample-api-data';
import { ApiFilters } from 'src/app/interfaces/api';

describe('ExplorerApiDataParser', () => {
	let mockExplorerApiColumnFactory: IMocked<ExplorerApiColumnFactory>;
	const mockFilters: ApiFilters = {
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
	};

	const mockColumnDef = { field: 'tradeId' };

	beforeEach(() => {
		mockExplorerApiColumnFactory = Mock.create<ExplorerApiColumnFactory>().setup(
			setupFunction('createColumnDef', () => mockColumnDef)
		);
	});

	function getInstance() {
		return new ExplorerApiDataParser(mockExplorerApiColumnFactory.mock);
	}

	it('should create ExplorerApiDataParser class', () => {
		const explorerApiDataParser = getInstance();
		expect(explorerApiDataParser).toBeDefined();
	});

	it('should check createColumnDef was called when rowData parser is invoked', () => {
		const explorerApiDataParser = getInstance();

		explorerApiDataParser.parseRowDataAndColumns(tradesObject, mockFilters, mockEndpointDetails, true);

		expect(mockExplorerApiColumnFactory.withFunction('createColumnDef')).wasCalledAtLeastOnce();
	});

	it('should update filters if detailed row display property is unchecked', () => {
		const explorerApiDataParser = getInstance();
		const filters: ApiFilters = {
			Trades: {
				'/trades': [ 'price', 'productDetail', 'productId', 'ticker', 'quantity', 'side', 'tradeId' ]
			}
		};

		explorerApiDataParser.parseRowDataAndColumns(tradesObject, filters, mockEndpointDetails, true);
		expect(mockExplorerApiColumnFactory.withFunction('createColumnDef')).wasCalledAtLeastOnce();
	});

	it('should hide all columns if filters list is empty', () => {
		const explorerApiDataParser = getInstance();
		const filters = {};

		const rowDataAndColumns = explorerApiDataParser.parseRowDataAndColumns(
			tradesObject,
			filters,
			mockEndpointDetails,
			true
		);

		expect(rowDataAndColumns.columnDef.length).toEqual(0);
	});
});
