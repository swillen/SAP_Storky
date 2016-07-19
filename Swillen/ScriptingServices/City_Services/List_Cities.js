/* globals $ */
/* eslint-env node, dirigible */

var entityView_cities = require('City_Services/List_Cities_lib');
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
	
	if(!entityView_cities.hasConflictingParameters(null, count, metadata)) {
		// switch based on method type
		if ((method === 'GET')) {
			// read
			if (count !== null) {
				entityView_cities.countView_cities();
			} else if (metadata !== null) {
				entityView_cities.metadataView_cities();
			} else if (type !== null) {
				entityView_cities.readView_citiesListByType(type,limit,offset,sort,desc);
					} else {
				entityView_cities.readView_citiesList(limit, offset, sort, desc);
			}
		} else {
			// create, update, delete
			entityView_cities.printError(response.METHOD_NOT_ALLOWED, 4, "Method not allowed"); 
		}
	}
	
	// flush and close the response
	response.flush();
	response.close();
}
