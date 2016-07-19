/* globals $ */
/* eslint-env node, dirigible */

var request = require("net/http/request");
var response = require("net/http/response");
var database = require("db/database");

var datasource = database.getDatasource();

// create entity by parsing JSON object from request body
exports.createTransports = function() {
    var input = request.readInputText();
    var requestBody = JSON.parse(input);
    var connection = datasource.getConnection();
    try {
        var sql = "INSERT INTO TRANSPORTS (";
        sql += "TRANSPORT_ID";
        sql += ",";
        sql += "TRANSPORT_TYPE";
        sql += ",";
        sql += "TRANSPORT_DEPARTURE_DATE";
        sql += ",";
        sql += "TRANSPORT_ARRIVAL_DATE";
        sql += ",";
        sql += "DEPARTURE_CITY_ID";
        sql += ",";
        sql += "ARRIVAL_CITY_ID";
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
        var id = datasource.getSequence('TRANSPORTS_TRANSPORT_ID').next();
        statement.setInt(++i, id);
        statement.setString(++i, requestBody.transport_type);
        if (requestBody.transport_departure_date !== null) {
            var js_date_transport_departure_date =  new Date(Date.parse(requestBody.transport_departure_date));
            statement.setTimestamp(++i, js_date_transport_departure_date);
        } else {
            statement.setTimestamp(++i, null);
        }
        if (requestBody.transport_arrival_date !== null) {
            var js_date_transport_arrival_date =  new Date(Date.parse(requestBody.transport_arrival_date));
            statement.setTimestamp(++i, js_date_transport_arrival_date);
        } else {
            statement.setTimestamp(++i, null);
        }
        statement.setInt(++i, requestBody.departure_city_id);
        statement.setInt(++i, requestBody.arrival_city_id);
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
exports.readTransportsEntity = function(id) {
    var connection = datasource.getConnection();
    try {
        var result;
        var sql = "SELECT * FROM TRANSPORTS WHERE " + exports.pkToSQL();
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
exports.readTransportsList = function(limit, offset, sort, desc) {
    var connection = datasource.getConnection();
    try {
        var result = [];
        var sql = "SELECT ";
        if (limit !== null && offset !== null) {
            sql += " " + datasource.getPaging().genTopAndStart(limit, offset);
        }
        sql += " * FROM TRANSPORTS";
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
// read all entities by type and print them as JSON array to response
exports.readTransportsByType = function(type, limit, offset, sort, desc) {
    var connection = datasource.getConnection();
    try {
    	
        var result = [];
        var sql = "SELECT ";
        if (limit !== null && offset !== null) {
            sql += " " + datasource.getPaging().genTopAndStart(limit, offset);
        }
        sql += " * FROM TRANSPORTS";
        if (type !== null) {
    	sql += " WHERE TRANSPORT_TYPE = " + "'" + type +"'"  ;
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
	result.transport_id = resultSet.getInt("TRANSPORT_ID");
    result.transport_type = resultSet.getString("TRANSPORT_TYPE");
    if (resultSet.getTimestamp("TRANSPORT_DEPARTURE_DATE") !== null) {
        result.transport_departure_date = new Date(resultSet.getTimestamp("TRANSPORT_DEPARTURE_DATE").getTime());
    } else {
        result.transport_departure_date = null;
    }
    if (resultSet.getTimestamp("TRANSPORT_ARRIVAL_DATE") !== null) {
        result.transport_arrival_date = new Date(resultSet.getTimestamp("TRANSPORT_ARRIVAL_DATE").getTime());
    } else {
        result.transport_arrival_date = null;
    }
	result.departure_city_id = resultSet.getInt("DEPARTURE_CITY_ID");
	result.arrival_city_id = resultSet.getInt("ARRIVAL_CITY_ID");
    return result;
}

function convertToDateString(date) {
    var fullYear = date.getFullYear();
    var month = date.getMonth() < 10 ? "0" + date.getMonth() : date.getMonth();
    var dateOfMonth = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
    return fullYear + "/" + month + "/" + dateOfMonth;
}

// update entity by id
exports.updateTransports = function() {
    var input = request.readInputText();
    var responseBody = JSON.parse(input);
    var connection = datasource.getConnection();
    try {
        var sql = "UPDATE TRANSPORTS SET ";
        sql += "TRANSPORT_TYPE = ?";
        sql += ",";
        sql += "TRANSPORT_DEPARTURE_DATE = ?";
        sql += ",";
        sql += "TRANSPORT_ARRIVAL_DATE = ?";
        sql += ",";
        sql += "DEPARTURE_CITY_ID = ?";
        sql += ",";
        sql += "ARRIVAL_CITY_ID = ?";
        sql += " WHERE TRANSPORT_ID = ?";
        var statement = connection.prepareStatement(sql);
        var i = 0;
        statement.setString(++i, responseBody.transport_type);
        if (responseBody.transport_departure_date !== null) {
            var js_date_transport_departure_date =  new Date(Date.parse(responseBody.transport_departure_date));
            statement.setTimestamp(++i, js_date_transport_departure_date);
        } else {
            statement.setTimestamp(++i, null);
        }
        if (responseBody.transport_arrival_date !== null) {
            var js_date_transport_arrival_date =  new Date(Date.parse(responseBody.transport_arrival_date));
            statement.setTimestamp(++i, js_date_transport_arrival_date);
        } else {
            statement.setTimestamp(++i, null);
        }
        statement.setInt(++i, responseBody.departure_city_id);
        statement.setInt(++i, responseBody.arrival_city_id);
        var id = responseBody.transport_id;
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
exports.deleteTransports = function(id) {
    var connection = datasource.getConnection();
    try {
    	var sql = "DELETE FROM TRANSPORTS WHERE " + exports.pkToSQL();
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

exports.countTransports = function() {
    var count = 0;
    var connection = datasource.getConnection();
    try {
    	var sql = 'SELECT COUNT(*) FROM TRANSPORTS';
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

exports.metadataTransports = function() {
	var entityMetadata = {
		name: 'transports',
		type: 'object',
		properties: []
	};
	
	var propertytransport_id = {
		name: 'transport_id',
		type: 'integer',
	key: 'true',
	required: 'true'
	};
    entityMetadata.properties.push(propertytransport_id);

	var propertytransport_type = {
		name: 'transport_type',
		type: 'string'
	};
    entityMetadata.properties.push(propertytransport_type);

	var propertytransport_departure_date = {
		name: 'transport_departure_date',
		type: 'timestamp'
	};
    entityMetadata.properties.push(propertytransport_departure_date);

	var propertytransport_arrival_date = {
		name: 'transport_arrival_date',
		type: 'timestamp'
	};
    entityMetadata.properties.push(propertytransport_arrival_date);

	var propertydeparture_city_id = {
		name: 'departure_city_id',
		type: 'integer'
	};
    entityMetadata.properties.push(propertydeparture_city_id);

	var propertyarrival_city_id = {
		name: 'arrival_city_id',
		type: 'integer'
	};
    entityMetadata.properties.push(propertyarrival_city_id);


	response.println(JSON.stringify(entityMetadata));
};

exports.getPrimaryKeys = function() {
    var result = [];
    var i = 0;
    result[i++] = 'TRANSPORT_ID';
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
    	response.printError(response.EXPECTATION_FAILED, 1, "Expectation failed: conflicting parameters - id, count");
        return true;
    }
    if(id !== null && metadata !== null){
    	response.printError(response.EXPECTATION_FAILED, 2, "Expectation failed: conflicting parameters - id, metadata");
        return true;
    }
    return false;
}

// check whether the parameter exists 
exports.isInputParameterValid = function(paramName) {
    var param = request.getParameter(paramName);
    if(param === null || param === undefined){
    	response.printError(response.PRECONDITION_FAILED, 3, "Expected parameter is missing: " + paramName);
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
