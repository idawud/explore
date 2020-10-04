import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ConnectableMap, Api, Connectable } from '../interfaces/api';
import { ApiService } from './api.service';
import { ApiSpecificationService } from './api_specification.service';
import { OpenAPISpecification, ExplorerEndpointDetails } from '../interfaces/apiSpecification';

@Injectable({
	providedIn: 'root'
})
export class ConnectableService {
	private connectableMap: ConnectableMap = {};

	private connectableSubject = new BehaviorSubject<Connectable>(null);
	connectableField$ = this.connectableSubject.asObservable();

	constructor(private apiService: ApiService, private specService: ApiSpecificationService) {}

	getConnectables(): ConnectableMap {
		return this.connectableMap;
	}

	/**
	 * add a field property to the list of connectable fields and publishes to subscribers
	 * @param connectableField - a fieldname & the host url to connect to
	 */
	setConnectableFields(fieldName, displayName: string, endpointDetails: ExplorerEndpointDetails): void {
		if (!this.connectableMap[fieldName]) {
			this.connectableMap[fieldName] = { displayName, endpointDetails };
			this.connectableSubject.next({ fieldName, displayName, endpointDetails });
		}
	}

	/**
	 * get all connectable paths and getting the fieldName to connect with from an API [Property Name Strategy]
	 * @param api - api added to the explorer panel
	 */
	publishAllConnectableEndpointsFromAPI(api: Api): void {
		this.specService.getSpecificationAsync(api.specificationLocation).subscribe(spec => {
			Object.entries(spec.paths).forEach(path => {
				const [ pathKey, pathValue ] = path;
				if (pathValue.get?.parameters) {
					const endpoint = this.specService.getDescriptionOfEndpoint([ pathKey, pathValue ]);
					if (endpoint) {
						const fieldName = pathValue.get.parameters[0].name;
						this.setConnectableFields(fieldName, api.displayName, { api, endpoint });
					}
				}
			});
		});
	}

	/**
	 * get all custom annotated connectable fieldNames and the URL to connect to on the host API [Custom OpenAPI Strategy]
	 * @param specDoc - specification document for the loaded api
	 */
	getAllConnectablesFromSpecificationDocument(specDoc: OpenAPISpecification) {
		if (specDoc.info.connectables != null) {
			const connectables = specDoc.info.connectables;
			this.apiService.getApisAsync().subscribe(apis => {
				Object.entries(connectables).map(connectable => {
					const [ connectableKey, connectableValue ] = connectable;
					const connectedAPI = apis.find(api => api.displayName === connectableValue.value[0]);
					this.publishAllConnectableEndpointsFromAPI(connectedAPI);
				});
			});
		}
	}
}
