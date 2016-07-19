'use strict'

  angular.module('page', ['ngAnimate', 'ui.bootstrap']);
        angular.module('page').controller('FilterTransportController', function ($scope, $http) {
        	$scope.collectData = function (){
        	
        	$scope.type = $("#typeOfTransport").val();
        	$scope.fromCity = $('#fromCity').val();
        	$scope.toCity = $('#toCity').val();
        	$scope.onDate = $('#').val();
        	
    	}

        })