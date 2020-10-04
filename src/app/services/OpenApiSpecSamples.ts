import { OpenAPISpecification } from '../interfaces/apiSpecification';

export const mockedSpecificationData: OpenAPISpecification = {
	openapi: undefined,
	swagger: '2.0',
	info: {
		description: 'products api description',
		version: '1.0', title: 'Products API',
		termsOfService: 'Terms of Service',
		contact: { name: 'products Contact <productcontact@email.io>'},
		license: { name: 'Apache License Version 2.0', url: 'https://www.apache.org/licesen.html'}
	},
	host: 'http://localhost/products',
	basePath: '/products',
	tags: [{name: 'product-controller', description: 'Product Controller'}],
	paths: {
		'/products': {
			get: {
				tags: ['product-controller'],
				summary: 'Returns all products ',
				description: 'Multiple products object values, separated by comma',
				operationId: 'getProductsUsingGET',
				produces: ['*/*'],
				responses: {
					200: {description: 'OK', schema: {type: 'array', items: {$ref: '#/definitions/Product'}}},
					401: { description: 'Unauthorized' },
					403: { description: 'Forbidden' },
					404: { description: 'Not Found' }
				},
				deprecated: false
			}
		},
		'/products/{productId}': {
			get: {
				tags: ['product-controller'],
				summary: 'Returns a product by an Id',
				description: 'single products object value with matching id',
				operationId: 'getProductUsingGET',
				produces: ['application/json'],
				parameters: [ { name: 'productId', in: 'path', description: 'productId', required: true, schema: undefined } ],
				responses: {
					200: {description: 'OK', schema: {$ref: '#/definitions/Product'}},
					401: { description: 'Unauthorized' },
					403: { description: 'Forbidden' },
					404: { description: 'Not Found' }
				},
				deprecated: false
			}
		}
	},
	definitions: {
		Product: {
			type: 'object',
			properties: {
				ask: {type: 'number', description: 'ask description'},
				displayName: {type: 'string', description: 'displayName description'},
				exchange: {type: 'string', description: 'exchange description'},
				high: {type: 'number', description: 'high description'},
				open: {type: 'number', description: 'open description'},
				productId: {type: 'string', description: 'productId description'},
				ticker: {type: 'string', description: 'ticker description'},
				volume: {type: 'integer', format: 'int32', description: 'volume description' }
			},
			title: 'Product',
			description: 'Product data Model description'}
		}
	};


export const tradesAPISpecificationData: OpenAPISpecification = {
	openapi: undefined,
	swagger: '2.0',
	info: {
		version: '1.0',
		title: 'Trades API',
		connectables: [{name: 'productId', value: [ 'Products'] }]
	},
	host: 'http://localhost/trades',
	basePath: '/trades',
	paths: {
		'/trades': {
		get: {
			description: 'Multiple trades object values, separated by comma',
			summary: 'Returns all trades ',
			responses: {
				200: { description: 'OK', schema: { type: 'array', items: { $ref: '#/definitions/Trade'} } }
				}
			}
		}
	},
	definitions: {
		Account: {
			type: 'object',
			properties: {
				accountId: { type: 'string', description: 'accountId description' },
				accountType: { type: 'string', description: 'accountType description' },
				bookName: { type: 'string', description: 'bookName description' }
			},
			title: 'Account',
			description: 'Account data Model description'
		},
		ProductDetail: {
			type: 'object',
			properties: {
				exchange: { type: 'string', description: 'exchange description' },
				productId: { type: 'string', description: 'productId description' },
				ticker: { type: 'string', description: 'ticker description' }
			},
			title: 'ProductDetail',
			description: 'ProductDetail data Model description'
		},
		Trade: {
			type: 'object',
			properties: {
				account: { description: 'account description', $ref: '#/definitions/Account' },
				price: { type: 'number', description: 'price description' },
				productDetail: { description: 'productDetail description', $ref: '#/definitions/ProductDetail' },
				quantity: { type: 'integer', format: 'int32', description: 'quantity description' },
				side: { type: 'string', description: 'side description', enum: [ 'BUY', 'SELL' ] },
				tradeId: { type: ['string'], description: 'tradeId description' }
			},
			title: 'Trade',
			description: 'Trade data Model'
		}
	}
};

export const mockSpecificationNoGet: OpenAPISpecification = {
	openapi: undefined,
	swagger: '2.0',
	info: { version: '1.0', title: 'Sample API',
	connectables: [{name: 'productId', value: [ 'Products'] }]
	},
	host: 'http://localhost/sample',
	basePath: '/sample',
	paths: {
		'/sample': {
			put: {
				description: 'Multiple sample object values, separated by comma',
				summary: 'Returns all sample',
				responses: {
					200: { description: 'OK', schema: { type: 'array', items: { $ref: '#/definitions/Trade'} } }
				}
			}
		},
	},
	definitions: {
		Sample: {
			type: 'object',
			properties: {
				account: { description: 'account description', $ref: '#/definitions/Account' },
				price: { type: ['number', 'string'], description: 'price description' },
				productDetail: { description: 'productDetail description', $ref: '#/definitions/ProductDetail' },
				quantity: { type: 'integer', format: 'int32', description: 'quantity description' },
				side: { type: 'string', description: 'side description', enum: [ 'BUY', 'SELL' ] },
				tradeId: { type: 'string', description: 'tradeId description' }
			},
			title: 'Sample',
			description: 'Sample data Model'
		}
	}
};

