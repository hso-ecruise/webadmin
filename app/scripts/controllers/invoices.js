'use strict';

/**
 * @ngdoc function
 * @name adminApp.controller:BookingsCtrl
 * @description
 * # BookingsCtrl
 * give some description here
 */
 
application.controller('Ctrl_Invoices', function ($rootScope, $scope, RESTFactory, Helper, $mdDialog) {
	
	var invoices_all = {};
	
	
	function Update_ID(id){
		new Update("ID", id);
	}
	
	function Update(type, value){
		
		invoices_all = {};
		
		$scope.invoice_selected = "false";
		
		$scope.view = "info";
		
		var prom = {};
		
		if(type === "ID"){
			prom = RESTFactory.Invoices_Get_InvoiceID(value);
		}else{
			prom = RESTFactory.Invoices_Get();
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
				
				var invoice = {};
				
				var ID_STR = data_use.invoiceId;
				
				
				invoice.invoiceID = data_use.invoiceId;
				invoice.totalAmount = data_use.totalAmount;
				invoice.customerID = data_use.customerId;
				invoice.paid = data_use.paid;
				invoice.paidText = "Nicht bezahlt";
				if(invoice.paid === true){ invoice.paidText = "Bezahlt"; }
				
				invoice.customerState = "false";
				
				invoices_all[ID_STR] = invoice;
				
				$scope.invoices = invoices_all;
				$scope.$apply();
				
				
				//GET CUSTOMER
				RESTFactory.Customers_Get_CustomerID(invoice.customerID).then(function(response){
					
					var custom_data = response.data;
					
					var customer = {};
					
					customer.customerID = custom_data.customerId;
					customer.name = custom_data.firstName;
					customer.familyName = custom_data.lastName;
					
					invoice.customer = customer;
					invoice.customerState = "true";
					
					invoices_all[ID_STR] = invoice;
					$scope.invoices = invoices_all;
					$scope.$apply();
					
				}, function(response){
					
				});
				
			}
			
			
		}, function(response){
			
			$scope.invoices = invoices_all;
			$scope.$apply();
			
		});
		
		
	}
	
	function Load_Details(id){
		
		$scope.invoice_selected = "true";
		
		RESTFactory.Invoices_Get_InvoiceID(id).then(function(response){
			
			var data_use = response.data;
			
			var invoice = {};
			
			invoice.invoiceID = data_use.invoiceId;
			invoice.totalAmount = data_use.totalAmount;
			invoice.customerID = data_use.customerId;
			invoice.paid = data_use.paid;
			invoice.paidText = "Nicht bezahlt";
			if(invoice.paid === true){ invoice.paidText = "Bezahlt"; }
			
			invoice.customer = {};
			invoice.customerState = "false";
			
			invoice.items = {};
			invoice.itemState = "false";
			
			$scope.currentInvoice = invoice;
			$scope.$apply();
			
			
			//GET CUSTOMER
			RESTFactory.Customers_Get_CustomerID(invoice.customerID).then(function(response){
				
				
				var custom_data = response.data;
				
				var customer = {};
				
				customer.customerID = custom_data.customerId;
				customer.name = custom_data.firstName;
				customer.familyName = custom_data.lastName;
				
				invoice.customer = customer;
				invoice.customerState = "true";
				
				console.log(invoice);
				
				$scope.currentInvoice = invoice;
				$scope.$apply();
				
			}, function(response){
				
			});
			
			//GET INVOICE ITEMS
			RESTFactory.Invoices_Get_Items(invoice.invoiceID).then(function(response){
				
				var data = response.data;
				
				for(var i = 0; i < data.length; i++){
					
					var data_use = data[i];
					
					var item = {};
					
					item.itemID = data_use.invoiceItemId;
					item.invoiceID = data_use.invoiceId;
					item.reason = data_use.reason;
					item.type = data_use.type;
					item.amount = data_use.amount;
					
					invoice.items[item.itemID] = item;
					
				}
				
				if(data.length > 0){
					invoice.itemState = "true";
				}
				
				
				$scope.currentInvoice = invoice;
				$scope.$apply();
				
			}, function(response){
				
			});
		
		}, function(response){
			
		});
		
	}
	
	
	
	function Safe_New(){
		
		var invoice = {};
		
		invoice.paid = $scope.new_invoice.paid;
		invoice.totalAmount = $scope.new_invoice.totalAmount;
		invoice.customerId = $scope.new_invoice.customerID;
		
		RESTFactory.Invoices_Post(invoice).then(function(response){
			alert("Rechnung wurde erfolgreich ausgeführt");
			new Hide_AddBooking();
			setTimeout(Update, 2000);
		}, function(response){
			alert("Rechnung fehlgeschlagen");
			new Hide_AddInvoice();
			setTimeout(Update, 2000);
		});
		
	}
	
	function Dismiss_New(){
		
		new Hide_AddInvoice();
		
	}
	
	
	function Show_AddInvoice(){
		
		$scope.view = "add";

		var new_invoice = {};
		
		new_invoice.paid = false;
		new_invoice.totalAmount = 0;
		new_invoice.customerID = 0;
		
		$scope.new_invoice = new_invoice;

	}
	
	function Hide_AddInvoice(){
		$scope.new_invoice = {};
		$scope.view = "info";
		$scope.invoice_selected = "false";
		$scope.$apply();
	}
	
	
	function Show_AddItem_PopUp(invoiceID){

        $mdDialog.show({
            clickOutsideToClose: true,
            scope: $scope,
            preserveScope: true,
            template:
            '<md-dialog class="booking-dialog">'+
            '	<md-dialog-content>' +

            '		<md-toolbar class="md-hue-2">' +
            '			<div class="md-toolbar-tools">' +
            '				<h2 class="md-flex">Elementinformationen eingeben</h2>' +
            '			</div>' +
            '		</md-toolbar>' +

            '		<md-content flex layout-padding>' +
            '			<div>' +
            '				<label> RechnungsID: {{ item.invoiceID }} </label>' +
            '			</div>' +
            '		</md-content>' +

            '		<md-content flex layout-padding>' +
            '			<md-input-container>' +
            '				<input type="text" placeholder="Grund" class="md-input" ng-model="item.reason" ng-required="true" >' +   
            '			</md-input-container>' +
			
            '			<md-input-container>' +
            '				<input type="text" placeholder="Preis" class="md-input" ng-model="item.amount" pattern="\\d+(,\\d{2})?" ng-required="true" >' +
            '			</md-input-container>' +
			
            '			<md-input-container>' +
            '				<input type="text" placeholder="Typ" class="md-input" ng-model="item.type" ng-required="true" >' +
            '			</md-input-container>' +
            '		</md-content>' +

            '		<md-content flex layout-padding>' +
            '			<md-button class="md-raised md-primary button-to-right" ng-click="Save()"> Speichern </md-button>' +
            '			<md-button class="md-primary md-hue-1 button-to-right" ng-click="closeDialog()"> Verwerfen </md-button>' +
            '		</md-content>' +

            '	</md-dialog-content>' +
            '</md-dialog>',

            controller: function DialogController($scope, $mdDialog){

				var item = {};
				
				item.invoiceID = invoiceID;
				item.reason = "";
				item.amount = "0,00";
				item.type = "Rechnung";	//Gutschrift
				
                $scope.item = item;
				

                $scope.closeDialog = function(){
                    $mdDialog.hide();
                };

                $scope.Save = function(){
					
					var item = $scope.item;
					
					var data = {
						invoiceId: item.invoiceID,
						amount: parseFloat(item.amount),
						reason: item.reason,
						type: item.type
					};
					
					console.log(data);
					
					
					RESTFactory.Invoices_Post_Items(invoiceID, data).then(function(response){
						alert("Element erfolgreich hinzugefügt");
					}, function(response){
						alert("Element hinzufügen fehlgeschlagen");
					});
					
                    $scope.closeDialog();
                };

            }
        });
		
	}
	
	
	$scope.Load_Details = function(input){
		new Load_Details(input);
	};
	
	
	$scope.Safe_New = function(){
		new Safe_New();
	};
	
	$scope.Dismiss_New = function(){
		new Hide_AddBooking();
	};

	
	$scope.Show_AddInvoice = function(){
		new Show_AddInvoice();
	};
	
	$scope.Hide_AddInvoice = function(){
		new Hide_AddInvoice();
	};
	
	$scope.Enter_Search = function(){
		
		var search = $scope.searchQuery;
		
		console.log(search);
		
		if(search === undefined || search.length === 0){
			new Update("ALL", undefined);
		}else{
			new Update_ID(search);			
		}

	};
	
	
	$scope.ShowItemAddPopUp = function(id){
		new Show_AddItem_PopUp(id);
	};
	
	
	
	function Init(){
		
		new Update();
		
	}
	
	new Init();
	
});