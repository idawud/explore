import { OpenAPIV2, OpenAPIV3 } from 'openapi-types';
import { Api, ApiSpecDefinitionModel } from './api';

export interface ApiPathDescription {
	path: string;
	description: string;
}

export interface ApiDetailsDescription {
	summary: string;
	description: string;
	apiDescription: string;
}

export interface ExplorerEndpointDetails {
	endpoint?: ApiPathDescription;
	api?: Api;
}

interface InfoObject extends OpenAPIV2.InfoObject {
	connectables?: { name: string; value: string[] }[];
}

export interface OpenAPIV2Document extends OpenAPIV2.Document {
	info: InfoObject;
}

export interface Parameters {
	hasParameter: boolean;
	parameter: OpenAPIV2.ParameterObject[];
}

type paths = OpenAPIV2.PathsObject | OpenAPIV3.PathsObject;

export interface OpenAPIV3Document extends OpenAPIV3.Document {
	info: InfoObject;
	paths: paths;
}

export type OpenAPISpecification = OpenAPIV2Document & OpenAPIV3Document;

export interface ReferenceDefinition {
	getReferenceDefinitionModel(path: string, specDocument: OpenAPISpecification): ApiSpecDefinitionModel;
}
export interface InputParameter {
	[path: string]: string;
}

export type InputParameterMap = { [apiDisplayName: string]: InputParameter };
