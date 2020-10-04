import { ExplorerChangesService, ExplorerChanges } from './explorer-changes.service';
import { ExplorerPanelApiService } from './shared/explorer-panel-api.service';
import { IMocked, Mock, setupProperty, setupFunction } from '@morgan-stanley/ts-mocking-bird';
import { of } from 'rxjs';

describe('ExplorerChangesService', () => {
	let mockExplorerPanelApiService: IMocked<ExplorerPanelApiService>;

	function getInstance() {
		return new ExplorerChangesService(mockExplorerPanelApiService.mock);
	}

	const mockExplorerDetails = {
		api: {
			specificationLocation: 'http://localhost/products/v2/api-docs',
			department: 'Shared',
			displayName: 'Products'
		},
		endpoint: { path: '/products/{productId}', description: 'Returns a product by an Id' }
	};

	beforeEach(() => {
		mockExplorerPanelApiService = Mock.create<ExplorerPanelApiService>().setup(
			setupProperty('inputParameter$', of({ Products: { '/products/{productId}': 'P999' } })),
			setupProperty(
				'dataOutputFilter$',
				of({
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
				})
			),
			setupFunction('getExplorerEndpointDetails', () => [ mockExplorerDetails ])
		);
	});

	const expectedExplorerChanges: ExplorerChanges = {
		inputParameters: { Products: { '/products/{productId}': 'P999' } },
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
		explorerEndpointDetails: [ mockExplorerDetails ]
	};

	it('should create ExplorerChangesService', () => {
		const explorerChangesService = getInstance();
		expect(explorerChangesService).toBeDefined();
	});

	it('should published changes to data output', async () => {
		const explorerChangesService = getInstance();
		explorerChangesService.publishChanges();

		explorerChangesService.explorerChanges$.subscribe(explorerChanges => {
			expect(explorerChanges).toEqual(expectedExplorerChanges);
		});
	});

	it('should published connectable directly to data output', async () => {
		const explorerChangesService = getInstance();
		explorerChangesService.publishChanges();
		explorerChangesService.publishConnectable(mockExplorerDetails, 'P999');

		explorerChangesService.explorerChanges$.subscribe(explorerChanges => {
			expect(explorerChanges.explorerEndpointDetails.length).toEqual(2);
		});
	});

	it('should published first connectable directly to data output', async () => {
		mockExplorerPanelApiService.setupProperty('inputParameter$', of({}));
		const explorerChangesService = getInstance();
		explorerChangesService.publishChanges();
		explorerChangesService.publishConnectable(mockExplorerDetails, 'P999');

		explorerChangesService.explorerChanges$.subscribe(explorerChanges => {
			expect(explorerChanges.explorerEndpointDetails.length).toEqual(2);
		});
	});
});
