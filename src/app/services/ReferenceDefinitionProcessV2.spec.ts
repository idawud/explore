import { ReferenceDefinitionProcessV2 } from './ReferenceDefinitionProcessV2';
import { OpenAPISpecification } from '../interfaces/apiSpecification';
import { mockedSpecificationData, tradesAPISpecificationData } from './OpenApiSpecSamples';

describe('ReferenceDefinitionProcessV2', () => {
	function getInstance() {
		return  new ReferenceDefinitionProcessV2();
	}

	it('should create the ReferenceDefinitionProcessV3', () => {
		const referenceDefinitionProcessV2 = getInstance();
		expect(referenceDefinitionProcessV2).toBeDefined();
	});

	function testReferenceModel(specification: OpenAPISpecification, path: string, length: number, description: string){
		const apiSpecService = getInstance();
		const apiSpecDefinitionModel = apiSpecService.getReferenceDefinitionModel(path, specification);

		expect(apiSpecDefinitionModel.description).toEqual(description);
		expect(apiSpecDefinitionModel.values.length).toEqual(length);
	}

	it(`should have a flat model from the document definition with no drillable fields swagger2.0`, () => {
		testReferenceModel(mockedSpecificationData, '/products/{productId}', 8, 'Product data Model description');
	});

	it(`should have a flat model from the document definition with no drillable fields swagger2.0`, () => {
		testReferenceModel(mockedSpecificationData, '/products', 8, 'Product data Model description');
	});

	it(`should have a flat model from the document definition with drillable fields swagger2.0`, () => {
		testReferenceModel(tradesAPISpecificationData, '/trades', 6, 'Trade data Model');
	});
});
