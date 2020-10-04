import { EndpointListComponent } from './endpoint-list.component';
import { ApiDetailsDescription, ExplorerEndpointDetails } from 'src/app/interfaces/apiSpecification';
import { ApiSpecDefinitionModel, ApiEndpoints } from 'src/app/interfaces/api';
import { IMocked, Mock, setupFunction, setupProperty } from '@morgan-stanley/ts-mocking-bird';
import { ApiSpecificationService } from 'src/app/services/api_specification.service';
import { SharedEndpointDetailsService } from 'src/app/services/shared/shared-endpoint-details.service';
import { tick, fakeAsync } from '@angular/core/testing';
import { of } from 'rxjs';
import { tradesAPISpecificationData } from 'src/app/services/OpenApiSpecSamples';

describe('EndpointListComponent', () => {
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
	const mockEndpointDetails: ExplorerEndpointDetails = {
		endpoint: { path: '/trades', description: 'Returns all trades' },
		api: {
			specificationLocation: 'http://localhost/trades/v2/api-docs',
			department: 'PB',
			displayName: 'Trades'
		}
	};

	const apiStore = {
		api: {
			specificationLocation: 'http://localhost/trades/v2/api-docs',
			department: 'PB',
			displayName: 'Trades'
		}, 
		endpoints: [ { path: '/trades', description: 'Returns all trades' } ]
	};

	let mockApiSpecificationService: IMocked<ApiSpecificationService>;
	let mockEndpointDetailsService: IMocked<SharedEndpointDetailsService>;

	function getInstance() {
		const endPointListComponent = new EndpointListComponent(
			mockApiSpecificationService.mock,
			mockEndpointDetailsService.mock
		);
		return endPointListComponent;
	}

	beforeEach(() => {
		mockApiSpecificationService = Mock.create<ApiSpecificationService>().setup(
			setupFunction('getSpecificationAsync', () => of(tradesAPISpecificationData)),
			setupFunction('getReferenceDefinitionModel', () => mockSchemaTableData),
			setupFunction('getApiEndpointDescription', () => mockEndPointsDescriptionData)
		);
		mockEndpointDetailsService = Mock.create<SharedEndpointDetailsService>().setup(
			setupProperty('endpointSchemaDetailsTable', of(mockSchemaTableData)),
			setupProperty('endpointDescription', of(mockEndPointsDescriptionData))
		);
	});

	it('should create endpoint list component', () => {
		const endPointListComponent = getInstance();
		expect(endPointListComponent).toBeTruthy();
	});

	it('should set schema table', fakeAsync((): void => {
		const endPointListComponent = getInstance();

		mockEndpointDetailsService.setupFunction('setEndPointsDetails').withParametersEqualTo(mockSchemaTableData);
		mockEndpointDetailsService
			.setupFunction('setEndPointDescription')
			.withParametersEqualTo(mockEndPointsDescriptionData);
		mockEndpointDetailsService.setupFunction('publishEndpointDetails').withParametersEqualTo(mockEndpointDetails);
		endPointListComponent.apiStore = apiStore;
		endPointListComponent.publishApiDetails({ path: '/trades', description: 'Returns all trades' });
		tick(200);

		mockEndpointDetailsService.mock.endpointSchemaDetailsTable.subscribe(data => {
			expect(data).toEqual(mockSchemaTableData);
		});
	}) as any);

	it(
		'should confirm set endpoint description was called with the right parameter',
		fakeAsync((): void => {
			const endPointListComponent = getInstance();

			mockEndpointDetailsService.setupFunction('setEndPointsDetails').withParametersEqualTo(mockSchemaTableData);
			mockEndpointDetailsService
				.setupFunction('setEndPointDescription')
				.withParametersEqualTo(mockEndPointsDescriptionData);
			mockEndpointDetailsService
				.setupFunction('publishEndpointDetails')
				.withParametersEqualTo(mockEndpointDetails);
			endPointListComponent.apiStore = apiStore;
			endPointListComponent.publishApiDetails({ path: '/trades', description: 'Returns all trades' });
			tick(200);

			expect(
				mockEndpointDetailsService
					.withFunction('setEndPointDescription')
					.withParameters(mockEndPointsDescriptionData)
			).wasCalledOnce();
		})
	);

	it(
		'should check publishApi was called with the right parameter',
		fakeAsync((): void => {
			const endPointListComponent = getInstance();
			mockEndpointDetailsService.setupProperty('explorerEndpointDetails$', of(mockEndpointDetails));

			mockEndpointDetailsService.setupFunction('setEndPointsDetails').withParametersEqualTo(mockSchemaTableData);
			mockEndpointDetailsService
				.setupFunction('setEndPointDescription')
				.withParametersEqualTo(mockEndPointsDescriptionData);

			mockEndpointDetailsService
				.setupFunction('publishEndpointDetails')
				.withParametersEqualTo(mockEndpointDetails);
			endPointListComponent.apiStore = apiStore;
			endPointListComponent.publishApiDetails({ path: '/trades', description: 'Returns all trades' });
			tick(200);

			expect(mockEndpointDetailsService.withFunction('publishEndpointDetails')).wasCalledOnce();
		})
	);
});
