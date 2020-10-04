import { Injectable } from '@angular/core';
import { ExplorerPanelApiService } from './shared/explorer-panel-api.service';
import { InputParameterMap, ExplorerEndpointDetails } from '../interfaces/apiSpecification';
import { ApiFilters } from '../interfaces/api';
import { BehaviorSubject } from 'rxjs';
import { cloneDeep } from 'lodash';

export interface ExplorerChanges {
	inputParameters?: InputParameterMap;
	dataOutputFilter?: ApiFilters;
	explorerEndpointDetails: ExplorerEndpointDetails[];
}

@Injectable({
	providedIn: 'root'
})
export class ExplorerChangesService {
	private _explorerChanges: ExplorerChanges = { explorerEndpointDetails: [] };
	private explorerChangesBehaviorSubject = new BehaviorSubject<ExplorerChanges>({ explorerEndpointDetails: [] });
	explorerChanges$ = this.explorerChangesBehaviorSubject.asObservable();
	private _currentState: ExplorerChanges;

	private hasChangesBehaviorSubject = new BehaviorSubject<boolean>(false);
	hasChanges$ = this.hasChangesBehaviorSubject.asObservable();

	private publishChangeStatusUpdate(hasChange: boolean) {
		this.hasChangesBehaviorSubject.next(hasChange);
	}

	constructor(private explorerPanelApiService: ExplorerPanelApiService) {
		this.explorerPanelApiService.inputParameter$.subscribe(inputParameters => {
			this._explorerChanges.inputParameters = inputParameters;
			this.publishChangeStatusUpdate(true);
		});

		this.explorerPanelApiService.dataOutputFilter$.subscribe(dataOutputFilter => {
			this._explorerChanges.dataOutputFilter = dataOutputFilter;
			this.publishChangeStatusUpdate(true);
		});
	}

	publishChanges(): void {
		this._explorerChanges.explorerEndpointDetails = this.explorerPanelApiService.getExplorerEndpointDetails();
		this._currentState = cloneDeep(this._explorerChanges);
		this.explorerChangesBehaviorSubject.next(this._currentState);
		this.publishChangeStatusUpdate(true);
	}

	publishConnectable(endpointDetails: ExplorerEndpointDetails, input: string): void {
		this._currentState.explorerEndpointDetails.push(endpointDetails);

		if (this._currentState.inputParameters[endpointDetails.api.displayName]) {
			this._currentState.inputParameters[endpointDetails.api.displayName][endpointDetails.endpoint.path] = input;
		} else {
			this._currentState.inputParameters[endpointDetails.api.displayName] = {
				[endpointDetails.endpoint.path]: input
			};
		}
		this._currentState.dataOutputFilter[endpointDetails.api.displayName] = this._explorerChanges.dataOutputFilter[
			endpointDetails.api.displayName
		];

		this.explorerChangesBehaviorSubject.next(this._currentState);
	}
}
