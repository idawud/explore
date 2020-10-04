import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/internal/operators/catchError';
import { OpenAPIV2 } from 'openapi-types';
import { ApiPathDescription, ApiDetailsDescription, Parameters, OpenAPISpecification } from '../interfaces/apiSpecification';
import { Observable , of} from 'rxjs';
import { handleError } from './shared/handle-errors.service';
import { ApiSpecDefinitionModel } from '../interfaces/api';
import { ReferenceDefinitionModelProvider } from './ReferenceDefinitionModelProvider';
import { tap } from 'rxjs/operators';

interface OpenAPISpecificationStore{
	[URL: string]: OpenAPISpecification;
}

@Injectable({
	providedIn: 'root'
})
export class ApiSpecificationService {
	private cacheStore: OpenAPISpecificationStore = {};

	constructor(private httpClient: HttpClient, private referenceDefinitionModelProvider: ReferenceDefinitionModelProvider) {}

	/**
	 * To get the various specifications of the Apis loaded
	 * @param URL - The Api specifications server URL
	 * @returns Observable<OpenAPISpecification> - All the specification data from the Apis
	 */
	getSpecificationAsync(URL: string): Observable<OpenAPISpecification> {
		const specificationCache = this.cacheStore[URL];
		return !specificationCache ? this.requestSpecificationAsync(URL) : of(specificationCache);
	}

	private requestSpecificationAsync(URL: string): Observable<OpenAPISpecification> {
		return this.httpClient
			.get<OpenAPISpecification>(URL)
			.pipe(
				tap(specificationDoc => this.cacheStore[URL] = specificationDoc)
			);
	}

	/**
	 *  To get the further descriptions of the Apis by delving into the paths
	 * @params pathsDocumentObject - The paths objects of the specification document
	 * @returns ApiSpecification[] - The paths and descriptions of all availables paths in the paths object of the specification
	 */
	getAllAvailablePaths(pathsDocumentObject: OpenAPIV2.PathsObject): ApiPathDescription[] {
		return Object.keys(pathsDocumentObject).map((key: string) => {
			return { path: key, description: pathsDocumentObject[key].get?.summary };
		});
	}

	/**
	 * To get the Model properties to render the description table for an endpoint in a API
	 * @param path - the model path/endpoint in the API to get it's definition model
	 * @param specDocument - the api specification document for the API
	 */
	getReferenceDefinitionModel(path: string, specDocument: OpenAPISpecification): ApiSpecDefinitionModel {
		const specificationInstance = this.referenceDefinitionModelProvider.getInstance(specDocument);
		return specificationInstance.getReferenceDefinitionModel(path, specDocument);
	}


	/**
	 * To get the description and summary properties to render the description for an endpoint in a API
	 * @param path - the path/endpoint in the API to get it's definition description
	 * @param specDocument - the api specification document for the API
	 */
	getApiEndpointDescription(path: string, specDocument: OpenAPISpecification): ApiDetailsDescription {
		const schema = specDocument.paths[path]?.get;
		return { summary: schema?.summary, description: schema?.description, apiDescription: specDocument.info.description };
	}

	/**
	 * Get parameters from endpoint which takes one i.e. /products/{productId}
	 * @param specDocument - the api specification document for the API
	 * @param path - the path/endpoint in the API to get it's parameters
	 */
	getInputParameters(specDocument: OpenAPISpecification, path: string): Parameters {
		const schemaParams = specDocument.paths[path]?.get?.parameters;
		return { hasParameter: schemaParams != null, parameter: schemaParams };
	}

	/**
	 * extract the path and description from an endpoint
	 * to check whether it qualifies as a connectable or not
	 * @param path - the endpoint and its meta data
	 */
	getDescriptionOfEndpoint(path: [string, any]): ApiPathDescription | undefined {
		const [ pathKey, pathValue ] = path;
		const pathParameters = pathValue.get?.parameters;
		if (pathParameters && pathParameters.length === 1) {
			return { path: pathKey, description: pathValue.get.summary};
		}
		return;
	}
}
