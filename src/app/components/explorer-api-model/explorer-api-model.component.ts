import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ExplorerEndpointDetails, OpenAPISpecification } from 'src/app/interfaces/apiSpecification';
import { ApiSpecificationService } from 'src/app/services/api_specification.service';
import { GridOptions, GridReadyEvent, RowSelectedEvent } from 'ag-grid-community';
import { ApiSpecDefinitionModel, ConnectableMap } from 'src/app/interfaces/api';
import { Parameters } from 'src/app/interfaces/apiSpecification';
import { ExplorerPanelApiService } from 'src/app/services/shared/explorer-panel-api.service';
import { ConnectableService } from 'src/app/services/connectable.service';
import { Subscription } from 'rxjs';

@Component({
	selector: 'app-explorer-api-model',
	templateUrl: './explorer-api-model.component.html',
	styleUrls: [ './explorer-api-model.component.scss' ]
})
export class ExplorerApiModelComponent implements OnInit, OnDestroy {
	@Input() endpointDetails: ExplorerEndpointDetails;
	private _apiSpecificationDoc: OpenAPISpecification;
	private subscription: Subscription = new Subscription();

	input: Parameters;
	private gridApi;
	isRowMaster;
	rowData: any = [];
	defaultColDef;
	detailRowData;
	private _gridOptions: GridOptions;
	private _tableData: ApiSpecDefinitionModel;
	connecTableField: ConnectableMap;
	isRowDataAvailable = false;
	private listToAddAsFilters: string[] = [];
	private columnDefs = [
		{ field: 'fieldName', sortable: true, width: 180 },
		{ field: 'type', cellRenderer: 'agGroupCellRenderer', width: 120 },
		{ field: 'description', minWidth: 550 },
		{ field: 'connectable', width: 120 },
		{ field: 'display', width: 120, checkboxSelection: true, headerCheckboxSelection: true }
	];

	constructor(
		private apiSpecificationService: ApiSpecificationService,
		private explorerPanelApiService: ExplorerPanelApiService,
		private connectableService: ConnectableService
	) {
		this.setupGridOptions();
	}

	get gridOptions(): GridOptions {
		return this._gridOptions;
	}

	get tableData(): ApiSpecDefinitionModel {
		return this._tableData;
	}

	duplicateEndpoint(): void {
		this.explorerPanelApiService.duplicateEndpointDetailsToExplorer(this.endpointDetails);
	}

	removeEndpoint(): void {
		this.explorerPanelApiService.removeEndpointDetailsFromExplorerPanel(this.endpointDetails);
		this.explorerPanelApiService.removeDataOutputFilter(
			this.endpointDetails.api.displayName,
			this.endpointDetails.endpoint.path
		);
	}

	ngOnInit(): void {
		this.subscription.add(
			this.apiSpecificationService
				.getSpecificationAsync(this.endpointDetails.api.specificationLocation)
				.subscribe(data => {
					this._apiSpecificationDoc = data;

					this._tableData = this.apiSpecificationService.getReferenceDefinitionModel(
						this.endpointDetails.endpoint.path,
						this._apiSpecificationDoc
					);

					this.connectableService.getAllConnectablesFromSpecificationDocument(data);

					this.input = this.apiSpecificationService.getInputParameters(
						this._apiSpecificationDoc,
						this.endpointDetails.endpoint.path
					);
					this.isRowDataAvailable = true;
					this.addDataOutputFilters(this._tableData);
				})
		);

		this.subscription.add(
			this.connectableService.connectableField$.subscribe(() => {
				this.connecTableField = this.connectableService.getConnectables();
			})
		);
	}

	ngOnDestroy() {
		this.subscription.unsubscribe();
	}

	private setupGridOptions(): void {
		this.isRowMaster = dataItem => {
			return dataItem.type === '' ? dataItem.values : false;
		};

		this._gridOptions = {
			rowData: this.rowData,
			columnDefs: this.columnDefs,
			gridAutoHeight: true,
			rowHeight: 27,
			masterDetail: true,
			animateRows: true,
			enableFilter: true,
			enableColResize: true,
			rowSelection: 'multiple',
			isRowMaster: this.isRowMaster,
			suppressRowClickSelection: true,
			onRowSelected: event => this.rowSelectedHandler(event),
			detailCellRendererParams: {
				autoHeight: true,
				detailGridOptions: {
					columnDefs: this.columnDefs,
					rowSelection: 'multiple',
					suppressRowClickSelection: true,
					onRowSelected: event => this.rowSelectedHandler(event),
					defaultColDef: { flex: 1 },
					onGridReady: (params: GridReadyEvent) => params.api.selectAll()
				},
				getDetailRowData: params => this.getDetailRowData(params)
			},
			onGridReady: params => this.onGridReady(params)
		};
	}

	private onGridReady(params: GridReadyEvent): void {
		this.gridApi = params.api;
		this.rowData = this.tableData.values.map(data => ({
			fieldName: data.fieldName,
			type: data.drillable ? '' : data.properties.type,
			description: data.properties.description,
			connectable: this.connecTableField[data.fieldName] ? 'Yes' : 'No',
			display: '',
			values: data.drillable ? data.values : ''
		}));
		this.gridApi.setRowData(this.rowData);
		this.gridApi.selectAll();
	}

	private getDetailRowData(params: any): void {
		this.detailRowData = params.data.values.map(value => ({
			fieldName: value.fieldName,
			type: value.drillable ? '' : value.properties.type,
			description: value.properties.description,
			connectable: this.connecTableField[value.fieldName] ? 'Yes' : 'No'
		}));
		params.successCallback(this.detailRowData);
	}

	private rowSelectedHandler(event: RowSelectedEvent): void {
		if (event.node.isSelected()) {
			if (!this.listToAddAsFilters.includes(event.node.data.fieldName)) {
				this.listToAddAsFilters.push(event.node.data.fieldName);
			}
		} else {
			this.listToAddAsFilters.splice(this.listToAddAsFilters.indexOf(event.node.data.fieldName), 1);
		}
		this.explorerPanelApiService.addDataOutputFilter(
			this.endpointDetails.api.displayName,
			this.endpointDetails.endpoint.path,
			this.listToAddAsFilters
		);
	}

	private addDataOutputFilters(tableData: ApiSpecDefinitionModel): void {
		const listFilters = new Set<string>();
		tableData.values.forEach(tData => {
			listFilters.add(tData.fieldName);
			if (tData.values !== undefined) {
				tData.values.forEach(detailedData => {
					listFilters.add(detailedData.fieldName);
				});
			}
		});
		this.listToAddAsFilters = Array.from(listFilters);
	}
}
