import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Api, ApiEndpoints } from '../interfaces/api';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { catchError, map, tap, delay } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { handleError } from './shared/handle-errors.service';

/**
 * @description
 * This Service is used to load the Apis from the server
 */
@Injectable({
	providedIn: 'root'
})
export class ApiService {
	private apiCache$: Observable<Api[]> = null;

	constructor(private httpClient: HttpClient) {}

	readonly API_URL = `${environment.apiURL}/apis`;

	/**
	 * Fetch all Apis available from server
	 * @returns Observable<Api[]> -  List all of API as array
	 */
	getApisAsync(): Observable<Api[]> {
		return !this.apiCache$ ? this.requestApisAsync(this.API_URL) : this.apiCache$;
	}

	private requestApisAsync(URL: string): Observable<Api[]> {
		this.apiCache$ = this.httpClient.get<Api[]>(URL);
		return this.apiCache$;
	}

	/**
	 * To group all Apis loaded from server into categories
	 * @returns Observable<Map<string, Api[]>> - Map of the category(department) to the Api
	 */
	getApisGroupedByCategory(): Observable<Map<string, Api[]>> {
		return this.getApisAsync().pipe(
			map(apis => {
				const result = new Map<string, Api[]>();
				apis.forEach(api => {
					result.set(api.department, (result.get(api.department) || []).concat(api));
				});
				return result;
			})
		);
	}

	/**
	 * To get the data from the server
	 * @param URL - the url to the server
	 * @returns an observable of the data as an object
	 */
	fetchDataFromServerAsync(URL: string): Observable<object> {
		return this.httpClient.get<object>(URL);
	}
}
