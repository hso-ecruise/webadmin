'use strict';

/**
 * @ngdoc overview
 * @name adminApp
 * @description
 * # adminApp
 *
 * Main module of the application.
 */
var application = angular.module('adminApp', [
    'ngAnimate',
    'ngMaterial',
    'ngAria',
    'ngCookies',
    'ngMessages',
    'ngResource',
    'ngRoute',
    'ngSanitize'
]);

var checkRouting= function ($rootScope, $location, Helper) {
    
    var loggedIN = Helper.Cookie_Get("loggedIN");
    var token = Helper.Cookie_Get("token");
    var customerID = Helper.Cookie_Get("customerID");
    
    if(loggedIN !== "true"){
		loggedIN = false;
    }
    
    $rootScope.loggedIN = loggedIN;
    $rootScope.token = token;
    $rootScope.customerID = customerID;
    
    if ($rootScope.loggedIN === false || $rootScope.loggedIN === undefined)
    {
		if($rootScope.loggedIN === undefined){
			$rootScope.loggedIN = false;
		}
		
		console.log("FAILED ");
		alert("test");
		$location.path("/start");
    }
    else
    {
		//alert("true or other");
		//alert($rootScope.loggedIN);
    }
	
};

application.config(function ($routeProvider, $locationProvider){
    
	$routeProvider
	.when('/', {
	    templateUrl: 'views/start.html',
	    resolve: {
			factory: checkRouting
	    }

	})
	
	.when('/start', {
	    templateUrl: 'views/start.html',
		resolve: {
			factory: checkRouting
	    },
		controller: 'Ctrl_Main'
	})
	
	.when('/vehicles', {
		templateUrl: 'views/vehicles.html',
	    resolve: {
			factory: checkRouting
	    },
		controller: 'Ctrl_Vehicles'
	})
	
	.when('/stations', {
		templateUrl: 'views/stations.html',
	    resolve: {
			factory: checkRouting
	    },
		controller: 'Ctrl_Stations'
	})
	
    .when('/users', {
		templateUrl: 'views/users.html',
		resolve: {
			factory: checkRouting
	    },
		controller: 'Ctrl_Users'
	})
	
	.when('/bookings', {
		templateUrl: 'views/bookings.html',
		resolve: {
			factory: checkRouting
	    },
		controller: 'Ctrl_Bookings'
	})
	
	.when('/statistics', {
		templateUrl: 'views/statistics.html',
		resolve: {
			factory: checkRouting
	    },
		controller: 'Ctrl_Statistics'
	})
	
	.otherwise(
	{
		templateUrl : 'views/start.html',
		controller: 'Ctrl_Main'
		//template: 'NO PAGE'
	});
		
    $locationProvider
	.html5Mode(true);
	
});
