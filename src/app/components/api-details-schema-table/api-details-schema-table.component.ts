import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedEndpointDetailsService } from 'src/app/services/shared/shared-endpoint-details.service';
import { ApiSpecDefinitionModel } from 'src/app/interfaces/api';
import { Subscription } from 'rxjs';
import 'ag-grid-enterprise';
import { GridOptions } from 'ag-grid-community';
import { getTooltipMessage } from './messageTooltip';

@Component({
	selector: 'app-api-details-schema-table',
	templateUrl: './api-details-schema-table.component.html',
	styleUrls: [ './api-details-schema-table.component.scss' ]
})
export class ApiDetailsSchemaTableComponent implements OnInit, OnDestroy {
	endpointDetails: ApiSpecDefinitionModel;

	private subscription: Subscription = new Subscription();

	private gridApi;
	isRowMaster;
	rowData: any = [];
	columnDefs: any[];
	defaultColDef;
	detailRowData;
	gridOptions: GridOptions;

	constructor(private sharedEndpointDetailsService: SharedEndpointDetailsService) {
		this.isRowMaster = dataItem => {
			return dataItem.type === '' ? dataItem.values : false;
		};

		this.columnDefs = [
			{ field: 'fieldName', sortable: true, width: 180 },
			{ field: 'type', cellRenderer: 'agGroupCellRenderer', width: 120 },
			{ field: 'description', width: 510, tooltipValueGetter: params => getTooltipMessage(params.value, 80) }
		];

		this.gridOptions = {
			rowData: this.rowData,
			columnDefs: this.columnDefs,
			rowHeight: 27,
			gridAutoHeight: true,
			masterDetail: true,
			animateRows: true,
			enableFilter: true,
			rowSelection: 'multiple',
			isRowMaster: this.isRowMaster,
			detailCellRendererParams: {
				autoHeight: true,
				detailGridOptions: {
					columnDefs: [
						{ field: 'fieldName', sortable: true },
						{ field: 'type', cellRenderer: 'agGroupCellRenderer' },
						{
							field: 'description',
							minWidth: 500,
							tooltipValueGetter: params => getTooltipMessage(params.value, 80)
						}
					],
					defaultColDef: { flex: 1 }
				},
				getDetailRowData: params => {
					this.detailRowData = params.data.values.map(value => ({
						fieldName: value.fieldName,
						type: value.drillable ? '' : value.properties.type,
						description: value.properties.description
					}));
					params.successCallback(this.detailRowData);
				}
			},
			onGridReady: params => {
				this.gridApi = params.api;
				this.sharedEndpointDetailsService.endpointSchemaDetailsTable.subscribe(endPointDetails => {
					this.endpointDetails = endPointDetails;
					this.rowData = this.endpointDetails.values.map(data => ({
						fieldName: data.fieldName,
						type: data.drillable ? '' : data.properties.type,
						description: data.properties.description,
						values: data.drillable ? data.values : ''
					}));
					this.gridApi.setRowData(this.rowData);
				});
			}
		};
	}

	ngOnInit(): void {
		this.subscription.add(
			this.sharedEndpointDetailsService.endpointSchemaDetailsTable.subscribe(endPointDetails => {
				this.endpointDetails = endPointDetails;
			})
		);
	}

	ngOnDestroy(): void {
		this.subscription.unsubscribe();
	}
}
