import { ExplorerPanelApiService } from './explorer-panel-api.service';

describe('PanelApiService', () => {
	const mockExplorerEndpointDetails = {
		endpoint: { path: '/trades', description: 'Returns all trades' },
		api: {
			specificationLocation: 'http://localhost/trades/v2/api-docs',
			department: 'PB',
			displayName: 'Trades'
		}
	};

	const mockPath = '/trades';
	const mockValue = [ 'tradeId', 'price', 'account', 'quantity', 'side', 'productDetails' ];

	function getInstance() {
		return new ExplorerPanelApiService();
	}

	it('should create Panel Api Service', () => {
		const explorerPanelApiService = getInstance();
		expect(explorerPanelApiService).toBeDefined();
	});

	it('should add endpoint details to endpoint details list', () => {
		const explorerPanelApiService = getInstance();

		explorerPanelApiService.addEndpointDetailsToExplorer(mockExplorerEndpointDetails);
		explorerPanelApiService.addEndpointDetailsToExplorer(mockExplorerEndpointDetails);

		expect(explorerPanelApiService.getExplorerEndpointDetails()).toEqual([ mockExplorerEndpointDetails ]);
	});

	it('should remove api from panel api list', () => {
		const explorerPanelApiService = getInstance();
		explorerPanelApiService.addEndpointDetailsToExplorer(mockExplorerEndpointDetails);

		explorerPanelApiService.removeEndpointDetailsFromExplorerPanel(mockExplorerEndpointDetails);
		explorerPanelApiService.removeEndpointDetailsFromExplorerPanel(mockExplorerEndpointDetails);
		explorerPanelApiService.explorerEndpointDetails$.subscribe(endpointDetails => {
			expect(endpointDetails).toEqual([]);
		});
	});

	it('should publish which specific api was removed from panel api list', () => {
		const explorerPanelApiService = getInstance();
		explorerPanelApiService.addEndpointDetailsToExplorer(mockExplorerEndpointDetails);

		explorerPanelApiService.removeEndpointDetailsFromExplorerPanel(mockExplorerEndpointDetails);
		explorerPanelApiService.removeEndpointDetailsFromExplorerPanel(mockExplorerEndpointDetails);
		explorerPanelApiService.removeEndpointDetails$.subscribe(endpointDetails => {
			expect(endpointDetails).toEqual(mockExplorerEndpointDetails);
		});
	});

	it('should duplicate api from panel api list', async () => {
		const mockProductsExplorerEndpointDetails = {
			endpoint: { path: '/product/{productId}', description: 'Returns all products' },
			api: {
				specificationLocation: 'http://localhost/products/v2/api-docs',
				department: 'Shared',
				displayName: 'Products'
			}
		};
		const explorerPanelApiService = getInstance();
		explorerPanelApiService.addInputParameter('Products', '/product/{productId}', 'P999');
		explorerPanelApiService.addEndpointDetailsToExplorer(mockProductsExplorerEndpointDetails);

		explorerPanelApiService.duplicateEndpointDetailsToExplorer(mockProductsExplorerEndpointDetails);

		explorerPanelApiService.explorerEndpointDetails$.subscribe(endpointDetails => {
			expect(endpointDetails.length).toEqual(2);
		});
	});

	it('should not duplicate api from panel api list if endpoint has no input parameter', async () => {
		const explorerPanelApiService = getInstance();
		explorerPanelApiService.addEndpointDetailsToExplorer(mockExplorerEndpointDetails);
		explorerPanelApiService.duplicateEndpointDetailsToExplorer(mockExplorerEndpointDetails);

		explorerPanelApiService.explorerEndpointDetails$.subscribe(endpointDetails => {
			expect(endpointDetails.length).toEqual(1);
		});
	});

	it('should add filter to data output filters no duplicates', () => {
		const explorerPanelApiService = getInstance();
		explorerPanelApiService.addDataOutputFilter('Trades', mockPath, mockValue);
		explorerPanelApiService.addDataOutputFilter('Trades', mockPath, mockValue);

		explorerPanelApiService.dataOutputFilter$.subscribe(filter => {
			expect(filter).toEqual({ Trades: { '/trades': mockValue } });
		});
	});

	it('should remove filter from data output filters', () => {
		const explorerPanelApiService = getInstance();
		explorerPanelApiService.addDataOutputFilter('Trades', mockPath, mockValue);
		explorerPanelApiService.removeDataOutputFilter('Trades', mockPath);

		explorerPanelApiService.dataOutputFilter$.subscribe(filter => {
			expect(filter).toEqual({ Trades: {} });
		});
	});

	it('should create an object of endpoint to the value', () => {
		const explorerPanelApiService = getInstance();
		explorerPanelApiService.addInputParameter('Products', '/product/{productId}', 'P999');

		explorerPanelApiService.inputParameter$.subscribe(data => {
			expect(data).toEqual({ Products: { '/product/{productId}': 'P999' } });
		});
	});

	it('should create an object of multiple endpoint to the value', () => {
		const explorerPanelApiService = getInstance();
		explorerPanelApiService.addInputParameter('Products', '/product/{productId}', 'P999');
		explorerPanelApiService.addInputParameter('Trades', '/trade/{tradeId}', 'T564');

		explorerPanelApiService.inputParameter$.subscribe(data => {
			expect(data).toEqual({
				Products: { '/product/{productId}': 'P999' },
				Trades: { '/trade/{tradeId}': 'T564' }
			});
		});
	});

	it('should update an object of endpoint to the value', () => {
		const explorerPanelApiService = getInstance();
		explorerPanelApiService.addInputParameter('Products', '/product/{productId}', 'P999');
		explorerPanelApiService.addInputParameter('Products', '/product/{productId}', 'P888');

		explorerPanelApiService.inputParameter$.subscribe(data => {
			expect(data).toEqual({ Products: { '/product/{productId}': 'P888' } });
		});
	});

	it('should remove an input value if it exists', () => {
		const explorerPanelApiService = getInstance();
		explorerPanelApiService.addInputParameter('Products', '/product/{productId}', 'P999');
		explorerPanelApiService.removeInputParameter('Products', '/product/{productId}');

		explorerPanelApiService.inputParameter$.subscribe(data => {
			expect(data).toEqual({ Products: {} });
		});
	});

	it('should do nothing on remove if input value does not exists', () => {
		const explorerPanelApiService = getInstance();
		explorerPanelApiService.removeInputParameter('Products', '/product/{productId}');

		explorerPanelApiService.inputParameter$.subscribe(data => {
			expect(data).toEqual({});
		});
	});

	it('should create duplicate api entry on panel for connectable attribute', async () => {
		const mockProductsExplorerEndpointDetails = {
			endpoint: { path: '/product/{productId}', description: 'Returns all products' },
			api: {
				specificationLocation: 'http://localhost/products/v2/api-docs',
				department: 'Shared',
				displayName: 'Products'
			}
		};
		const explorerPanelApiService = getInstance();
		explorerPanelApiService.addInputParameter('Products', '/product/{productId}', 'P999');

		explorerPanelApiService.duplicateConnectableEndpointDetailsToExplorer(mockProductsExplorerEndpointDetails);
		explorerPanelApiService.duplicateConnectableEndpointDetailsToExplorer(mockProductsExplorerEndpointDetails);

		explorerPanelApiService.explorerEndpointDetails$.subscribe(endpointDetails => {
			expect(endpointDetails.length).toEqual(2);
		});
	});
});
