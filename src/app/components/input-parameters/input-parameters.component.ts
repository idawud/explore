import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { OpenAPIV2 } from 'openapi-types';
import { ExplorerPanelApiService } from 'src/app/services/shared/explorer-panel-api.service';
import { Subscription } from 'rxjs';

@Component({
	selector: 'app-input-parameters',
	templateUrl: './input-parameters.component.html',
	styleUrls: [ './input-parameters.component.scss' ]
})
export class InputParametersComponent implements OnInit, OnDestroy {
	@Input() parameter: OpenAPIV2.ParameterObject;
	@Input() path: string;
	@Input() displayName: string;
	private _value = '';
	private _isValid = true;
	private _publishedValue = '';
	private subscription: Subscription = new Subscription();

	constructor(private explorerPanelApiService: ExplorerPanelApiService) {}

	ngOnInit(): void {
		this.subscription.add(
			this.explorerPanelApiService.inputParameter$.subscribe(inputParameters => {
				this._publishedValue  = inputParameters[this.displayName]?.[this.path];
			})
		);
	}

	ngOnDestroy(): void {
		this.subscription.unsubscribe();
	}

	onKey(value: any) {
		this._value = value;
		this._isValid = this.validateType();
		if (this.isValid) {
			this.explorerPanelApiService.addInputParameter(this.displayName, this.path, this.value);
		}
	}

	private validateType(): boolean {
		return this.parameter.type === 'integer' || this.parameter.type === 'number'
			? !isNaN(Number(this.value))
			: true;
	}

	get isValid(): boolean {
		return this._isValid;
	}

	get value(): string {
		return this._value;
	}

	get publishedValue(): string {
		return this._publishedValue;
	}
}
