'use strict';

application.controller('Ctrl_Stations', function ($rootScope, $scope, RESTFactory, Helper, $mdDialog) {

	var stations_all = {};
	
	var markers = [];
	
	
	var map = new google.maps.Map(document.getElementById('map_stations'), {
        zoom: 16,
        center: new google.maps.LatLng(49.5, 8.434),
        mapTypeId: 'roadmap'
    });
	
	var icons = {
        station_available:{
            icon: "images/icons/station_available.png"
        },
        station_occupied:{
            icon: "images/icons/station_occupied.png"
        }
    };
	
	function AddMarker(title, content, image_string, lat, lon){

        var img = {
            url: 'images/icons/car_available.png',
            scaledSize: new google.maps.Size(60, 87),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(30, 87)
        };

        img.url = icons[image_string].icon;

        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(lat, lon),
            map: map,
            icon: img
        });

        marker.addListener('click', function(event){
            alert = $mdDialog.alert({
                title: title,
                textContent: content,
                ok: 'OK'
            });

            $mdDialog
                .show( alert )
                .finally(function() {
                alert = undefined;
            });
        });
		
		markers.push(marker);
		
    }
	
	function Delete_Markers(){
		
		for(var i = 0; i < markers.length; i++){
			markers[i].setMap(null);
		}
		
		markers = [];
		
	}
	
	function Update_ID(id){
		new Update("ID", id);
	}
	
	function Update(type, value){
		
		stations_all = {};
		
		$scope.station_selected = "false";
		
		$scope.editDisabled = "true";
		
		$scope.view = "info";
		
		new Delete_Markers();
		
		var prom = {};
		
		if(type === "ID"){
			prom = RESTFactory.Charging_Stations_Get_Charging_StationID(value);
		}else{
			prom = RESTFactory.Charging_Stations_Get();
		}
		
		prom.then(function(response){
			
			var data = [];
			
			if(type === "ID"){
				data.push(response.data);
			}else{
				data = response.data;
			}
			
			for(var i = 0; i < data.length; i++){
				
				var data_use = data[i];
				
				var station = {};
				
				var ID_STR = data_use.chargingStationId;
				
				station.stationID = data_use.chargingStationId;
				station.slots = data_use.slots;
				station.slotsOccupied = data_use.slotsOccupuied;	//slotsOccupied
				station.lat = data_use.latitude;
				station.lon = data_use.longitude;
				
				stations_all[ID_STR] = station;
				$scope.stations = stations_all;
				$scope.$apply();
				
				var diff = station.slots - station.slotsOccupied;
				var title = "Ladestation";
				var content =  diff + " von " + station.slots + " Slots frei";
				
				if(diff === 0){
					new AddMarker(title, content, "station_occupied", station.lat, station.lon);
				}else{
					new AddMarker(title, content, "station_available", station.lat, station.lon);
				}
				
				
				//GET CUSTOMER
				Helper.Get_Address(station.lat, station.lon).then(function(address){
					
					station.address = address;
				
					stations_all[ID_STR] = station;
					$scope.stations = stations_all;
					$scope.$apply();
				
				}, function(response){
					
					station.address = {};
					
					station.address.street = "Error";
					
				});
				
			}
			
		}, function(response){
			
			$scope.stations = stations_all;
			$scope.$apply();
		
		});
		
	}
	
	function Load_Details(id){
		
		new DisabledEditMode();
		
		RESTFactory.Charging_Stations_Get_Charging_StationID(id).then(function(response){
			
			$scope.station_selected = "true";
			
			var data_use = response.data;
			
			var station = {};
			
			station.stationID = data_use.chargingStationId;
			station.slots = data_use.slots;
			station.slotsOccupied = data_use.slotsOccupuied;
			station.lat = data_use.latitude;
			station.lon = data_use.longitude;
			
			$scope.currentStation = station;
			$scope.$apply();
			
			
			//GET CUSTOMER
			Helper.Get_Address(station.lat, station.lon).then(function(address){
				
				station.address = address;
				
				$scope.currentStation = station;
				$scope.$apply();
				
			}, function(response){
				
			});
			
		}, function(response){
			
			$scope.station_selected = "false";
			$scope.$apply();			
			
		});
		
	}
	
	
	
	function EnableEditMode(){
		$scope.editDisabled = false;
	}
	
	function DisabledEditMode(){
		$scope.editDisabled = true;
	}
	
	
	/*
	var Safe_Changes = function(){
		
		var station = $scope.currentStation;
		
		var stationID = station.stationID;
		
		//REST CALL TO MAKE CHANGES
		
	};
	
	var Dismiss_Changes = function(){
		Load_Details($scope.currentStation.stationID);
	};
	*/
	
	
	function Safe_New(){
		
		if($scope.new_station.hasPosition === false){
			alert("Bitte Position auf Karte markieren");
			return;
		}
		
		var station = {};
		
		station.slots = $scope.new_station.slots;
		station.slotsOccupied = $scope.new_station.slotsOccupied;
		station.latitude = $scope.new_station.lat;
		station.longitude = $scope.new_station.lon;
		
		RESTFactory.Charging_Stations_Post(station).then(function(response){
			alert("Ladestation erfolgreich hinzugefügt");
			new Hide_AddStation();
			setTimeout(Update, 1000);
		}, function(response){
			alert("Ladestation konnte nicht hinzugefügt werden");
			new Hide_AddStation();
			setTimeout(Update, 1000);
		});
		
	}
	
	function Dismiss_New(){
		
		new Hide_AddStation();
		
	}
	
	
	
	function Show_AddStation(){
		
		$scope.view = "add";
		
		var new_station = {};
		
		new_station.slots = 0;
		new_station.slotsOccupied = 0;
		new_station.lat = 0;
		new_station.lon = 0;
		new_station.address_state = "false";
		new_station.hasPosition = false;

		
		$scope.new_station = new_station;
		
		function Init_Map(){
			
			var map2 = new google.maps.Map(document.getElementById('map_station_new'), {
				zoom: 16,
				center: new google.maps.LatLng(49.5, 8.434),
				mapTypeId: 'roadmap'
			});
			
			map2.addListener("click", function(event){

				var lat = event.latLng.lat();
				var lon = event.latLng.lng();
				
				$scope.new_station.lat = lat;
				$scope.new_station.lon = lon;
				$scope.new_station.hasPosition = true;
				
				Helper.Get_Address(lat, lon).then(function(address){
					$scope.new_station.address_state = "true";
					$scope.new_station.address = address;
				}, function(response){
					$scope.new_station.address_state = "false";
				});

			});
		}
		
		setTimeout(Init_Map, 2000);
		
	}
	
	function Hide_AddStation(){
		$scope.new_station = {};
		$scope.view = "info";
		$scope.station_selected = "false";
		$scope.$apply();
	}
	
	
	
	
	$scope.EnableEditMode = function(){
		new EnableEditMode();
	};
	
	$scope.Load_Details = function(id){
		new Load_Details(id);
	};
	
	/*
	$scope.Safe_Changes = function(){
		Safe_Changes();
	};
	
	$scope.Dismiss_Changes = function(){
		Dismiss_Changes();
	};
	*/
	
	$scope.Safe_New = function(){
		new Safe_New();
	};
	
	$scope.Dismiss_New = function(){
		new Dismiss_New();
	};
	
	$scope.Show_AddStation = function(){
		new Show_AddStation();
	};
	
	$scope.Hide_AddStation = function(){
		new Hide_AddStation();
	};
	
	$scope.Enter_Search = function(){
		
		var search = $scope.searchQuery;
		
		if(search === undefined || search.length === 0){
			new Update("ALL", undefined);
		}else{
			new Update_ID(search);			
		}

	};
	
	function Init(){
		
		new Update("ALL", undefined);
		
	}

	new Init();
	
});