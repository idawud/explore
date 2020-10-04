import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ApiService } from './services/api.service';
import { EndpointListComponent } from './components/endpoint-list/endpoint-list.component';
import { ApiListComponent } from './components/api-list/api-list.component';
import { CategoriesComponent } from './components/categories/categories.component';
import { AgGridModule } from 'ag-grid-angular';
import { ApiDetailsSchemaTableComponent } from './components/api-details-schema-table/api-details-schema-table.component';
import { ApiDetailsSchemaDescriptionComponent } from './components/api-details-schema-description/api-details-schema-description.component';
import { ExplorerPanelComponent } from './components/explorer-panel/explorer-panel.component';
import { NewExplorerEditComponent } from './components/new-explorer-edit/new-explorer-edit.component';
import { NewExplorerViewComponent } from './components/new-explorer-view/new-explorer-view.component';
import { InputParametersComponent } from './components/input-parameters/input-parameters.component';
import { NewApiComponent } from './components/new-api/new-api.component';
import { ExplorerApiModelComponent } from './components/explorer-api-model/explorer-api-model.component';
import { ExplorerApiDataComponent } from './components/explorer-api-data/explorer-api-data.component';
import { ButtonCellRendererComponent } from './components/button-cell-renderer/button-cell-renderer.component';
import { GridHeaderRendererComponent } from './components/grid-header-renderer/grid-header-renderer.component';
import { EndpointVisibilityComponent } from './components/endpoint-visibility/endpoint-visibility.component';
import { NgbModule, NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpInterceptorClassService } from './services/shared/http-interceptor-class.service';
import { CustomErrorHandlerService } from './services/shared/custom-error-handler.service';
import { LoadingModalComponent } from './components/loading-modal/loading-modal.component';
import { EndpointLoaderComponent } from './components/endpoint-loader/endpoint-loader.component';
import { ModalEndpointListComponent } from './components/modal-endpoint-list/modal-endpoint-list.component';

@NgModule({
	declarations: [
		AppComponent,
		EndpointListComponent,
		ApiListComponent,
		CategoriesComponent,
		ApiDetailsSchemaTableComponent,
		ApiDetailsSchemaDescriptionComponent,
		ExplorerPanelComponent,
		NewExplorerEditComponent,
		NewExplorerViewComponent,
		InputParametersComponent,
		ExplorerApiModelComponent,
		ExplorerApiDataComponent,
		NewApiComponent,
		ExplorerApiModelComponent,
		ButtonCellRendererComponent,
		GridHeaderRendererComponent,
		EndpointVisibilityComponent,
		LoadingModalComponent,
		EndpointLoaderComponent,
		ModalEndpointListComponent
	],

	imports: [BrowserModule, HttpClientModule, AppRoutingModule, AgGridModule, NgbModule, NgbAlertModule],
	providers: [
		ApiService,
		{ provide: ErrorHandler, useClass: CustomErrorHandlerService },
		{ provide: HTTP_INTERCEPTORS, useClass: HttpInterceptorClassService, multi: true }
	],
	bootstrap: [AppComponent]
})
export class AppModule {}
