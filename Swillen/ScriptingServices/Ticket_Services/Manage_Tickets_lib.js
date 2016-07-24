/* globals $ */
/* eslint-env node, dirigible */

var request = require("net/http/request");
var response = require("net/http/response");
var database = require("db/database");

var datasource = database.getDatasource();

// create entity by parsing JSON object from request body
exports.createTickets = function() {
    var input = request.readInputText();
    var requestBody = JSON.parse(input);
    var connection = datasource.getConnection();
    try {
        var sql = "INSERT INTO TICKETS (";
        sql += "TICKET_ID";
        sql += ",";
        sql += "TICKET_CLASS";
        sql += ",";
        sql += "TICKET_PRICE";
        sql += ",";
        sql += "TICKET_QUANTITY";
        sql += ",";
        sql += "TICKET_AVAILABLE";
        sql += ",";
        sql += "TRANSPORT_ID";
        sql += ") VALUES ("; 
        sql += "?";
        sql += ",";
        sql += "?";
        sql += ",";
        sql += "?";
        sql += ",";
        sql += "?";
        sql += ",";
        sql += "?";
        sql += ",";
        sql += "?";
        sql += ")";

        var statement = connection.prepareStatement(sql);
        var i = 0;
        var id = datasource.getSequence('TICKETS_TICKET_ID').next();
        statement.setInt(++i, id);
        statement.setString(++i, requestBody.ticket_class);
        statement.setDouble(++i, requestBody.ticket_price);
        statement.setInt(++i, requestBody.ticket_quantity);
        statement.setInt(++i, requestBody.ticket_available);
        statement.setInt(++i, requestBody.transport_id);
        statement.executeUpdate();
		response.println(id);
        return id;
    } catch(e) {
        var errorCode = response.BAD_REQUEST;
        exports.printError(errorCode, errorCode, e.message, sql);
    } finally {
        connection.close();
    }
    return -1;
};

// read single entity by id and print as JSON object to response
exports.readTicketsEntity = function(id) {
    var connection = datasource.getConnection();
    try {
        var result;
        var sql = "SELECT * FROM TICKETS WHERE " + exports.pkToSQL();
        var statement = connection.prepareStatement(sql);
        statement.setInt(1, id);
        
        var resultSet = statement.executeQuery();
        if (resultSet.next()) {
            result = createEntity(resultSet);
        } else {
        	exports.printError(response.NOT_FOUND, 1, "Record with id: " + id + " does not exist.", sql);
        }
        var jsonResponse = JSON.stringify(result, null, 2);
        response.println(jsonResponse);
    } catch(e){
        var errorCode = response.BAD_REQUEST;
        exports.printError(errorCode, errorCode, e.message, sql);
    } finally {
        connection.close();
    }
};

// read all entities and print them as JSON array to response
exports.readTicketsList = function(limit, offset, sort, desc) {
    var connection = datasource.getConnection();
    try {
        var result = [];
        var sql = "SELECT ";
        if (limit !== null && offset !== null) {
            sql += " " + datasource.getPaging().genTopAndStart(limit, offset);
        }
        sql += " * FROM TICKETS";
        if (sort !== null) {
            sql += " ORDER BY " + sort;
        }
        if (sort !== null && desc !== null) {
            sql += " DESC ";
        }
        if (limit !== null && offset !== null) {
            sql += " " + datasource.getPaging().genLimitAndOffset(limit, offset);
        }
        var statement = connection.prepareStatement(sql);
        var resultSet = statement.executeQuery();
        while (resultSet.next()) {
            result.push(createEntity(resultSet));
        }
        var jsonResponse = JSON.stringify(result, null, 2);
        response.println(jsonResponse);
    } catch(e){
        var errorCode = response.BAD_REQUEST;
        exports.printError(errorCode, errorCode, e.message, sql);
    } finally {
        connection.close();
    }
};

// read filtered entities and return as Json
exports.getFiltered =  function (type,fromCity, toCity,limit, offset,sort,desc){
 var connection = datasource.getConnection();
    try {
        var result = [];
        var sql = "SELECT ";
        if (limit !== null && offset !== null) {
            sql += " " + datasource.getPaging().genTopAndStart(limit, offset);
        }
        sql += " * FROM VIEW_TICKETS";
        if(type !==null && fromCity !== null && toCity !== null) {
    	sql += " WHERE TR.TRANSPORT_TYPE = " + "'" + type + "'" + "TR.DEPARTURE_CITY_ID = " + fromCity  + "TR.Arrival_city_id = " + toCity;    
    	}

        if (sort !== null) {
            sql += " ORDER BY " + sort;
        }
        if (sort !== null && desc !== null) {
            sql += " DESC ";
        }
        if (limit !== null && offset !== null) {
            sql += " " + datasource.getPaging().genLimitAndOffset(limit, offset);
        }
        var statement = connection.prepareStatement(sql);
        var resultSet = statement.executeQuery();
        while (resultSet.next()) {
            result.push(createEntity(resultSet));
        }
        var jsonResponse = JSON.stringify(result, null, 2);
        response.println(jsonResponse);
    } catch(e){
        var errorCode = response.BAD_REQUEST;
        exports.printError(errorCode, errorCode, e.message, sql);
    } finally {
        connection.close();
    }
};

//create entity as JSON object from ResultSet current Row
function createEntity(resultSet) {
    var result = {};
	result.ticket_id = resultSet.getInt("TICKET_ID");
    result.ticket_class = resultSet.getString("TICKET_CLASS");
    result.ticket_price = resultSet.getDouble("TICKET_PRICE");
	result.ticket_quantity = resultSet.getInt("TICKET_QUANTITY");
	result.ticket_available = resultSet.getInt("TICKET_AVAILABLE");
	result.transport_id = resultSet.getInt("TRANSPORT_ID");
    return result;
}

