/* globals $ */
/* eslint-env node, dirigible */

var entityView_cities_arrival = require('City_Services/List_arrival_Cities_lib.js');
var request = require("net/http/request");
var response = require("net/http/response");
var xss = require("utils/xss");

handleRequest();

function handleRequest() {
	
	response.setContentType("application/json; charset=UTF-8");
	response.setCharacterEncoding("UTF-8");
	
	// get method type
	var method = request.getMethod();
	method = method.toUpperCase();
	
	// retrieve the id as parameter if exist 
	var count = xss.escapeSql(request.getParameter('count'));
	var metadata = xss.escapeSql(request.getParameter('metadata'));
	var sort = xss.escapeSql(request.getParameter('sort'));
	var limit = xss.escapeSql(request.getParameter('limit'));
	var offset = xss.escapeSql(request.getParameter('offset'));
	var desc = xss.escapeSql(request.getParameter('desc'));
	var type = xss.escapeSql(request.getParameter('type'));
	
	if (limit === null) {
		limit = 100;
	}
	if (offset === null) {
		offset = 0;
	}
	
	if(!entityView_cities_arrival.hasConflictingParameters(null, count, metadata)) {
		// switch based on method type
		if ((method === 'GET')) {
			// read
			if (count !== null) {
				entityView_cities_arrival.countView_cities_arrival();
			} else if (metadata !== null) {
				entityView_cities_arrival.metadataView_cities_arrival();
			}
			else if (type !== null) {
				if (type == "Any") {
					entityView_cities_arrival.readView_cities_arrivalListByTypeAny(limit,offset,sort,desc);
				} else {
					entityView_cities_arrival.readView_cities_arrivalListByType(type,limit,offset,sort,desc);
				}

					}
			else {
				entityView_cities_arrival.readView_cities_arrivalList(limit, offset, sort, desc);
			}
		} else {
			// create, update, delete
			entityView_cities_arrival.printError(response.METHOD_NOT_ALLOWED, 4, "Method not allowed"); 
		}
	}
	
	// flush and close the response
	response.flush();
	response.close();
}
