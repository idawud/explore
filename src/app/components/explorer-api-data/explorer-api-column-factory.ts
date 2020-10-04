import { Injectable } from '@angular/core';
import { ConnectableService } from 'src/app/services/connectable.service';
import { ColDef } from 'ag-grid-community';
import { ExplorerPanelApiService } from 'src/app/services/shared/explorer-panel-api.service';
import { ExplorerChangesService } from 'src/app/services/explorer-changes.service';

export interface CustomColDef extends ColDef {
	path?: string;
}
@Injectable({
	providedIn: 'root'
})
export class ExplorerApiColumnFactory {
	constructor(
		private connectableService: ConnectableService,
		private explorerPanelApiService: ExplorerPanelApiService,
		private explorerChangesService: ExplorerChangesService
	) {}

	createColumnDefs(columns: string[], path: string, isConnectable: boolean): CustomColDef[] {
		return columns.map(column => this.createColumnDef(column, path, isConnectable));
	}

	createColumnDef(columnName: string, path: string, isConnectable: boolean): CustomColDef {
		const field: string[] = columnName.split('/');
		const column = field.length > 1 ? field[1] : columnName;
		const connectableField = this.connectableService.getConnectables()[column];
		if (connectableField && isConnectable) {
			return {
				field: columnName,
				cellRenderer: 'btnCellRenderer',
				cellRendererParams: {
					onClick: this.fetchConnectableData.bind(this)
				},
				headerTooltip: `
				<div>
					<b> <h5>Connectable</h5> </b>
					This is connectable to '${connectableField.displayName} API' -
					Please select your option from the column below to continue
				</div>
					`,
				path
			};
		} else {
			return { field: columnName };
		}
	}

	private fetchConnectableData(event) {
		const field: string[] = event.field.split('/');
		const fieldName = field.length > 1 ? field[1] : event.field;
		const connectableField = this.connectableService.getConnectables()[fieldName];

		const connectableEndpointDetails = this.explorerPanelApiService.duplicateConnectableEndpointDetailsToExplorer(
			connectableField.endpointDetails
		);
		this.explorerPanelApiService.addInputParameter(
			connectableEndpointDetails.api.displayName,
			connectableEndpointDetails.endpoint.path,
			event.value
		);
		this.explorerChangesService.publishConnectable(connectableEndpointDetails, event.value);
	}
}
