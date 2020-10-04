import { ReferenceDefinitionProcessV3 } from './ReferenceDefinitionProcessV3';
import { OpenAPISpecification } from '../interfaces/apiSpecification';
import { mockedSpecificationDataV3, tradesAPISpecificationDataV3, mockedDataSetSpecificationV3 } from './OpenApiSpecSamplesV3';

describe('ReferenceDefinitionProcessV3', () => {
	function getInstance() {
		return  new ReferenceDefinitionProcessV3();
	}

	it('should create the ReferenceDefinitionProcessV3', () => {
		const referenceDefinitionProcessV3 = getInstance();
		expect(referenceDefinitionProcessV3).toBeDefined();
	});

	function testReferenceModel(specification: OpenAPISpecification, path: string, length: number, description: string){
		const apiSpecService = getInstance();
		const apiSpecDefinitionModel = apiSpecService.getReferenceDefinitionModel(path, specification);

		expect(apiSpecDefinitionModel.description).toEqual(description);
		expect(apiSpecDefinitionModel.values.length).toEqual(length);
	}

	it(`should have a flat model from the document definition with no drillable fields openapi3.0`, () => {
		testReferenceModel(mockedSpecificationDataV3, '/products/{productId}', 8, 'Product data Model description');
	});

	it(`should have a flat model from the document definition with no drillable fields openapi3.0`, () => {
		testReferenceModel(mockedSpecificationDataV3, '/products', 8, 'Product data Model description');
	});

	it(`should have a flat model from the document definition with drillable fields openapi3.0`, () => {
		testReferenceModel(tradesAPISpecificationDataV3, '/trades', 6, 'Trade data Model');
	});

	it(`should have a flat model from the document definition with drillable fields openapi3.0`, () => {
		testReferenceModel(mockedDataSetSpecificationV3, '/', 2, undefined);
	});

	it(`should have a flat model from the document definition with no drillable fields openapi3.0`, () => {
		testReferenceModel(mockedDataSetSpecificationV3, '/pets', 3, undefined);
	});
});
