import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Api, ApiEndpoints } from 'src/app/interfaces/api';
import { Subscription, fromEvent } from 'rxjs';
import { ApiPathDescription, ExplorerEndpointDetails, OpenAPISpecification } from 'src/app/interfaces/apiSpecification';
import { ExplorerPanelApiService } from 'src/app/services/shared/explorer-panel-api.service';
import { map, distinctUntilChanged, debounceTime } from 'rxjs/operators';
import { ApiCallManagementService } from 'src/app/services/shared/api-call-management.service';
import { StatusMonitor } from 'src/app/services/shared/status-monitor';
import { ModalEndpointListComponent } from '../modal-endpoint-list/modal-endpoint-list.component';
import { ConnectableService } from 'src/app/services/connectable.service';

@Component({
	selector: 'app-new-api',
	templateUrl: './new-api.component.html',
	styleUrls: ['./new-api.component.scss']
})
export class NewApiComponent implements OnInit, OnDestroy {
	@ViewChild('apiSearchInput', { static: true })
	apiSearchInput: ElementRef;
	@ViewChild('modalEndpointList') modalEndpointListComponent: ModalEndpointListComponent;
	apiSpecificationDoc: OpenAPISpecification;

	availableApis: ApiEndpoints[] = [];
	subscription: Subscription = new Subscription();
	explorePanelApis: ExplorerEndpointDetails[] = [];
	filteredApis: ApiEndpoints[] = [];
	statusMonitor: StatusMonitor;
	endpointListToAdd: ExplorerEndpointDetails[] = [];
	paths: string[] = [];

	constructor(
		private explorerPanelApiService: ExplorerPanelApiService,
		private apiCallManagementService: ApiCallManagementService,
		private connectableService: ConnectableService
	) {}

	ngOnInit(): void {
		this.subscription.add(
			this.apiCallManagementService.apiStore$.pipe(map(api => api.map(apil => apil.apis))).subscribe(data => {
				const result = [].concat(...data);
				this.availableApis = result;
				this.filteredApis = this.filterApi(this.apiSearchInput.nativeElement.value);
			})
		);
		this.subscription.add(
			this.explorerPanelApiService.explorerEndpointDetails$.subscribe(apiEndpoint => {
				this.explorePanelApis = apiEndpoint;
			})
		);

		this.subscription.add(
			this.explorerPanelApiService.removeEndpointDetails$.subscribe(apiEndpoint => {
				this.removeApiFromList(apiEndpoint);
			})
		);

		this.subscribeToApiSearchInputChanges();
	}
	ngOnDestroy() {
		this.subscription.unsubscribe();
	}

	private subscribeToApiSearchInputChanges(): void {
		this.subscription.add(
			fromEvent(this.apiSearchInput.nativeElement, 'keyup')
				.pipe(map((event: any) => event.target.value), debounceTime(150), distinctUntilChanged())
				.subscribe(inputValue => {
					this.filteredApis = this.filterApi(inputValue);
				})
		);
	}

	get isFilterApisAvailable(): boolean {
		return this.filteredApis.length !== 0;
	}

	filterApi(apiSearchInput: string): ApiEndpoints[] {
		return apiSearchInput.length === 0
			? this.availableApis
			: this.availableApis.filter(
					availableApi => availableApi.api.displayName.search(new RegExp(apiSearchInput, 'i')) > -1
				);
	}

	addToList(api: Api, endpoint: ApiPathDescription, path: string): void {
		const explorerEndpointDetails: ExplorerEndpointDetails = { api, endpoint };

		if (this.paths.includes(path)) {
			this.endpointListToAdd = this.endpointListToAdd.filter(endpointList => endpointList.endpoint.path !== path);
			this.paths = this.paths.filter(paths => paths !== path);
		} else {
			this.endpointListToAdd.push(explorerEndpointDetails);
			this.paths.push(path);
		}
	}

	endpointListToAddChangeValue(event): void {
		this.addToList(event.api, event.endpoint, event.endpoint.path);
	}

	removeApiFromList(apiEndpoint: ExplorerEndpointDetails): void {
		this.endpointListToAdd = this.endpointListToAdd.filter(
			endpointList => endpointList.endpoint.path !== apiEndpoint.endpoint.path
		);
		this.paths = this.paths.filter(paths => paths !== apiEndpoint.endpoint.path);
	}

	publishApisToExplorer(): void {
		this.endpointListToAdd.forEach(explorerEndpointDetails => {
			this.explorerPanelApiService.addEndpointDetailsToExplorer(explorerEndpointDetails);
			this.connectableService.publishAllConnectableEndpointsFromAPI(explorerEndpointDetails.api);
		});
	}
}
