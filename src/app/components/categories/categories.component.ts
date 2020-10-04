import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { Api } from 'src/app/interfaces/api';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiCallManagementService, ApiStore } from 'src/app/services/shared/api-call-management.service';
import { monitor } from 'src/app/services/shared/monitor-operator';
import { StatusMonitor } from 'src/app/services/shared/status-monitor';
import { flatten } from 'lodash';

@Component({
	selector: 'app-categories',
	templateUrl: './categories.component.html',
	styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit, OnDestroy {
	storeApis: ApiStore[] = [];
	publishApis: Api[] = [];
	statusMonitor: StatusMonitor;

	private subscription: Subscription = new Subscription();

	constructor(private apiService: ApiService, private apiCallManagementService: ApiCallManagementService) {}

	ngOnInit(): void {
		this.loadApis();
		this.subscription.add(
			this.apiCallManagementService.apiStore$.subscribe(apis => {
				this.storeApis = apis;
			})
		);
	}

	loadApis(): void {
		this.statusMonitor = new StatusMonitor();

		this.subscription.add(
			this.apiService
				.getApisGroupedByCategory()
				.pipe(monitor(this.statusMonitor), tap(apis => apis))
				.subscribe(apis => {
					for (const [key, value] of apis) {
						const apiEndpoints = value.map(val => ({ api: val, endpoints: [] }));
						this.apiCallManagementService.addApiToStore(key, apiEndpoints);
					}
				})
		);
	}

	ngOnDestroy() {
		this.subscription.unsubscribe();
	}
}
