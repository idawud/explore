import { OpenAPISpecification } from '../interfaces/apiSpecification';

export const mockedSpecificationDataV3: OpenAPISpecification = {
	swagger: undefined,
	openapi: '3.0.0',
	info: {
		contact: {
		name: 'products Contact <productcontact@email.io>'
		},
		description: 'products api description',
		license: {
		name: 'Apache License Version 2.0',
		url: 'https://www.apache.org/licesen.html'
		},
		termsOfService: 'Terms of Service',
		title: 'Products API',
		version: '1.0'
	},
	servers: [
		{
		url: 'http://localhost/products/products/'
		}
	],
	paths: {
		'/products': {
		get: {
			responses: {
			200: {
				content: {
				'*/*': {
					schema: {
					items: {
						$ref: '#/components/schemas/Product'
					},
					type: 'array'
					}
				}
				},
				description: 'OK'
			},
			401: {
				description: 'Unauthorized'
			},
			403: {
				description: 'Forbidden'
			},
			404: {
				description: 'Not Found'
			}
			},
			tags: [
			'product-controller'
			],
			deprecated: false,
			description: 'Multiple products object values, separated by comma',
			operationId: 'getProductsUsingGET',
			summary: 'Returns all products '
		}
		},
		'/products/{productId}': {
		get: {
			parameters: [
			{
				description: 'productId',
				in: 'path',
				name: 'productId',
				required: true,
				schema: {
				type: 'string'
				}
			}
			],
			responses: {
			200: {
				content: {
				'application/json': {
					schema: {
					$ref: '#/components/schemas/Product'
					}
				}
				},
				description: 'OK'
			},
			401: {
				description: 'Unauthorized'
			},
			403: {
				description: 'Forbidden'
			},
			404: {
				description: 'Not Found'
			}
			},
			tags: [
			'product-controller'
			],
			deprecated: false,
			description: 'single products object value with matching id',
			operationId: 'getProductUsingGET',
			summary: 'Returns a product by an Id'
		}
		}
	},
	components: {
		schemas: {
		Product: {
			description: 'Product data Model description',
			properties: {
			ask: {
				description: 'ask description',
				type: 'number'
			},
			displayName: {
				description: 'displayName description',
				type: 'string'
			},
			exchange: {
				description: 'exchange description',
				type: 'string'
			},
			high: {
				description: 'high description',
				type: 'number'
			},
			open: {
				description: 'open description',
				type: 'number'
			},
			productId: {
				description: 'productId description',
				type: 'string'
			},
			ticker: {
				description: 'ticker description',
				type: 'string'
			},
			volume: {
				description: 'volume description',
				format: 'int32',
				type: 'integer'
			}
			},
			title: 'Product',
			type: 'object'
		}
		}
	},
	tags: [
		{
		description: 'Product Controller',
		name: 'product-controller'
		}
	]
	};


