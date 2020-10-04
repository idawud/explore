import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ApiSpecDefinitionModel, Api } from 'src/app/interfaces/api';
import { ApiDetailsDescription, ExplorerEndpointDetails } from 'src/app/interfaces/apiSpecification';

@Injectable({
	providedIn: 'root'
})
export /**
 * A class to handle endpoint details service
 */
class SharedEndpointDetailsService {
	private endPointsDetailsBehaviourSubject = new BehaviorSubject<ApiSpecDefinitionModel>(null);
	private endPointDescriptionBehaviorSubject = new BehaviorSubject<ApiDetailsDescription>(null);
	private explorerEndpointDetailsBehaviourSubject = new BehaviorSubject<ExplorerEndpointDetails>(null);

	endpointSchemaDetailsTable = this.endPointsDetailsBehaviourSubject.asObservable();
	endpointDescription = this.endPointDescriptionBehaviorSubject.asObservable();
	explorerEndpointDetails$ = this.explorerEndpointDetailsBehaviourSubject.asObservable();

	/**
	 * A function to set endpoints schema details to the BehaviorSubject variable[endPointsDetailsBehaviourSubject]
	 * @param endPointsDetails -  Endpoint details object in the API
	 */
	setEndPointsDetails(endPointsDetails: ApiSpecDefinitionModel): void {
		this.endPointsDetailsBehaviourSubject.next(endPointsDetails);
	}

	/**
	 * A function to set endpoints description to the BehaviorSubject variable[apiBehaviorSubject]
	 * @param endPointDescription -  Endpoint description object in the API
	 */
	setEndPointDescription(endPointDescription: ApiDetailsDescription): void {
		this.endPointDescriptionBehaviorSubject.next(endPointDescription);
	}

	/**
	 * A function to publish endpoint Details to the BehaviorSubject variable[explorerEndpointDetailsBehaviourSubject]
	 * @param endpointDetails -  ExplorerEndpointDetails object
	 */
	publishEndpointDetails(endpointDetails: ExplorerEndpointDetails): void {
		this.explorerEndpointDetailsBehaviourSubject.next(endpointDetails);
	}
}
