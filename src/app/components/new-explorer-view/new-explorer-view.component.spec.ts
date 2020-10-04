import { NewExplorerViewComponent } from './new-explorer-view.component';
import { ExplorerEndpointDetails } from 'src/app/interfaces/apiSpecification';

describe('NewExplorerViewComponent', () => {
	const mockEndpointDetails: ExplorerEndpointDetails = {
		endpoint: { path: '/trades', description: 'Returns all trades' },
		api: {
			specificationLocation: 'http://localhost/trades/v2/api-docs',
			department: 'PB',
			displayName: 'Trades'
		}
	};

	function getInstance() {
		return new NewExplorerViewComponent();
	}

	it('should create New Explorer view component', () => {
		const newExplorerViewComponent = getInstance();
		expect(newExplorerViewComponent).toBeDefined();
	});

	it('should return endpoint details', () => {
		const newExplorerViewComponent = getInstance();

		newExplorerViewComponent.explorerEndpointDetails = [ mockEndpointDetails ];
		expect(newExplorerViewComponent.explorerEndpointDetails).toEqual([ mockEndpointDetails ]);
	});

	it('should return endpoint from endpointDetails', () => {
		const newExplorerViewComponent = getInstance();

		const endpoint = newExplorerViewComponent.trackByEndpoint(2, mockEndpointDetails);
		expect(endpoint).toEqual(mockEndpointDetails.endpoint);
	});
});
