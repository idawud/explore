import { NewExplorerEditComponent } from './new-explorer-edit.component';
import { ExplorerEndpointDetails } from 'src/app/interfaces/apiSpecification';

describe('NewExplorerEditComponent', () => {
	const mockEndpointDetails: ExplorerEndpointDetails = {
		endpoint: { path: '/trades', description: 'Returns all trades' },
		api: {
			specificationLocation: 'http://localhost/trades/v2/api-docs',
			department: 'PB',
			displayName: 'Trades'
		}
	};

	function getInstance() {
		return new NewExplorerEditComponent();
	}

	it('should create new Explorer edit component', () => {
		const newExplorerEditComponent = getInstance();
		expect(newExplorerEditComponent).toBeDefined();
	});

	it('should return endpoint details', () => {
		const newExplorerEditComponent = getInstance();

		newExplorerEditComponent.explorerEndpointDetails = [ mockEndpointDetails ];
		expect(newExplorerEditComponent.explorerEndpointDetails).toEqual([ mockEndpointDetails ]);
	});

	it('should return endpoint from endpointDetails', () => {
		const newExplorerEditComponent = getInstance();

		const endpoint = newExplorerEditComponent.trackByEndpoint(mockEndpointDetails);
		expect(endpoint).toEqual(mockEndpointDetails.endpoint);
	});
});
