import { ConnectableService } from './connectable.service';
import { IMocked, Mock, setupFunction } from '@morgan-stanley/ts-mocking-bird';
import { of } from 'rxjs';
import { mockedSpecificationData, tradesAPISpecificationData, mockSpecificationNoGet } from './OpenApiSpecSamples';
import { ApiService } from './api.service';
import { ApiSpecificationService } from './api_specification.service';
import { Api, Connectable } from '../interfaces/api';
import { OpenAPISpecification, ApiPathDescription } from '../interfaces/apiSpecification';
import { tradesAPISpecificationDataV3, mockedSpecificationDataV3 } from './OpenApiSpecSamplesV3';
import { isEqual } from 'lodash';
import {
	productObject,
	tradesObject,
	mockConnectableAttributes,
	mockAccountsEndpointDetails,
	mockProductsEndpointDetails
} from '../components/explorer-api-data/mock-sample-api-data';

describe('ConnectableService', () => {
	let mockApiService: IMocked<ApiService>;
	let mockApiSpecificationService: IMocked<ApiSpecificationService>;

	const mockProductsConnectableAttributes = {
		fieldName: 'productId',
		endpointDetails: mockProductsEndpointDetails,
		displayName: 'Products'
	};

	const mockAccountConnectableAttributes = {
		fieldName: 'accountId',
		endpointDetails: mockAccountsEndpointDetails,
		displayName: 'Accounts'
	};

	function getInstance() {
		const instance = new ConnectableService(mockApiService.mock, mockApiSpecificationService.mock);
		return instance;
	}

	const mockApi: Api[] = [
		{ specificationLocation: 'http://localhost/trades/v2/api-docs', department: 'PB', displayName: 'Trades' },
		{
			specificationLocation: 'http://localhost/positions/v2/api-docs',
			department: 'PB',
			displayName: 'Positions'
		},
		{
			specificationLocation: 'http://localhost/products/v2/api-docs',
			department: 'Shared',
			displayName: 'Products'
		}
	];

	const endpoint: ApiPathDescription = { path: '/products/{productId}', description: 'Returns a product by an Id' };

	beforeEach(() => {
		mockApiService = Mock.create<ApiService>().setup(setupFunction('getApisAsync', () => of(mockApi)));
		mockApiSpecificationService = Mock.create<ApiSpecificationService>().setup(
			setupFunction('getSpecificationAsync', () => of(mockedSpecificationData)),
			setupFunction('getDescriptionOfEndpoint', () => endpoint)
		);
	});

	it('should be created', () => {
		const connectableService = getInstance();
		expect(connectableService).toBeDefined();
	});

	describe('setConnectableFields', () => {
		it('should be set to an empty set of connectable fields', async () => {
			const connectableService = getInstance();
			connectableService.setConnectableFields(
				mockProductsConnectableAttributes.fieldName,
				mockProductsConnectableAttributes.displayName,
				mockProductsConnectableAttributes.endpointDetails
			);

			connectableService.connectableField$.subscribe(data => {
				expect(data).toEqual({
					fieldName: 'productId',
					endpointDetails: mockProductsEndpointDetails,
					displayName: 'Products'
				});
			});
		});

		it('should be set to a non-empty set of connectable fields', async () => {
			const connectableService = getInstance();
			connectableService.setConnectableFields(
				mockProductsConnectableAttributes.fieldName,
				mockProductsConnectableAttributes.displayName,
				mockProductsConnectableAttributes.endpointDetails
			);
			connectableService.setConnectableFields(
				mockAccountConnectableAttributes.fieldName,
				mockAccountConnectableAttributes.displayName,
				mockAccountConnectableAttributes.endpointDetails
			);

			connectableService.connectableField$.subscribe(data => {
				expect(data).toEqual({
					fieldName: 'accountId',
					endpointDetails: mockAccountsEndpointDetails,
					displayName: 'Accounts'
				});
			});
		});

		it('should avoid duplicate connectable fields', async () => {
			const connectableService = getInstance();
			connectableService.setConnectableFields(
				mockProductsConnectableAttributes.fieldName,
				mockProductsConnectableAttributes.displayName,
				mockProductsConnectableAttributes.endpointDetails
			);

			connectableService.setConnectableFields(
				mockProductsConnectableAttributes.fieldName,
				mockProductsConnectableAttributes.displayName,
				mockProductsConnectableAttributes.endpointDetails
			);

			connectableService.connectableField$.subscribe(data => {
				expect(data).toEqual({
					fieldName: 'productId',
					endpointDetails: mockProductsEndpointDetails,
					displayName: 'Products'
				});
			});
		});

		it('should be empty by default', async () => {
			const connectableService = getInstance();

			connectableService.connectableField$.subscribe(data => {
				expect(data).toEqual(null);
			});
		});
	});

	it('should get connectable fields', async () => {
		const connectableService = getInstance();
		connectableService.setConnectableFields(
			mockProductsConnectableAttributes.fieldName,
			mockProductsConnectableAttributes.displayName,
			mockProductsConnectableAttributes.endpointDetails
		);

		expect(connectableService.getConnectables()).toEqual({
			productId: {
				endpointDetails: mockProductsEndpointDetails,
				displayName: 'Products'
			}
		});
	});

	describe('publishAllConnectableEndpointsFromAPI', () => {
		const mockConnectableApi = {
			specificationLocation: 'http://localhost/products/v2/api-docs',
			department: 'Shared',
			displayName: 'Products'
		};

		function testExtractConnectablesOnAPI(version: string, specification: OpenAPISpecification) {
			it(`should extract a connectable field from a api with connectable attr ${version}`, async () => {
				mockApiSpecificationService.setupFunction('getSpecificationAsync', () => of(specification));
				const connectableService = getInstance();
				const expectedFields: Connectable = {
					fieldName: 'productId',
					endpointDetails: mockProductsEndpointDetails,
					displayName: 'Products'
				};

				connectableService.publishAllConnectableEndpointsFromAPI(mockConnectableApi);
				connectableService.connectableField$.subscribe(connectable => {
					expect(connectable).toEqual(expectedFields);
				});
			});
		}

		testExtractConnectablesOnAPI('openapi3.0', mockedSpecificationDataV3);
		testExtractConnectablesOnAPI('swagger2.0', mockedSpecificationData);

		it(`should extract no connectable field from a api if endpoint has no parameter`, async () => {
			mockApiSpecificationService.setupFunction('getSpecificationAsync', () => of(mockedSpecificationData));
			mockApiSpecificationService.setupFunction('getDescriptionOfEndpoint', () => undefined);
			const connectableService = getInstance();

			connectableService.publishAllConnectableEndpointsFromAPI(mockConnectableApi);
			connectableService.connectableField$.subscribe(connectable => {
				expect(connectable).toEqual(null);
			});
		});

		it('should extract no connectable field from a api with no connectable attr', async () => {
			mockApiSpecificationService.setupFunction('getSpecificationAsync', () => of(mockSpecificationNoGet));
			const connectableService = getInstance();

			connectableService.publishAllConnectableEndpointsFromAPI(mockConnectableApi);
			connectableService.connectableField$.subscribe(connectable => {
				expect(connectable).toEqual(null);
			});
		});
	});

	describe('getAllConnectablesFromSpecificationDocument', () => {
		it('should have not connectable field if there is no custom connectables extension', async () => {
			const connectableService = getInstance();
			connectableService.getAllConnectablesFromSpecificationDocument(mockedSpecificationData);

			connectableService.connectableField$.subscribe(connectable => {
				expect(connectable).toEqual(null);
			});
		});

		function testConnectablesOnDocument(
			version: string,
			specification: OpenAPISpecification,
			getSpecificationMock: OpenAPISpecification
		) {
			it(`should extract connectable fields if there is custom connectables extension ${version}`, async () => {
				mockApiSpecificationService.setupFunction('getSpecificationAsync', () => of(getSpecificationMock));
				const connectableService = getInstance();

				const expectedFields: Connectable = {
					fieldName: 'productId',
					endpointDetails: mockProductsEndpointDetails,
					displayName: 'Products'
				};

				connectableService.getAllConnectablesFromSpecificationDocument(specification);
				connectableService.connectableField$.subscribe(connectable => {
					expect(connectable).toEqual(expectedFields);
				});
			});
		}

		testConnectablesOnDocument('openapi3.0', tradesAPISpecificationDataV3, mockedSpecificationDataV3);
		testConnectablesOnDocument('swagger2.0', tradesAPISpecificationData, mockedSpecificationData);
	});
});
