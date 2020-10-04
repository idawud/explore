import { ReferenceDefinition, OpenAPISpecification } from '../interfaces/apiSpecification';
import { ApiSpecDefinitionModel, DefinitionFieldType, DefinitionField } from '../interfaces/api';
import { OpenAPIV3 } from 'openapi-types';
import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class ReferenceDefinitionProcessV3 implements ReferenceDefinition{

	getReferenceDefinitionModel(path: string, specDocument: OpenAPISpecification): ApiSpecDefinitionModel {
		const openapi3Content: OpenAPIV3.MediaTypeObject = specDocument.paths[path].get.responses[200].content;
		const contentEncoding: string = Object.keys(openapi3Content)[0];

		const schema = openapi3Content[contentEncoding].schema;
		const reference: string = schema.items ? schema.items.$ref  :  schema.$ref;
		const key: string = reference.split('/')[3];

		const components: OpenAPIV3.ComponentsObject = specDocument.components;
		const schemaModel: any = components.schemas[key];
		return {
			description: schemaModel.description,
			values: this.getDefinitionProperties(key, components )
		};
	}

	private getDefinitionProperties(modelName: string, components: any): DefinitionField[]{
		if (components.schemas[modelName].items){
			modelName = components.schemas[modelName].items.$ref.split('/')[3];
		}
		const properties: object = components.schemas[modelName].properties;
		return Object.entries(properties)
				.map(property => {
					const [key, value] = property;
					if ( value.$ref ){ // drillable field
						const subModelName: string = value.$ref.split('/')[3];
						return this.definitionFieldCreation(key, true, {type: subModelName , 
							description: components.schemas[subModelName].description },
							this.getDefinitionProperties(subModelName, components));
					}
					else if ( value.items?.properties){ // drillable field
						const propertiesOfProperty: object = value.items.properties;
						const values = Object.entries(propertiesOfProperty).map( subProperty => {
							const [subKey, subValue] = subProperty;
							return this.definitionFieldCreation(subKey, false, {type: subValue.type , description: value.description });
						});
						return this.definitionFieldCreation(key, true, { type: value.type, description: value.description}, values);
					}
					else { // Normal field
						const type: string = value.type;
						return this.definitionFieldCreation(key, false, {type , description: value.description });
					}
				}
			);
	}

	private definitionFieldCreation(
		fieldName: string,
		drillable: boolean,
		properties: DefinitionFieldType,
		values?: DefinitionField[])
	: DefinitionField {
		return { fieldName, drillable, properties, values};
	}

}
