/* globals $ */
/* eslint-env node, dirigible */

var request = require("net/http/request");
var response = require("net/http/response");
var database = require("db/database");

var datasource = database.getDatasource();

// read all entities and print them as JSON array to response
exports.readView_ticketsList = function(limit, offset, sort, desc) {
    var connection = datasource.getConnection();
    try {
        var result = [];
        var sql = "SELECT ";
        if (limit !== null && offset !== null) {
            sql += " " + datasource.getPaging().genTopAndStart(limit, offset);
        }
        sql += " * FROM VIEW_TICKETS";
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
        exports.printError(errorCode, errorCode, e.message);
    } finally {
        connection.close();
    }
};

exports.getFiltered = function(type,fromCity,toCity,date,limit, offset, sort, desc) {
    var connection = datasource.getConnection();
    try {
        var result = [];
        var sql = "SELECT ";
        if (limit !== null && offset !== null) {
            sql += " " + datasource.getPaging().genTopAndStart(limit, offset);
        }
        sql += " * FROM VIEW_TICKETS";
        if(type !== null && fromCity !== null && toCity !== null && date !== null){
        if(type == "Any"){
       	 sql += " WHERE VIEW_TICKETS.DEPARTURE_CITY_ID = " + fromCity + " AND VIEW_TICKETS.ARRIVAL_CITY_ID = " + toCity + " AND VIEW_TICKETS.TRANSPORT_DEPARTURE_DATE='" + date + " 16:20:00.0'";
        }
        else {
        	sql += " WHERE VIEW_TICKETS.TRANSPORT_TYPE = '"+type+"' AND VIEW_TICKETS.DEPARTURE_CITY_ID = " + fromCity + " AND VIEW_TICKETS.ARRIVAL_CITY_ID = " + toCity + " AND VIEW_TICKETS.TRANSPORT_DEPARTURE_DATE='" + date + " 16:20:00.0'";
        }
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
        exports.printError(errorCode, errorCode, e.message);
    } finally {
        connection.close();
    }
};

//create entity as JSON object from ResultSet current Row
function createEntity(resultSet) {
    var result = {};
    result.transport_type = resultSet.getString("TRANSPORT_TYPE");
    result.ticket_class = resultSet.getString("TICKET_CLASS");
    result.ticket_price = resultSet.getDouble("TICKET_PRICE");
	result.ticket_available = resultSet.getInt("TICKET_AVAILABLE");
	result.departure_city_id = resultSet.getInt("DEPARTURE_CITY_ID");
    result.departure_city = resultSet.getString("DEPARTURE_CITY");
    if (resultSet.getTimestamp("TRANSPORT_DEPARTURE_DATE") !== null) {
        result.transport_departure_date = new Date(resultSet.getTimestamp("TRANSPORT_DEPARTURE_DATE").getTime());
    } else {
        result.transport_departure_date = null;
    }
    result.departure_country = resultSet.getString("DEPARTURE_COUNTRY");
    result.departure_long = resultSet.getDouble("DEPARTURE_LONG");
    result.departure_lat = resultSet.getDouble("DEPARTURE_LAT");
	result.arrival_city_id = resultSet.getInt("ARRIVAL_CITY_ID");
    result.arrival_city = resultSet.getString("ARRIVAL_CITY");
    if (resultSet.getTimestamp("TRANSPORT_ARRIVAL_DATE") !== null) {
        result.transport_arrival_date = new Date(resultSet.getTimestamp("TRANSPORT_ARRIVAL_DATE").getTime());
    } else {
        result.transport_arrival_date = null;
    }
    result.arrival_country = resultSet.getString("ARRIVAL_COUNTRY");
    result.arrival_long = resultSet.getDouble("ARRIVAL_LONG");
    result.arrival_lat = resultSet.getDouble("ARRIVAL_LAT");
    return result;
}

function convertToDateString(date) {
    var fullYear = date.getFullYear();
    var month = date.getMonth() < 10 ? "0" + date.getMonth() : date.getMonth();
    var dateOfMonth = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
    return fullYear + "/" + month + "/" + dateOfMonth;
}


exports.countView_tickets = function() {
    var count = 0;
    var connection = datasource.getConnection();
    try {
    	var sql = 'SELECT COUNT(*) FROM VIEW_TICKETS';
        var statement = connection.prepareStatement(sql);
        var rs = statement.executeQuery();
        if (rs.next()) {
            count = rs.getInt(1);
        }
    } catch(e){
        var errorCode = response.BAD_REQUEST;
        exports.printError(errorCode, errorCode, e.message);
    } finally {
        connection.close();
    }
    response.println(count);
};

exports.metadataView_tickets = function() {
	var entityMetadata = {
		name: 'view_tickets',
		type: 'object',
		properties: []
	};
	
	var propertytransport_type = {
		name: 'transport_type',
		type: 'string'
	};
    entityMetadata.properties.push(propertytransport_type);

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

	var propertyticket_available = {
		name: 'ticket_available',
		type: 'integer'
	};
    entityMetadata.properties.push(propertyticket_available);

	var propertydeparture_city_id = {
		name: 'departure_city_id',
		type: 'integer'
	};
    entityMetadata.properties.push(propertydeparture_city_id);

	var propertydeparture_city = {
		name: 'departure_city',
		type: 'string'
	};
    entityMetadata.properties.push(propertydeparture_city);

	var propertytransport_departure_date = {
		name: 'transport_departure_date',
		type: 'timestamp'
	};
    entityMetadata.properties.push(propertytransport_departure_date);

	var propertydeparture_country = {
		name: 'departure_country',
		type: 'string'
	};
    entityMetadata.properties.push(propertydeparture_country);

	var propertydeparture_long = {
		name: 'departure_long',
		type: 'double'
	};
    entityMetadata.properties.push(propertydeparture_long);

	var propertydeparture_lat = {
		name: 'departure_lat',
		type: 'double'
	};
    entityMetadata.properties.push(propertydeparture_lat);

	var propertyarrival_city_id = {
		name: 'arrival_city_id',
		type: 'integer'
	};
    entityMetadata.properties.push(propertyarrival_city_id);

	var propertyarrival_city = {
		name: 'arrival_city',
		type: 'string'
	};
    entityMetadata.properties.push(propertyarrival_city);

	var propertytransport_arrival_date = {
		name: 'transport_arrival_date',
		type: 'timestamp'
	};
    entityMetadata.properties.push(propertytransport_arrival_date);

	var propertyarrival_country = {
		name: 'arrival_country',
		type: 'string'
	};
    entityMetadata.properties.push(propertyarrival_country);

	var propertyarrival_long = {
		name: 'arrival_long',
		type: 'double'
	};
    entityMetadata.properties.push(propertyarrival_long);

	var propertyarrival_lat = {
		name: 'arrival_lat',
		type: 'double'
	};
    entityMetadata.properties.push(propertyarrival_lat);


	response.println(JSON.stringify(entityMetadata));
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

