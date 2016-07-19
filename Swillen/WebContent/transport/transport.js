'use strict' 

        angular.module('page', ['ngAnimate', 'ui.bootstrap']);
        angular.module('page').controller('GetCitiesController', function ($scope, $http) {
			
			$scope.getDate = function() {
			$scope.showDate = $("#datePicker").val();
			}

            var url = '../../js/City_Services/List_Cities.js';
            
			$scope.getCitiesByType = function (){
			var type = $("#typeOfTransport").val();
			var finalURL = url + "?type=" + type;
			if(type === "Any") {
			finalURL = url;
			}

			
            $http.get(finalURL)
			.success(function (data) {
			    $scope.data = data;
			});

            $scope.showEntry = false;
            $scope.selectedEntry;

            $scope.showInfoForEntry = function (entry) {
                if ($scope.selectedEntry === entry) {
                    $scope.showEntry = false;
                    $scope.selectedEntry = null;
                } else {
                    $scope.showEntry = true;
                    $scope.selectedEntry = entry;
                }
            }

            $scope.formats = ['yyyy/MM/dd', 'dd-MMMM-yyyy', 'dd.MM.yyyy', 'shortDate'];
            $scope.format = $scope.formats[0];
        }
        
           	$scope.collectData = function (){
        	
        	$scope.type = $("#typeOfTransport").val();
        	$scope.fromCity = $('#fromCity').val();
        	$scope.toCity = $('#toCity').val();
        	$scope.showDate = $("#datePicker").val();

			var url = ''
    	}

});
