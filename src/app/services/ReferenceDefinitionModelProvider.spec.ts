import { ReferenceDefinitionProcessV2 } from './ReferenceDefinitionProcessV2';
import { IMocked, Mock } from '@morgan-stanley/ts-mocking-bird';
import { ReferenceDefinitionProcessV3 } from './ReferenceDefinitionProcessV3';
import { ReferenceDefinitionModelProvider } from './ReferenceDefinitionModelProvider';
import { tradesAPISpecificationData } from './OpenApiSpecSamples';
import { tradesAPISpecificationDataV3 } from './OpenApiSpecSamplesV3';
import { ReferenceDefinition } from '../interfaces/apiSpecification';

describe('ReferenceDefinitionModelProvider', () => {
	let mockReferenceDefinitionProcessV2: IMocked<ReferenceDefinitionProcessV2>;
	let mockReferenceDefinitionProcessV3: IMocked<ReferenceDefinitionProcessV3>;

	beforeEach(() => {
		mockReferenceDefinitionProcessV2 = Mock.create<ReferenceDefinitionProcessV2>();
		mockReferenceDefinitionProcessV3 = Mock.create<ReferenceDefinitionProcessV3>();
	});

	function getInstance() {
		return  new ReferenceDefinitionModelProvider(mockReferenceDefinitionProcessV2.mock, mockReferenceDefinitionProcessV3.mock);
	}

	it('should create the ReferenceDefinitionModelProvider', () => {
		const referenceDefinitionModelProvider = getInstance();
		expect(referenceDefinitionModelProvider).toBeDefined();
	});

	it('should get instance of swagger2.0', () => {
		const referenceDefinitionModelProvider = getInstance();
		const instance: ReferenceDefinition = referenceDefinitionModelProvider.getInstance(tradesAPISpecificationData);

		expect(instance).toBeInstanceOf(Object);
	});

	it('should get instance of openapi3.0', () => {
		const referenceDefinitionModelProvider = getInstance();
		const instance: ReferenceDefinition = referenceDefinitionModelProvider.getInstance(tradesAPISpecificationDataV3);

		expect(instance).toBeInstanceOf(Object);
	});

});
