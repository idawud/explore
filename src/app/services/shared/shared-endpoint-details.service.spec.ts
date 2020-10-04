import { SharedEndpointDetailsService } from './shared-endpoint-details.service';
import { ApiSpecDefinitionModel, Api } from 'src/app/interfaces/api';
import { ApiDetailsDescription } from 'src/app/interfaces/apiSpecification';

describe('SharedEndpointDetailsService', () => {
	const mockSchemaTableData: ApiSpecDefinitionModel = {
		description: 'table description',
		values: [
			{ fieldName: 'ask', drillable: false, properties: { type: 'number', description: 'ask description' } }
		]
	};
	const mockEndPointsDescriptionData: ApiDetailsDescription = {
		summary: 'Returns all trades ',
		description: 'Multiple trades object values, separated by comma',
		apiDescription: 'trades api description'
	};
	const mockEndpointDetails = {
		endpoint: { path: '/trades', description: 'Returns all trades' },
		api: {
			specificationLocation: 'http://localhost/trades/v2/api-docs',
			department: 'PB',
			displayName: 'Trades'
		}
	};

	function getInstance() {
		const service = new SharedEndpointDetailsService();
		return service;
	}

	it('should be created', () => {
		const service = getInstance();
		expect(service).toBeTruthy();
	});

	it('should set schema table', (): void => {
		const service = getInstance();
		service.setEndPointsDetails(mockSchemaTableData);
		service.endpointSchemaDetailsTable.subscribe(data => {
			expect(data).toEqual(mockSchemaTableData);
		});
	});

	it('should set endpoint description', (): void => {
		const service = getInstance();
		service.setEndPointDescription(mockEndPointsDescriptionData);

		service.endpointDescription.subscribe(data => {
			expect(data).toEqual(mockEndPointsDescriptionData);
		});
	});

	it('should publish endpointDetails', (): void => {
		const service = getInstance();
		service.publishEndpointDetails(mockEndpointDetails);

		service.explorerEndpointDetails$.subscribe(endpointDetails => {
			expect(endpointDetails).toEqual(mockEndpointDetails);
		});
	});
});
