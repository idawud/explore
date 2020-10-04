import { ReferenceDefinition, OpenAPISpecification } from '../interfaces/apiSpecification';
import { ApiSpecDefinitionModel, DefinitionField, DefinitionFieldType } from '../interfaces/api';
import { OpenAPIV2 } from 'openapi-types';
import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class ReferenceDefinitionProcessV2 implements ReferenceDefinition{

	getReferenceDefinitionModel(path: string, specDocument: OpenAPISpecification): ApiSpecDefinitionModel {
		const schema = specDocument.paths[path].get.responses['200'].schema;
		const reference: string = schema.items ? schema.items.$ref  :  schema.$ref;
		const key: string = reference.split('/')[2];
		const definitions: OpenAPIV2.DefinitionsObject = specDocument.definitions;
		return {
			description: definitions[key].description,
			values: this.getDefinitionProperties(key, definitions)
		};
	}

	private getDefinitionProperties(modelName: string, definitionSchema: OpenAPIV2.DefinitionsObject ): DefinitionField[]{
		return Object.entries(definitionSchema[modelName].properties)
				.map(property => {
					const [key, value] = property;
					if ( value.$ref != null){
						const subModelName: string = value.$ref.split('/')[2];
						return this.definitionFieldCreation(key, true, {type: subModelName , description: value.description },
							this.getDefinitionProperties(subModelName, definitionSchema));
					}
					else { // Normal field
						const type: string = this.getString(value.type);
						return this.definitionFieldCreation(key, false, {type , description: value.description });
					}
				}
			);
	}

	private definitionFieldCreation(
		fieldName: string,
		drillable: boolean,
		properties: DefinitionFieldType,
		values?: DefinitionField[]
	): DefinitionField {
		return { fieldName, drillable, properties, values};
	}

	private getString(key: string | string[]): string {
		return typeof key === 'string' ? key : key.toString();
	}

}
