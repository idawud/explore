import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ApiEndpoints } from 'src/app/interfaces/api';
import { OpenAPISpecification } from 'src/app/interfaces/apiSpecification';
import { Subscription } from 'rxjs';
import { ApiCallManagementService } from 'src/app/services/shared/api-call-management.service';

@Component({
	selector: 'app-api-list',
	templateUrl: './api-list.component.html',
	styleUrls: [ './api-list.component.scss' ]
})
export class ApiListComponent implements OnInit, OnDestroy {
	@Input() apiStore: ApiEndpoints;
	apiSpecificationDoc: OpenAPISpecification;
	private subscription: Subscription = new Subscription();
	displayNameId: string;

	constructor(private apiCallManagementService: ApiCallManagementService) {}

	ngOnInit(): void {
		this.subscription.add(
			this.apiCallManagementService.apiSpecificationDoc$.subscribe(apiSpecificationDoc => {
				this.apiSpecificationDoc = apiSpecificationDoc;
			})
		);
		this.displayNameId = this.apiStore.api.displayName.replace(' ', '_');
	}

	setEndPoints(apiUrl: string): void {
		this.apiCallManagementService.setEndpointsToStoreByApiUrl(apiUrl, this.apiStore);
	}

	getApiData(): ApiEndpoints {
		return this.apiStore;
	}

	ngOnDestroy(): void {
		this.subscription.unsubscribe();
	}
}
