import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
	selector: 'app-button-cell-renderer',
	templateUrl: './button-cell-renderer.component.html',
	styleUrls: [ './button-cell-renderer.component.scss' ]
})
export class ButtonCellRendererComponent implements ICellRendererAngularComp {
	private params;
	private _label: string;

	agInit(params): void {
		this.params = params;
		this._label = params.value;
	}

	refresh(_params?: any): boolean {
		return true;
	}

	onClick($event) {
		if (this.params.onClick instanceof Function) {
			const params = {
				event: $event,
				field: this.params.colDef.field,
				path: this.params.colDef.path,
				value: this.params.value
			};
			this.params.onClick(params);
		}
	}

	get label(): string {
		return this._label;
	}
}
