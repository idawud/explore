import { Injectable } from '@angular/core';
import { Api, ApiEndpoints } from 'src/app/interfaces/api';
import { OpenAPISpecification, ApiPathDescription } from 'src/app/interfaces/apiSpecification';
import { BehaviorSubject, Observable } from 'rxjs';
import { isEqual } from 'lodash';
import { ApiSpecificationService } from '../api_specification.service';
import { StatusMonitor } from './status-monitor';
import { monitor } from './monitor-operator';
import { tap } from 'rxjs/operators';

export interface ApiStore {
	category: string;
	apis: ApiEndpoints[];
}

@Injectable({
	providedIn: 'root'
})
export class ApiCallManagementService {
	private apiStoreBehaviourSubject = new BehaviorSubject<ApiStore[]>([]);
	private apiSpecificationDocBehaviourSubject = new BehaviorSubject<OpenAPISpecification>(null);

	constructor(private apiSpecificationService: ApiSpecificationService) {}

	apiStore$ = this.apiStoreBehaviourSubject.asObservable();
	apiSpecificationDoc$ = this.apiSpecificationDocBehaviourSubject.asObservable();

	addApiToStore(category: string, apis: ApiEndpoints[]): void {
		const apiStore = this.apiStoreBehaviourSubject.getValue();
		const apiCategory = apiStore.find(justApi => justApi.category === category);
		if (!apiCategory) {
			const toAdd = {
				category,
				apis
			};
			apiStore.push(toAdd);
			this.apiStoreBehaviourSubject.next(apiStore);
		}
	}

	addEndpointsToStore(category: string, api: Api, endpoints: ApiPathDescription[]): void {
		const apiStore = this.apiStoreBehaviourSubject.getValue();
		const index = apiStore.findIndex(storeApi => storeApi.category === category);
		const apiCategory: ApiStore = apiStore[index];
		const apiToUpdate = apiCategory.apis.find(apiFound => isEqual(apiFound.api, api));
		if (apiToUpdate) {
			apiToUpdate.endpoints = endpoints;
			this.apiStoreBehaviourSubject.next(apiStore);
		}
	}

	isEndpointsSetToStore(category: string, api: Api): boolean {
		const apiStore = this.apiStoreBehaviourSubject.getValue();
		const index = apiStore.findIndex(storeApi => storeApi.category === category);
		const apiCategory: ApiStore = apiStore[index];
		const apiAvailable = apiCategory.apis.find(apiFound => isEqual(apiFound.api, api));
		return apiAvailable && apiAvailable.endpoints.length > 0;
	}

	setEndpointsToStoreByApiUrl(apiUrl: string, apiStores: ApiEndpoints): void {
		const alreadyFetched = this.isEndpointsSetToStore(apiStores.api.department, apiStores.api);
		if (!alreadyFetched) {
			this.apiSpecificationService.getSpecificationAsync(apiUrl).subscribe(data => {
				this.apiSpecificationDocBehaviourSubject.next(data);
				const endpoints = this.apiSpecificationService.getAllAvailablePaths(data.paths);
				this.addEndpointsToStore(apiStores.api.department, apiStores.api, endpoints);
			});
		}
	}

	setEndpointsToStoreByApi(api: Api): Observable<OpenAPISpecification> {
		return this.apiSpecificationService.getSpecificationAsync(api.specificationLocation).pipe(
			tap(data => {
				const endpoints = this.apiSpecificationService.getAllAvailablePaths(data.paths);
				this.addEndpointsToStore(api.department, api, endpoints);
			})
		);
	}
}
