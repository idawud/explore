import { ApiPathDescription, ExplorerEndpointDetails } from './apiSpecification';

export interface Api {
	specificationLocation: string;
	department: string;
	displayName: string;
}

export interface ApiSpecDefinitionModel {
	description: string;
	values: DefinitionField[];
}

export interface DefinitionField {
	fieldName: string;
	drillable: boolean;
	properties?: DefinitionFieldType;
	values?: DefinitionField[];
}

export interface DefinitionFieldType {
	type: string | string[];
	description: string;
}

export interface Connectable {
	fieldName: string;
	displayName: string;
	endpointDetails: ExplorerEndpointDetails;
}

export type ConnectableMap = {
	[fieldName: string]: {
		displayName: string;
		endpointDetails: ExplorerEndpointDetails;
	};
};

export interface ApiEndpoints {
	endpoints?: ApiPathDescription[];
	api: Api;
}

export interface ApiFilters {
	[apiDisplayName: string]: { [path: string]: string[] };
}
