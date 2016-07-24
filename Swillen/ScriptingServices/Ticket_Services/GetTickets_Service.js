/* globals $ */
/* eslint-env node, dirigible */

var entityView_tickets = require('Ticket_Services/GetTickets_Service_lib');
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
    var fromCity = xss.escapeSql(request.getParameter('from'));
    var toCity = xss.escapeSql(request.getParameter('to'));
    var date = xss.escapeSql(request.getParameter('date'));

    if (limit === null) {
        limit = 100;
    }
    if (offset === null) {
        offset = 0;
    }

    if (!entityView_tickets.hasConflictingParameters(null, count, metadata)) {
        // switch based on method type
        if (method === 'GET') {
            // read
            if (count !== null) {
                entityView_tickets.countView_tickets();
            } else if (metadata !== null) {
                entityView_tickets.metadataView_tickets();
            }
            else if (type !== null && fromCity !== null && toCity !== null && date !== null) {
                  entityView_tickets.getFiltered(type, fromCity, toCity, date, null, null, null, null);
            }
            else {
                entityView_tickets.readView_ticketsList(limit, offset, sort, desc);
            }
        } else {
            // create, update, delete
            entityView_tickets.printError(response.METHOD_NOT_ALLOWED, 4, "Method not allowed");
        }
    }

    // flush and close the response
    response.flush();
    response.close();
}
