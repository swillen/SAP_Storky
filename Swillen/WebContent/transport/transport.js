
angular.module('transport', ['ngAnimate', 'ui.bootstrap', 'ngRoute']);

angular.module('transport').config(['$locationProvider', '$routeProvider',
    function config($locationProvider, $routeProvider) {
        $locationProvider.hashPrefix('!');
        $routeProvider.
            when('/tickets', {
                templateUrl: 'Views/viewTickets.html'
            }).
            otherwise('/');
    }
]);

angular.module('transport').controller('GetCitiesController', function ($scope, $http) {



    $scope.getCitiesByType = function () {

        var url = '../../js/City_Services/List_Cities.js';
        var type = $("#typeOfTransport").val();
        var finalURL = url + "?type=" + type;

        if (type === "Any") {
            finalURL = url + "?type=Any";
        }

        $http.get(finalURL)
            .success(function (data) {
                $scope.data = data;
            });

        url = '../../js/City_Services/List_arrival_Cities.js';
        finalURL = url + "?type=" + type;

        if (type === "Any") {
            finalURL = url + "?type=Any";
        }

        $http.get(finalURL).success(function (data) {
            $scope.arrivalCities = data;
        });

    }

    $scope.collectData = function () {

        var type = $("#typeOfTransport").val();
        var fromCity = $('#fromCity').val();
        var toCity = $('#toCity').val();
        var showDate = $("#datePicker").val();

        var url = '../../js/Ticket_Services/GetTickets_Service.js';
        var fullURL = url + "?type=" + type + "&from=" + fromCity + "&to=" + toCity + "&date=" + showDate;



        $http.get(fullURL).success(function (data) {
            $scope.dataTickets = data;
            $scope.noTickets = false;
            isEmpty(data);
        });


        function isEmpty(data) {
            if ($scope.dataTickets == 0) {
                $scope.noTickets = true;
            }
        }

        $scope.propertyName = 'ticket_price';
        $scope.reverse = true;
        
        $scope.sortBy = function(propertyName) {
            $scope.reverse = ($scope.propertyName === propertyName) ? $scope.reverse : false;
            $scope.propertyName = propertyName;
        }
    }
});
