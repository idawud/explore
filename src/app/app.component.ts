import { Component, OnInit, OnDestroy } from '@angular/core';
import { ExplorerPanelApiService } from './services/shared/explorer-panel-api.service';
import { Subscription } from 'rxjs';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: [ './app.component.scss' ]
})
export class AppComponent implements OnInit, OnDestroy {
	private _numberOfApiOnExplorerPanel: number;
	private _subscription: Subscription = new Subscription();
	constructor(private explorerPanelApiService: ExplorerPanelApiService) {}

	ngOnInit() {
		this._subscription.add(
			this.explorerPanelApiService.explorerEndpointDetails$.subscribe(endpointDetails => {
				this._numberOfApiOnExplorerPanel = endpointDetails.length;
			})
		);
	}

	get numberOfApiOnExplorerPanel(): number {
		return this._numberOfApiOnExplorerPanel;
	}

	get subscription(): Subscription {
		return this._subscription;
	}

	ngOnDestroy(): void {
		this._subscription.unsubscribe();
	}
}
