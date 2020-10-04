import { ApiSpecificationService } from './api_specification.service';
import { HttpClient } from '@angular/common/http';
import { IMocked, Mock, setupFunction } from '@morgan-stanley/ts-mocking-bird';
import { of, throwError } from 'rxjs';
import { ApiPathDescription, OpenAPISpecification } from '../interfaces/apiSpecification';
import { mockedSpecificationData, mockSpecificationNoGet } from './OpenApiSpecSamples';
import { mockedSpecificationDataV3 } from './OpenApiSpecSamplesV3';
import { ReferenceDefinitionModelProvider } from './ReferenceDefinitionModelProvider';
import { ReferenceDefinitionProcessV3 } from './ReferenceDefinitionProcessV3';

describe('ApiSpecificationService', () => {
	let mockHttp: IMocked<HttpClient>;
	let mockReferenceDefinitionModelProvider: IMocked<ReferenceDefinitionModelProvider>;
	const URL = 'http://localhost/products/v2/api-docs';

	const productIdPathValue = {
		get: {
			tags: [ 'product-controller' ],
			summary: 'Returns a product by an Id',
			description: 'single products object value with matching id',
			operationId: 'getProductUsingGET',
			produces: [ 'application/json' ],
			parameters: [
				{ name: 'productId', in: 'path', description: 'productId', required: true, schema: undefined }
			],
			responses: {
				200: { description: 'OK', schema: { $ref: '#/definitions/Product' } },
				401: { description: 'Unauthorized' },
				403: { description: 'Forbidden' },
				404: { description: 'Not Found' }
			},
			deprecated: false
		}
	};

	beforeEach(() => {
		mockHttp = Mock.create<HttpClient>().setup(setupFunction('get', () => of(mockedSpecificationData) as any));
		mockReferenceDefinitionModelProvider = Mock.create<ReferenceDefinitionModelProvider>().setup(
			setupFunction('getInstance', () => new ReferenceDefinitionProcessV3())
		);
	});

	function getInstance() {
		return new ApiSpecificationService(mockHttp.mock, mockReferenceDefinitionModelProvider.mock);
	}

	it('should create the ApiSpecificationService', () => {
		const apiSpecificationService = getInstance();
		expect(apiSpecificationService).toBeTruthy();
	});

	it('should call get apis once', () => {
		const apiSpecificationService = getInstance();
		apiSpecificationService.getSpecificationAsync(URL);

		expect(mockHttp.withFunction('get')).wasCalledOnce();
	});

	it('should call get apis once by taking subsequent calls from cache', async () => {
		const apiSpecificationService = getInstance();
		apiSpecificationService.getSpecificationAsync(URL).subscribe(() => {
			apiSpecificationService.getSpecificationAsync(URL).subscribe(() => {
				expect(mockHttp.withFunction('get')).wasCalledOnce();
			});
		});
	});

	it('should  return null if there is an error', () => {
		mockHttp.setupFunction('get', (err: any) => throwError(err)); // Mock trigger error
		const apiSpecificationService = getInstance();
		apiSpecificationService.getSpecificationAsync(URL).subscribe(data => {
			expect(data).toEqual(null);
		});
	});

	it(`should get model from specification document`, () => {
		const apiSpecificationService = getInstance();
		const referenceModel = apiSpecificationService.getReferenceDefinitionModel(
			'/products/{productId}',
			mockedSpecificationDataV3
		);

		expect(referenceModel.description).toEqual('Product data Model description');
		expect(referenceModel.values.length).toEqual(8);
	});

	function testAvailablePaths(specification: OpenAPISpecification) {
		mockHttp.setupFunction('get', () => of(specification) as any);
		const apiSpecificationService = getInstance();
		apiSpecificationService.getSpecificationAsync(URL).subscribe(data => {
			expect(Object.keys(data)).toEqual(Object.keys(specification));
		});
	}

	it(`should have keys in specification, specVersion swagger2.0`, async () => {
		testAvailablePaths(mockedSpecificationData);
	});

	it(`should have keys in specification, specVersion openapi3.0`, async () => {
		testAvailablePaths(mockedSpecificationDataV3);
	});

	function testAvailablePathsLength(specification: OpenAPISpecification, length: number) {
		const apiSpecificationService = getInstance();
		const data: ApiPathDescription[] = apiSpecificationService.getAllAvailablePaths(specification.paths);
		expect(data.length).toEqual(length);
	}

	it(`should have two paths swagger2.0`, () => {
		testAvailablePathsLength(mockedSpecificationData, 2);
	});

	it(`should have one path swagger2.0`, () => {
		testAvailablePathsLength(mockSpecificationNoGet, 1);
	});

	it(`should have two paths openapi3.0`, () => {
		testAvailablePathsLength(mockedSpecificationDataV3, 2);
	});

	function testAvailablePathsDescriptions(
		specification: OpenAPISpecification,
		pathDescription: ApiPathDescription[]
	) {
		const apiSpecificationService = getInstance();
		const paths: ApiPathDescription[] = apiSpecificationService.getAllAvailablePaths(specification.paths);
		expect(paths).toEqual(pathDescription);
	}
	const mockApiPathDescription: ApiPathDescription[] = [
		{ path: '/products', description: 'Returns all products ' },
		{ path: '/products/{productId}', description: 'Returns a product by an Id' }
	];

	it(`should have the paths /products & /products/{productId} swagger2.0`, () => {
		testAvailablePathsDescriptions(mockedSpecificationData, mockApiPathDescription);
	});

	it(`should have the paths /products & /products/{productId} openapi3.0`, () => {
		testAvailablePathsDescriptions(mockedSpecificationDataV3, mockApiPathDescription);
	});

	function testEndpointSummaryDescription(
		specification: OpenAPISpecification,
		path: string,
		summary: string,
		description: string
	) {
		const apiSpecificationService = getInstance();
		const apiSpecDefinitionModel = apiSpecificationService.getApiEndpointDescription(path, specification);

		expect(apiSpecDefinitionModel.summary).toBe(summary);
		expect(apiSpecDefinitionModel.description).toBe(description);
	}

	it('should return summary and description for an endpoint in a API swagger2.0', () => {
		testEndpointSummaryDescription(
			mockedSpecificationData,
			'/products/{productId}',
			'Returns a product by an Id',
			'single products object value with matching id'
		);
	});

	it('should return summary and description for an endpoint in a API openapi3.0', () => {
		testEndpointSummaryDescription(
			mockedSpecificationDataV3,
			'/products/{productId}',
			'Returns a product by an Id',
			'single products object value with matching id'
		);
	});

	it('should return summary and description for an unavailable endpoint in swagger2.0', () => {
		testEndpointSummaryDescription(mockedSpecificationData, '/nopath', undefined, undefined);
	});

	it('should return summary and description for an unavailable endpoint in openapi3.0', () => {
		testEndpointSummaryDescription(mockedSpecificationDataV3, '/nopath', undefined, undefined);
	});

	function testInputParametersWithParameters(specification: OpenAPISpecification, path: string, assertion: boolean) {
		const apiSpecificationService = getInstance();
		const result = apiSpecificationService.getInputParameters(specification, path);

		expect(result.hasParameter).toEqual(assertion);
	}

	it(`should get parameters from endpoint with parameters swagger2.0`, () => {
		testInputParametersWithParameters(mockedSpecificationData, '/products/{productId}', true);
	});

	it(`should get parameters from endpoint with parameters openapi3.0`, () => {
		testInputParametersWithParameters(mockedSpecificationDataV3, '/products/{productId}', true);
	});

	it(`should get parameters from unavailable endpoint swagger2.0`, () => {
		testInputParametersWithParameters(mockedSpecificationData, '/nopath', false);
	});

	it(`should get parameters from unavailable endpoint openapi3.0`, () => {
		testInputParametersWithParameters(mockedSpecificationDataV3, '/nopath', false);
	});

	it('should return the path and description of an endpoint', () => {
		const apiSpecificationService = getInstance();
		const pathDescription = apiSpecificationService.getDescriptionOfEndpoint([ '/products/{productId}', '' ]);

		expect(pathDescription).toEqual(undefined);
	});

	it('should return the path and description of an endpoint', () => {
		const apiSpecificationService = getInstance();
		const expectedPathDescription: ApiPathDescription = {
			path: '/products/{productId}',
			description: 'Returns a product by an Id'
		};

		const pathDescription = apiSpecificationService.getDescriptionOfEndpoint([
			'/products/{productId}',
			productIdPathValue
		]);

		expect(pathDescription).toEqual(expectedPathDescription);
	});
});
