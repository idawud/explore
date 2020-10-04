import { Injectable } from '@angular/core';
import { OpenAPISpecification, ReferenceDefinition } from '../interfaces/apiSpecification';
import { ReferenceDefinitionProcessV2 } from './ReferenceDefinitionProcessV2';
import { ReferenceDefinitionProcessV3 } from './ReferenceDefinitionProcessV3';

@Injectable({
	providedIn: 'root'
})
export class ReferenceDefinitionModelProvider{

	constructor(private v2: ReferenceDefinitionProcessV2, private v3: ReferenceDefinitionProcessV3){}

	getInstance(specDocument: OpenAPISpecification): ReferenceDefinition {
		return specDocument.openapi ? this.v3 : this.v2;
	}

}
