import { ApiSpecDefinitionModel } from '../interfaces/api';

export const mockReferenceModel: ApiSpecDefinitionModel = {
	description: 'Trade data Model',
	values: [
		{fieldName: 'account', drillable: true, properties: {type: 'Account', description: 'account description'},
		values: [
			{fieldName: 'accountId', drillable: false, properties: {type: 'string', description: 'accountId description'}},
			{fieldName: 'accountType', drillable: false, properties: {type: 'string', description: 'accountType description'}},
			{fieldName: 'bookName', drillable: false, properties: {type: 'string', description: 'bookName description'}}]
		},
		{fieldName: 'price', drillable: false, properties: {type: 'number', description: 'price description'}},
		{fieldName: 'productDetail', drillable: true, properties: {type: 'ProductDetail', description: 'productDetail description'},
		values: [
			{fieldName: 'exchange', drillable: false, properties: {type: 'string', description: 'exchange description'}},
			{fieldName: 'productId', drillable: false, properties: {type: 'string', description: 'productId description'}},
			{fieldName: 'ticker', drillable: false, properties: {type: 'string', description: 'ticker description'}}]},
			{fieldName: 'quantity', drillable: false, properties: {type: 'integer', description: 'quantity description'}},
			{fieldName: 'side', drillable: false, properties: {type: 'string', description: 'side description'}},
			{fieldName: 'tradeId', drillable: false, properties: {type: 'string', description: 'tradeId description'}}
		]
	};