export const tradesAPISpecificationDataV3: OpenAPISpecification = {
	swagger: undefined,
	openapi: '3.0.0',
	info: {
		connectables: [ { name: 'productId', value: [ 'Products' ] } ],
		contact: { email: 'tradecontact@email.io', name: 'trades Contact' },
		description: 'trades api description',
		license: {
			name: 'Apache License Version 2.0',
			url: 'https://www.apache.org/licesen.html'
		},
		termsOfService: 'Terms of Service',
		title: 'Trades API',
		version: '1.0'
	},
	servers: [
		{ url: 'http://localhost/trades' }
	],
	paths: {
		'/trades': {
			get: {
				responses: {
					200: {
						content: {
						'*/*': {
							schema: {
							items: {
								$ref: '#/components/schemas/Trade'
							},
							type: 'array'
							}
						}
						},
						description: 'OK'
					},
					401: { description: 'Unauthorized' },
					403: { description: 'Forbidden' },
					404: { description: 'Not Found' }
				},
				tags: ['product-controller'],
				summary: 'Returns all products ',
				description: 'Multiple products object values, separated by comma',
				operationId: 'getProductsUsingGET',
			}
		}
	},
	components: {
		schemas: {
			Account: {
				description: 'Account data Model description',
				properties: {
					accountId: { description: 'accountId description', type: 'string' },
					accountType: { description: 'accountType description', type: 'string' },
					bookName: { description: 'bookName description', type: 'string' }
				},
				title: 'Account',
				type: 'object'
			},
			ProductDetail: {
				description: 'ProductDetail data Model description',
				properties: {
					exchange: { description: 'exchange description', type: 'string' },
					productId: { description: 'productId description', type: 'string' },
					ticker: { description: 'ticker description', type: 'string' }
				},
				title: 'ProductDetail',
				type: 'object'
			},
			Trade: {
				description: 'Trade data Model',
				properties: {
					account: { $ref: '#/components/schemas/Account', description: 'account description' },
					price: { description: 'price description', type: 'number' },
					productDetail: { $ref: '#/components/schemas/ProductDetail', description: 'productDetail description' },
					quantity: { description: 'quantity description', format: 'int32', type: 'integer' },
					side: { description: 'side description', enum: [ 'BUY', 'SELL' ], type: 'string' },
					tradeId: { description: 'tradeId description', type: 'string' }
				},
				title: 'Trade',
				type: 'object'
			}
		}
	},
	tags: [ { description: 'Trades Controller', name: 'trades-controller' } ]
};


