/* globals $ */
/* eslint-env node, dirigible */

var entityTickets = require('/Ticket_Services/Manage_Tickets_lib.js');
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
	var idParameter = entityTickets.getPrimaryKey();
	
	// retrieve the id as parameter if exist 
	var id = xss.escapeSql(request.getParameter(idParameter));
	var count = xss.escapeSql(request.getParameter('count'));
	var metadata = xss.escapeSql(request.getParameter('metadata'));
	var sort = xss.escapeSql(request.getParameter('sort'));
	var limit = xss.escapeSql(request.getParameter('limit'));
	var offset = xss.escapeSql(request.getParameter('offset'));
	var desc = xss.escapeSql(request.getParameter('desc'));
	
	if (limit === null) {
		limit = 100;
	}
	if (offset === null) {
		offset = 0;
	}
	
	if(!entityTickets.hasConflictingParameters(id, count, metadata)) {
		// switch based on method type
		if ((method === 'POST')) {
			// create
			entityTickets.createTickets();
		} else if ((method === 'GET')) {
			// read
			if (id) {
				entityTickets.readTicketsEntity(id);
			} else if (count !== null) {
				entityTickets.countTickets();
			} else if (metadata !== null) {
				entityTickets.metadataTickets();
			} else {
				entityTickets.readTicketsList(limit, offset, sort, desc);
			}
		} else if ((method === 'PUT')) {
			// update
			entityTickets.updateTickets();    
		} else if ((method === 'DELETE')) {
			// delete
			if(entityTickets.isInputParameterValid(idParameter)){
				entityTickets.deleteTickets(id);
			}
		} else {
			entityTickets.printError(response.BAD_REQUEST, 4, "Invalid HTTP Method", method);
		}
	}
	
	// flush and close the response
	response.flush();
	response.close();
}