function convertToDateString(date) {
    var fullYear = date.getFullYear();
    var month = date.getMonth() < 10 ? "0" + date.getMonth() : date.getMonth();
    var dateOfMonth = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
    return fullYear + "/" + month + "/" + dateOfMonth;
}

// update entity by id
exports.updateTickets = function() {
    var input = request.readInputText();
    var responseBody = JSON.parse(input);
    var connection = datasource.getConnection();
    try {
        var sql = "UPDATE TICKETS SET ";
        sql += "TICKET_CLASS = ?";
        sql += ",";
        sql += "TICKET_PRICE = ?";
        sql += ",";
        sql += "TICKET_QUANTITY = ?";
        sql += ",";
        sql += "TICKET_AVAILABLE = ?";
        sql += ",";
        sql += "TRANSPORT_ID = ?";
        sql += " WHERE TICKET_ID = ?";
        var statement = connection.prepareStatement(sql);
        var i = 0;
        statement.setString(++i, responseBody.ticket_class);
        statement.setDouble(++i, responseBody.ticket_price);
        statement.setInt(++i, responseBody.ticket_quantity);
        statement.setInt(++i, responseBody.ticket_available);
        statement.setInt(++i, responseBody.transport_id);
        var id = responseBody.ticket_id;
        statement.setInt(++i, id);
        statement.executeUpdate();
		response.println(id);
    } catch(e){
        var errorCode = response.BAD_REQUEST;
        exports.printError(errorCode, errorCode, e.message, sql);
    } finally {
        connection.close();
    }
};

// delete entity
exports.deleteTickets = function(id) {
    var connection = datasource.getConnection();
    try {
    	var sql = "DELETE FROM TICKETS WHERE " + exports.pkToSQL();
        var statement = connection.prepareStatement(sql);
        statement.setString(1, id);
        statement.executeUpdate();
        response.println(id);
    } catch(e){
        var errorCode = response.BAD_REQUEST;
        exports.printError(errorCode, errorCode, e.message, sql);
    } finally {
        connection.close();
    }
};

exports.countTickets = function() {
    var count = 0;
    var connection = datasource.getConnection();
    try {
    	var sql = 'SELECT COUNT(*) FROM TICKETS';
        var statement = connection.prepareStatement(sql);
        var rs = statement.executeQuery();
        if (rs.next()) {
            count = rs.getInt(1);
        }
    } catch(e){
        var errorCode = response.BAD_REQUEST;
        exports.printError(errorCode, errorCode, e.message, sql);
    } finally {
        connection.close();
    }
    response.println(count);
};

exports.metadataTickets = function() {
	var entityMetadata = {
		name: 'tickets',
		type: 'object',
		properties: []
	};
	
	var propertyticket_id = {
		name: 'ticket_id',
		type: 'integer',
	key: 'true',
	required: 'true'
	};
    entityMetadata.properties.push(propertyticket_id);

	var propertyticket_class = {
		name: 'ticket_class',
		type: 'string'
	};
    entityMetadata.properties.push(propertyticket_class);

	var propertyticket_price = {
		name: 'ticket_price',
		type: 'double'
	};
    entityMetadata.properties.push(propertyticket_price);

	var propertyticket_quantity = {
		name: 'ticket_quantity',
		type: 'integer'
	};
    entityMetadata.properties.push(propertyticket_quantity);

	var propertyticket_available = {
		name: 'ticket_available',
		type: 'integer'
	};
    entityMetadata.properties.push(propertyticket_available);

	var propertytransport_id = {
		name: 'transport_id',
		type: 'integer'
	};
    entityMetadata.properties.push(propertytransport_id);


	response.println(JSON.stringify(entityMetadata));
};

exports.getPrimaryKeys = function() {
    var result = [];
    var i = 0;
    result[i++] = 'TICKET_ID';
    if (result === 0) {
        throw new Error("There is no primary key");
    } else if(result.length > 1) {
        throw new Error("More than one Primary Key is not supported.");
    }
    return result;
};

exports.getPrimaryKey = function() {
	return exports.getPrimaryKeys()[0].toLowerCase();
};

exports.pkToSQL = function() {
    var pks = exports.getPrimaryKeys();
    return pks[0] + " = ?";
};

exports.hasConflictingParameters = function(id, count, metadata) {
    if(id !== null && count !== null){
    	exports.printError(response.EXPECTATION_FAILED, 1, "Expectation failed: conflicting parameters - id, count");
        return true;
    }
    if(id !== null && metadata !== null){
    	exports.printError(response.EXPECTATION_FAILED, 2, "Expectation failed: conflicting parameters - id, metadata");
        return true;
    }
    return false;
}

// check whether the parameter exists 
exports.isInputParameterValid = function(paramName) {
    var param = request.getParameter(paramName);
    if(param === null || param === undefined){
    	exports.printError(response.PRECONDITION_FAILED, 3, "Expected parameter is missing: " + paramName);
        return false;
    }
    return true;
}

// print error
exports.printError = function(httpCode, errCode, errMessage, errContext) {
    var body = {'err': {'code': errCode, 'message': errMessage}};
    response.setStatus(httpCode);
    response.setHeader("Content-Type", "application/json");
    response.print(JSON.stringify(body));
    console.error(JSON.stringify(body));
    if (errContext !== null) {
    	console.error(JSON.stringify(errContext));
    }
}