export const mockedDataSetSpecificationV3: OpenAPISpecification = {
	swagger: undefined,
	openapi: '3.0.1',
	servers: [
		{
		url: '{scheme}://developer.uspto.gov/ds-api',
		variables: {
			scheme: {
			description: 'The Data Set API is accessible via https and http',
			enum: [
				'https',
				'http'
			],
			default: 'https'
			}
		}
		}
	],
	info: {
		description: 'The Data Set API (DSAPI) allows the public users to discover and search USPTO exported data sets. This is a generic API that allows USPTO users to make any CSV based data files searchable through API. With the help of GET call, it returns the list of data fields that are searchable. With the help of POST call, data can be fetched based on the filters on the field names. Please note that POST call is used to search the actual data. The reason for the POST call is that it allows users to specify any complex search criteria without worry about the GET size limitations as well as encoding of the input parameters.',
		version: '1.0.0',
		title: 'USPTO Data Set API',
		contact: {
		name: 'Open Data Portal',
		url: 'https://developer.uspto.gov',
		email: 'developer@uspto.gov'
		}
	},
	tags: [
		{
		name: 'metadata',
		description: 'Find out about the data sets'
		},
		{
		name: 'search',
		description: 'Search a data set'
		}
	],
	paths: {
		'/': {
		get: {
			tags: [
			'metadata'
			],
			operationId: 'list-data-sets',
			summary: 'List available data sets',
			responses: {
			200: {
				description: 'Returns a list of data sets',
				content: {
				'application/json': {
					schema: {
					$ref: '#/components/schemas/dataSetList'
					},
					example: {
					total: 2,
					apis: [
						{
						apiKey: 'oa_citations',
						apiVersionNumber: 'v1',
						apiUrl: 'https://developer.uspto.gov/ds-api/oa_citations/v1/fields',
						apiDocumentationUrl: 'https://developer.uspto.gov/ds-api-docs/index.html?url=https://developer.uspto.gov/ds-api/swagger/docs/oa_citations.json'
						},
						{
						apiKey: 'cancer_moonshot',
						apiVersionNumber: 'v1',
						apiUrl: 'https://developer.uspto.gov/ds-api/cancer_moonshot/v1/fields',
						apiDocumentationUrl: 'https://developer.uspto.gov/ds-api-docs/index.html?url=https://developer.uspto.gov/ds-api/swagger/docs/cancer_moonshot.json'
						}
					]
					}
				}
				}
			}
			}
		}
		},
		'/pets': {
			get: {
				summary: 'List all pets',
				operationId: 'listPets',
				tags: [
				'pets'
				],
				parameters: [
				{
					name: 'limit',
					in: 'query',
					description: 'How many items to return at one time (max 100)',
					required: false,
					schema: {
					type: 'integer',
					format: 'int32'
					}
				}
				],
				responses: {
				200: {
					description: 'A paged array of pets',
					headers: {
					'x-next': {
						description: 'A link to the next page of responses',
						schema: {
						type: 'string'
						}
					}
					},
					content: {
					'application/json': {
						schema: {
						$ref: '#/components/schemas/Pets'
						}
					}
					}
				},
				default: {
					description: 'unexpected error',
					content: {
					'application/json': {
						schema: {
						$ref: '#/components/schemas/Error'
						}
					}
					}
				}
				}
			},
		'/{dataset}/{version}/records': {
		post: {
			tags: [
			'search'
			],
			summary: 'Provides search capability for the data set with the given search criteria.',
			description: 'This API is based on Solr/Lucene Search. The data is indexed using SOLR. This GET API returns the list of all the searchable field names that are in the Solr Index. Please see the \'fields\' attribute which returns an array of field names. Each field or a combination of fields can be searched using the Solr/Lucene Syntax. Please refer https://lucene.apache.org/core/3_6_2/queryparsersyntax.html#Overview for the query syntax. List of field names that are searchable can be determined using above GET api.',
			operationId: 'perform-search',
			parameters: [
			{
				name: 'version',
				in: 'path',
				description: 'Version of the dataset.',
				required: true,
				schema: {
				type: 'string',
				default: 'v1'
				}
			},
			{
				name: 'dataset',
				in: 'path',
				description: 'Name of the dataset. In this case, the default value is oa_citations',
				required: true,
				schema: {
				type: 'string',
				default: 'oa_citations'
				}
			}
			],
			responses: {
			200: {
				description: 'successful operation',
				content: {
				'application/json': {
					schema: {
					type: 'array',
					items: {
						type: 'object',
						additionalProperties: {
						type: 'object'
						}
					}
					}
				}
				}
			},
			404: {
				description: 'No matching record found for the given criteria.'
			}
			},
			requestBody: {
			content: {
				'application/x-www-form-urlencoded': {
				schema: {
					type: 'object',
					properties: {
					criteria: {
						description: 'Uses Lucene Query Syntax in the format of propertyName:value, propertyName:[num1 TO num2] and date range format: propertyName:[yyyyMMdd TO yyyyMMdd]. In the response please see the \'docs\' element which has the list of record objects. Each record structure would consist of all the fields and their corresponding values.',
						type: 'string',
						default: '*:*'
					},
					start: {
						description: 'Starting record number. Default value is 0.',
						type: 'integer',
						default: 0
					},
					rows: {
						description: 'Specify number of rows to be returned. If you run the search with default values, in the response you will see \'numFound\' attribute which will tell the number of records available in the dataset.',
						type: 'integer',
						default: 100
					}
					},
					required: [
					'criteria'
					]
				}
				}
			}
			}
		}
		}
	}},
	components: {
		schemas: {
		dataSetList: {
			type: 'object',
			properties: {
			total: {
				type: 'integer'
			},
			apis: {
				type: 'array',
				items: {
				type: 'object',
				properties: {
					apiKey: {
					type: 'string',
					description: 'To be used as a dataset parameter value'
					},
					apiVersionNumber: {
					type: 'string',
					description: 'To be used as a version parameter value'
					},
					apiUrl: {
					type: 'string',
					format: 'uriref',
					description: 'The URL describing the dataset\'s fields'
					},
					apiDocumentationUrl: {
					type: 'string',
					format: 'uriref',
					description: 'A URL to the API console for each API'
					}
				}
				}
			}
			}
		},
		Pet: {
			type: 'object',
			required: [
				'id',
				'name'
			],
			properties: {
				id: {
				type: 'integer',
				format: 'int64'
				},
				name: {
				type: 'string'
				},
				tag: {
				type: 'string'
				}
			}
			},
		Pets: {
		type: 'array',
		items: {
			$ref: '#/components/schemas/Pet'
		}
		}
	}
	}
};

