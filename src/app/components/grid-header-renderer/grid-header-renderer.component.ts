import { Component } from '@angular/core';
import { IHeaderAngularComp } from 'ag-grid-angular';
import { IHeaderParams } from 'ag-grid-community';

@Component({
	selector: 'app-grid-header-renderer',
	templateUrl: './grid-header-renderer.component.html',
	styleUrls: [ './grid-header-renderer.component.scss' ]
})
export class GridHeaderRendererComponent implements IHeaderAngularComp {
	private _label: string;
	private _show: boolean;

	constructor() {}
	agInit(params: IHeaderParams): void {
		this._label = params.displayName;
		this._show = params.column.getColDef().cellRenderer === 'btnCellRenderer';
	}

	get label(): string {
		return this._label;
	}

	get show(): boolean {
		return this._show;
	}
}
