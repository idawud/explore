import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ExplorerEndpointDetails, InputParameterMap } from 'src/app/interfaces/apiSpecification';
import { ApiFilters } from 'src/app/interfaces/api';
import { isEqual, cloneDeep } from 'lodash';

interface DuplicateCounter {
	[endpoint: string]: number;
}
@Injectable({
	providedIn: 'root'
})
export class ExplorerPanelApiService {
	private _duplicateCount: DuplicateCounter = {};
	private inputParameterBehaviorSubject = new BehaviorSubject<InputParameterMap>({});
	private explorerEndpointDetailsBehaviourSubject = new BehaviorSubject<ExplorerEndpointDetails[]>([]);
	private removeEndpointDetailsBehaviourSubject = new BehaviorSubject<ExplorerEndpointDetails>({});
	private dataOutputFilterBehaviourSubject = new BehaviorSubject<ApiFilters>({});

	inputParameter$ = this.inputParameterBehaviorSubject.asObservable();
	explorerEndpointDetails$ = this.explorerEndpointDetailsBehaviourSubject.asObservable();
	removeEndpointDetails$ = this.removeEndpointDetailsBehaviourSubject.asObservable();
	dataOutputFilter$ = this.dataOutputFilterBehaviourSubject.asObservable();

	getExplorerEndpointDetails(): ExplorerEndpointDetails[] {
		return this.explorerEndpointDetailsBehaviourSubject.getValue();
	}

	addEndpointDetailsToExplorer(endpointDetails: ExplorerEndpointDetails): void {
		const values = this.explorerEndpointDetailsBehaviourSubject.getValue();
		const existingEndpointDetails = values.find(end => isEqual(endpointDetails, end));
		if (!existingEndpointDetails) {
			values.push(endpointDetails);
			this._duplicateCount[endpointDetails.endpoint.path] = 1;
			this.explorerEndpointDetailsBehaviourSubject.next(values);
		}
	}

	duplicateConnectableEndpointDetailsToExplorer(endpointDetails: ExplorerEndpointDetails): ExplorerEndpointDetails {
		const values = this.explorerEndpointDetailsBehaviourSubject.getValue();
		const duplicate = this.duplicateEndpointDetailsWithInputParameters(endpointDetails);
		if (duplicate) {
			values.push(duplicate);
			this.explorerEndpointDetailsBehaviourSubject.next(values);
			return duplicate;
		} else {
			this.addEndpointDetailsToExplorer(endpointDetails);
			return endpointDetails;
		}
	}

	duplicateEndpointDetailsToExplorer(endpointDetails: ExplorerEndpointDetails): void {
		const values = this.explorerEndpointDetailsBehaviourSubject.getValue();
		const duplicate = this.duplicateEndpointDetailsWithInputParameters(endpointDetails);
		if (duplicate) {
			values.push(duplicate);
			this.explorerEndpointDetailsBehaviourSubject.next(values);
		}
	}

	removeEndpointDetailsFromExplorerPanel(endpointDetails: ExplorerEndpointDetails): void {
		const values = this.explorerEndpointDetailsBehaviourSubject.getValue();
		if (values.includes(endpointDetails)) {
			this.explorerEndpointDetailsBehaviourSubject.next(values.filter(value => value !== endpointDetails));
			this.removeEndpointDetailsBehaviourSubject.next(endpointDetails);
		}
	}

	addDataOutputFilter(apiDisplayName: string, path: string, value: string[]): void {
		const apiFilters = this.dataOutputFilterBehaviourSubject.getValue();
		if (apiFilters[apiDisplayName]) {
			apiFilters[apiDisplayName][path] = value;
		} else {
			apiFilters[apiDisplayName] = { [path]: value };
		}

		this.dataOutputFilterBehaviourSubject.next(apiFilters);
	}

	removeDataOutputFilter(apiDisplayName: string, path: string): void {
		const apiFilters = this.dataOutputFilterBehaviourSubject.getValue();
		delete apiFilters[apiDisplayName][path];
		this.dataOutputFilterBehaviourSubject.next(apiFilters);
	}

	addInputParameter(apiDisplayName: string, path: string, input: string): void {
		const inputParameters = this.inputParameterBehaviorSubject.getValue();

		if (inputParameters[apiDisplayName]) {
			inputParameters[apiDisplayName][path] = input;
		} else {
			inputParameters[apiDisplayName] = { [path]: input };
		}
		this.inputParameterBehaviorSubject.next(inputParameters);
	}

	removeInputParameter(apiDisplayName: string, path: string): void {
		const inputParameters = this.inputParameterBehaviorSubject.getValue();
		delete inputParameters[apiDisplayName]?.[path];
		this.inputParameterBehaviorSubject.next(inputParameters);
	}

	private hasInputParameters(displayName: string, path: string): boolean {
		const inputParameters = this.inputParameterBehaviorSubject.getValue();
		return inputParameters[displayName]?.[path] != null;
	}

	private duplicateEndpointDetailsWithInputParameters(
		endpointDetails: ExplorerEndpointDetails
	): ExplorerEndpointDetails | undefined {
		const values = this.explorerEndpointDetailsBehaviourSubject.getValue();
		const existingEndpointDetails = values.find(end => isEqual(endpointDetails, end));
		if (existingEndpointDetails &&
			this.hasInputParameters(endpointDetails.api.displayName, endpointDetails.endpoint.path)
		) {
			const duplicate: ExplorerEndpointDetails = cloneDeep(endpointDetails);
			const count = this._duplicateCount[duplicate.endpoint.path];
			const displayName = endpointDetails.api.displayName.split('_')[0];
			duplicate.api.displayName = `${displayName}_${count}`;
			this._duplicateCount[duplicate.endpoint.path] += 1;
			return duplicate;
		}
		return;
	}
}
