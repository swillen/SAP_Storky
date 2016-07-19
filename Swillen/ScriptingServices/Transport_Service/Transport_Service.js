/* globals $ */
/* eslint-env node, dirigible */

var entityTransports = require('Swillen/Transport_Service_lib');
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
	
	//get primary keys (one primary key is supported!)
	var idParameter = entityTransports.getPrimaryKey();
	
	// retrieve the id as parameter if exist 
	var id = xss.escapeSql(request.getParameter(idParameter));
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
	
	if(!entityTransports.hasConflictingParameters(id, count, metadata)) {
		// switch based on method type
		if ((method === 'POST')) {
			// create
			entityTransports.createTransports();
		} else if ((method === 'GET')) {
			// read
			if (id) {
				entityTransports.readTransportsEntity(id);
			} else if (count !== null) {
				entityTransports.countTransports();
			} else if (metadata !== null) {
				entityTransports.metadataTransports();
			} else if (type !== null) {
				entityTransports.readTransportsByType(type,limit,offset,sort,desc);
			} else {
				entityTransports.readTransportsList(limit, offset, sort, desc);
			} 
			
		} else if ((method === 'PUT')) {
			// update
			entityTransports.updateTransports();    
		} else if ((method === 'DELETE')) {
			// delete
			if(entityTransports.isInputParameterValid(idParameter)){
				entityTransports.deleteTransports(id);
			}
		} else {
			entityTransports.printError(response.BAD_REQUEST, 4, "Invalid HTTP Method", method);
		}
	}
	
	// flush and close the response
	response.flush();
	response.close();
}
