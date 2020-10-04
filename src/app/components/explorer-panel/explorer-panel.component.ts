import { Component, OnInit, OnDestroy } from '@angular/core';
import { ExplorerPanelApiService } from 'src/app/services/shared/explorer-panel-api.service';
import { Subscription, Subject, merge } from 'rxjs';
import { ExplorerEndpointDetails } from 'src/app/interfaces/apiSpecification';
import { delay, mapTo } from 'rxjs/operators';
import { ExplorerChangesService } from 'src/app/services/explorer-changes.service';

@Component({
	selector: 'app-explorer-panel',
	templateUrl: './explorer-panel.component.html',
	styleUrls: [ './explorer-panel.component.scss' ]
})
export class ExplorerPanelComponent implements OnInit, OnDestroy {
	private _explorerEndpointDetails: ExplorerEndpointDetails[];
	private _explorerEndpointDetailsView: ExplorerEndpointDetails[];
	private subscription: Subscription = new Subscription();
	private _isEndpointDetailsAvailable = false;
	private _showCustomizeScreen = true;
	private _appliedChangesSubject = new Subject<string>();
	private _savedChangesMessage = '';
	private _unsavedChangesMessage = '';

	private _hasChanges = false;
	private _isSaved = true;

	switchScreenSaveAndApply(): void {
		this._showCustomizeScreen = !this._showCustomizeScreen;
		if (!this._showCustomizeScreen) {
			this.explorerChangesService.publishChanges();
			this._appliedChangesSubject.next(`Changes Applied`);
			this._hasChanges = false;
			this._unsavedChangesMessage = '';
			this._isSaved = false;
		}
	}
	switchBackScreen(): void{
		this._showCustomizeScreen = !this._showCustomizeScreen;
		if (!this._showCustomizeScreen) {
			if (this._hasChanges){
				this._isSaved = true;
				this._unsavedChangesMessage = 'You have unsaved changes';
			}
		}
	}
	switchScreen(): void {
		this._isSaved = false;
		this._showCustomizeScreen = !this._showCustomizeScreen;
	}

	closeAlert(): void {
		this._savedChangesMessage = '';
	}

	closeWarningAlert(): void{
		this._unsavedChangesMessage = '';
	}

	constructor(
		private explorerPanelApiService: ExplorerPanelApiService,
		private explorerChangesService: ExplorerChangesService
	) {}

	ngOnInit() {
		this.subscription.add(
			this.explorerPanelApiService.explorerEndpointDetails$.subscribe(explorerPanelEndpoint => {
				this._explorerEndpointDetails = explorerPanelEndpoint;
				this._isEndpointDetailsAvailable = this._explorerEndpointDetails.length !== 0;
				if (explorerPanelEndpoint.length === 0) {
					this._showCustomizeScreen = true;
				}
			})
		);

		this.subscription.add(
			merge(this._appliedChangesSubject, this._appliedChangesSubject.pipe(mapTo(''), delay(3000))).subscribe(
				message => (this._savedChangesMessage = message)
			)
		);

		this.subscription.add(
			this.explorerChangesService.explorerChanges$.subscribe(
				explorerChanges => (this._explorerEndpointDetailsView = explorerChanges.explorerEndpointDetails)
			)
		);

		this.subscription.add(
			this.explorerChangesService.hasChanges$.subscribe(hasChanges => {
				this._hasChanges = hasChanges;
			})
		);
	}

	ngOnDestroy() {
		this.subscription.unsubscribe();
	}

	get explorerEndpointDetails(): ExplorerEndpointDetails[] {
		return this._explorerEndpointDetails;
	}

	get explorerEndpointDetailsView(): ExplorerEndpointDetails[] {
		return this._explorerEndpointDetailsView;
	}

	get isEndpointDetailsAvailable(): boolean {
		return this._isEndpointDetailsAvailable;
	}

	get showCustomizeScreen(): boolean {
		return this._showCustomizeScreen;
	}

	get savedChangesMessage(): string {
		return this._savedChangesMessage;
	}

	get unsavedChangesMessage(): string {
		return this._unsavedChangesMessage;
	}

	get hasChanges(): boolean {
		return this._hasChanges;
	}

	get isSaved(): boolean {
		return this._isSaved;
	}
}
