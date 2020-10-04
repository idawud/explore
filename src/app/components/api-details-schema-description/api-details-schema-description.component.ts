import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedEndpointDetailsService } from 'src/app/services/shared/shared-endpoint-details.service';
import { Subscription } from 'rxjs';
import { ApiDetailsDescription, ExplorerEndpointDetails } from 'src/app/interfaces/apiSpecification';
import { ExplorerPanelApiService } from 'src/app/services/shared/explorer-panel-api.service';
import { ConnectableService } from 'src/app/services/connectable.service';
import { isEqual } from 'lodash';

@Component({
	selector: 'app-api-details-schema-description',
	templateUrl: './api-details-schema-description.component.html',
	styleUrls: [ './api-details-schema-description.component.scss' ]
})
export class ApiDetailsSchemaDescriptionComponent implements OnInit, OnDestroy {
	endpointDescription: ApiDetailsDescription;
	private _explorerEndpointDetails: ExplorerEndpointDetails;
	private subscription: Subscription = new Subscription();
	private _isAvailableToAddToExplorer = true;

	constructor(
		private sharedEndpointDetailsService: SharedEndpointDetailsService,
		private explorerPanelApiService: ExplorerPanelApiService,
		private connectableService: ConnectableService
	) {}

	ngOnInit(): void {
		this.subscription.add(
			this.sharedEndpointDetailsService.endpointDescription.subscribe(endpointDescription => {
				this.endpointDescription = endpointDescription;
			})
		);

		this.subscription.add(
			this.sharedEndpointDetailsService.explorerEndpointDetails$.subscribe(endpointDetails => {
				this._explorerEndpointDetails = endpointDetails;
				this._isAvailableToAddToExplorer = this.isApiAvailableInExplorer();
			})
		);

		this.subscription.add(
			this.explorerPanelApiService.explorerEndpointDetails$.subscribe(() => {
				this._isAvailableToAddToExplorer = this.isApiAvailableInExplorer();
			})
		);
	}

	ngOnDestroy(): void {
		this.subscription.unsubscribe();
	}

	get explorerEndpointDetails(): ExplorerEndpointDetails {
		return this._explorerEndpointDetails;
	}

	get isAvailableToAddToExplorer(): boolean {
		return this._isAvailableToAddToExplorer;
	}

	addEndpointToExplorer(): void {
		this.explorerPanelApiService.addEndpointDetailsToExplorer(this._explorerEndpointDetails);
		this.connectableService.publishAllConnectableEndpointsFromAPI(this._explorerEndpointDetails.api);
	}

	private isApiAvailableInExplorer(): boolean {
		return (
			this.explorerPanelApiService
				.getExplorerEndpointDetails()
				.find(explorerEndpointDetail => isEqual(explorerEndpointDetail, this._explorerEndpointDetails)) == null
		);
	}
}
