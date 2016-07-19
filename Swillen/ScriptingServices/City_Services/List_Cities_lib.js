/* globals $ */
/* eslint-env node, dirigible */

var request = require("net/http/request");
var response = require("net/http/response");
var database = require("db/database");

var datasource = database.getDatasource();

// read all entities and print them as JSON array to response
exports.readView_citiesList = function(limit, offset, sort, desc) {
    var connection = datasource.getConnection();
    try {
        var result = [];
        var sql = "SELECT ";
        if (limit !== null && offset !== null) {
            sql += " " + datasource.getPaging().genTopAndStart(limit, offset);
        }
        sql += " * FROM VIEW_CITIES";
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

//read entities by chosen type (e.g Airplane)
exports.readView_citiesListByType = function(type, limit, offset, sort, desc) {
    var connection = datasource.getConnection();
    try {
        var result = [];
        var sql = "SELECT ";
        if (limit !== null && offset !== null) {
            sql += " " + datasource.getPaging().genTopAndStart(limit, offset);
        }
        sql += " * FROM VIEW_CITIES";
         if (type !== null) {
    	sql += " WHERE TRANSPORT_TYPE = " + "'" +type+ "'"  ;
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
    result.airport_city = resultSet.getString("AIRPORT_CITY");
    result.airport_latitude = resultSet.getDouble("AIRPORT_LATITUDE");
    result.airport_longitude = resultSet.getDouble("AIRPORT_LONGITUDE");
    result.airport_country = resultSet.getString("AIRPORT_COUNTRY");
    result.airport_timezone = resultSet.getDouble("AIRPORT_TIMEZONE");
    return result;
}

function convertToDateString(date) {
    var fullYear = date.getFullYear();
    var month = date.getMonth() < 10 ? "0" + date.getMonth() : date.getMonth();
    var dateOfMonth = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
    return fullYear + "/" + month + "/" + dateOfMonth;
};


exports.countView_cities = function() {
    var count = 0;
    var connection = datasource.getConnection();
    try {
    	var sql = 'SELECT COUNT(*) FROM VIEW_CITIES';
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



exports.metadataView_cities = function() {
	var entityMetadata = {
		name: 'view_cities',
		type: 'object',
		properties: []
	};
	var propertytransport_type = {
	name: 'tranport_type',
	type: 'string'
}
	entityMetadata.properties.push(propertytransport_type);
	var propertyairport_city = {
		name: 'airport_city',
		type: 'string'
	};
    entityMetadata.properties.push(propertyairport_city);

	var propertyairport_latitude = {
		name: 'airport_latitude',
		type: 'double'
	};
    entityMetadata.properties.push(propertyairport_latitude);

	var propertyairport_longitude = {
		name: 'airport_longitude',
		type: 'double'
	};
    entityMetadata.properties.push(propertyairport_longitude);

	var propertyairport_country = {
		name: 'airport_country',
		type: 'string'
	};
	entityMetadata.properties.push(propertyairport_country);
	
	var propertyairport_timezone = {
	name: "airport_timezone",
	type: "double"
};
	entityMetadata.properties.push(propertyairport_timezone);



	exports.println(JSON.stringify(entityMetadata));
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
};

// check whether the parameter exists 
exports.isInputParameterValid = function(paramName) {
    var param = request.getParameter(paramName);
    if(param === null || param === undefined){
    	exports.printError(response.PRECONDITION_FAILED, 3, "Expected parameter is missing: " + paramName);
        return false;
    }
    return true;
};

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
};
