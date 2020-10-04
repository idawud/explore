import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Api, ApiEndpoints } from 'src/app/interfaces/api';
import { ApiCallManagementService } from 'src/app/services/shared/api-call-management.service';
import { monitor } from 'src/app/services/shared/monitor-operator';
import { StatusMonitor } from 'src/app/services/shared/status-monitor';

@Component({
	selector: 'app-modal-endpoint-list',
	templateUrl: './modal-endpoint-list.component.html',
	styleUrls: ['./modal-endpoint-list.component.scss']
})
export class ModalEndpointListComponent {
	@Input() apiEndpoint: ApiEndpoints;
	@Output() endpointListToAddChangeValue = new EventEmitter();
	@Output() publishApisToExplorer = new EventEmitter();

	statusMonitor: StatusMonitor;

	constructor(private apiCallManagementService: ApiCallManagementService) {}

	setEndPoints(api: Api): void {
		const alreadyFetched = this.apiCallManagementService.isEndpointsSetToStore(api.department, api);
		if (!alreadyFetched) {
			this.statusMonitor = new StatusMonitor();
			this.apiCallManagementService.setEndpointsToStoreByApi(api).pipe(monitor(this.statusMonitor)).subscribe();
		}
	}

	listToAddChangeValue(event): void {
		this.endpointListToAddChangeValue.emit(event);
	}

	publishToExplorer(): void {
		this.publishApisToExplorer.emit();
	}
}
