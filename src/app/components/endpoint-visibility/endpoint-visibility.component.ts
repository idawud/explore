import { Component, OnInit, Input, OnDestroy,  Output, EventEmitter } from '@angular/core';
import { ApiPathDescription, ExplorerEndpointDetails } from 'src/app/interfaces/apiSpecification';
import { Api } from 'src/app/interfaces/api';
import { ExplorerPanelApiService } from 'src/app/services/shared/explorer-panel-api.service';
import { Subscription } from 'rxjs';

@Component({
	selector: 'app-endpoint-visibility',
	templateUrl: './endpoint-visibility.component.html',
	styleUrls: ['./endpoint-visibility.component.scss']
})
export class EndpointVisibilityComponent implements  OnInit, OnDestroy {

	subscription: Subscription = new Subscription();
	explorerEndpointDetails: ExplorerEndpointDetails = {};
	explorerEndpointDetails$: ExplorerEndpointDetails[] = [];
	Ischecked: boolean;

	@Input() endpoint: ApiPathDescription;
	@Input() api: Api;
	@Output() endpointListToAddChangeValue = new EventEmitter();

	constructor(
		private explorerPanelApiService: ExplorerPanelApiService,
	) { }

	ngOnInit(): void {
		this.subscription.add(
			this.explorerPanelApiService.explorerEndpointDetails$.subscribe(explorePanelApis => {
				this.explorerEndpointDetails$ = explorePanelApis;
				if (this.endpoint){
					this.Ischecked =  explorePanelApis.some(explorerPanleApi => explorerPanleApi.endpoint.path === this.endpoint.path)
				}
			})
		);
	}

	ngOnDestroy() {
		this.subscription.unsubscribe();
	}

	addToList(): void {
		this.explorerEndpointDetails.api = this.api;
		this.explorerEndpointDetails.endpoint = this.endpoint;
		this.endpointListToAddChangeValue.emit(this.explorerEndpointDetails);
	}
}
