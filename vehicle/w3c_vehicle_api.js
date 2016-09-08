/* Copyright (C) OBIGO Ltd., 2013.
All rights reserved.
 
This software is covered by the license agreement between
the end user and OBIGO Ltd., and may be
used and copied only in accordance with the terms of the
said agreement.
 
OBIGO Ltd. assumes no responsibility or
liability for any errors or inaccuracies in this software,
or any consequential, incidental or indirect damage arising
out of the use of the software. */


// code	    		message				meaning
// -32700			Parse error			Invalid JSON was received by the server.
// An error occurred on the server while parsing the JSON text./
// -32600			Invalid Request		The JSON sent is not a valid Request object.
// -32601			Method not found	The method does not exist / is not available.
// -32602			Invalid params		Invalid method parameter(s).
// -32603			Internal error		Internal JSON-RPC error.
// -32604 			Access Deny         API Access Deny
// -32605           Duplicate Listener  Duplicate AddListener by application
// -32000			Service error    	Service Not available
// -32001           Unknown error 		Unknown Error
//  to -32099		Server error		Reserved for implementation-defined server-errors.

var vehicleErrorType = {};
	vehicleErrorType.ParseError = -32700;
	vehicleErrorType.InvalidRequest = -32600;
	vehicleErrorType.MethodNotFound = -32601;
	vehicleErrorType.InvalidParams = -32602;
	vehicleErrorType.InternalError = -32603;
	vehicleErrorType.AccessDeny = -32604;
	vehicleErrorType.DuplicateListener = -32605;
	vehicleErrorType.ServiceError = -32000;
	vehicleErrorType.UnknownError = -32001;
	vehicleErrorType.ServerError = -32099;

(function() {
	var OBJECT = "vehicle";
	var get_app_identify = function() {
		this.app = AppManager.getOwnerApplication();
		var widgets = window.applicationManager.widgets;
		for (var i = 0; i < widgets.length; i++) {
			if (widgets.item(i).id == app.id)
				return widgets.item(i).widgetID;
		}
		return null;
	}
    //var APPID = get_app_identify().toString();
    var APPID = null;
	
	var REQUEST_MSG = 1001;
	var RESPONSE_MSG = 1002;
	var NOTIFICATION_MSG = 1003;
	var BC_NOTIFICATION_MSG = 1004;
	var ERROR_MSG = 1005;

	var request_json = {"jsonrpc" : 2.0,
					    "app_id" : null, 
					    "id": null, 
					    "method":""};

	var errorhandler = null;
	var wSocket = null;
	var callBack = {
		lst: {},
		// get, set
		push: function(etype, meth, suc, err) {
			var obj = {}
			obj.id = (window.performance.now()).toString();
			obj.type = etype;
			obj.method = meth;
			obj.handle1 = suc;
			obj.handle2 = err;
			this.lst[obj.id] = obj;

			return obj.id;
		},
		pop: function(etype) {
			var result =  this.lst[etype];
			if (result) delete this.lst[etype];
			return result;
		},
		clear: function() {
			this.lst = {};
		}
	}

	var listenerCallBack = {
		lst: {},
		push: function(etype, handle) {
			if (handle) {
				if (this.lst[etype])
					this.lst[etype].push(handle);
				else
					this.lst[etype] = [handle];
			}
		},
		pop: function(etype, handle) {
			if (handle) {
				var handle_lst = this.lst[etype];
				if (handle_lst) {
					for (var i=0; i<handle_lst.length; i++) {
						if (handle_lst[i] == handle) {
							handle_lst.splice(i, 1);
							if (handle_lst.length == 0)
								this.lst[etype] = undefined;
							return;
						}
					}
				}
			}
		},
		get: function(etype) {
			return this.lst[etype];
		},
		clear: function() {
			this.lst = {};
		}
	}

	var error = function(err_callback, message) {
		if (err_callback != null) {
			err_callback (message);
		}
	}

	var msgObject = {
		msg_type : 0,
		method_type : "",
		event_type : null,
		json : "",
		init : function(data) {
			this.json = JSON.parse(data);
			var result_field = null, id_field = null, err_field = null, appid_field = null;
			try { result_field = this.json.result; } catch (err) {}
			try { id_field = this.json.id; } catch (err) {}
			try { err_field = this.json.error; } catch (err) {}
			try { appid_field = this.json.app_id; } catch (err) {}

			if (result_field) {
				if (id_field)
					this.msg_type = RESPONSE_MSG;
				else
					if (appid_field)
						this.msg_type = NOTIFICATION_MSG;
					else
						this.msg_type = BC_NOTIFICATION_MSG;
			} else if (err_field) {
				this.msg_type = ERROR_MSG;
			} else if (appid_field) {
				console.log("REQUEST MESSAGE");
				msg_type = REQUEST_MSG;
			}

			var lst_str = this.json.method.split(".");
			var lst_len = lst_str.length;
			if (lst_str.length == 3) {
				this.method_type = lst_str[1];
				this.event_type = lst_str[2];
			} else if (lst_str.length == 2) {
				this.method_type = "get";
				this.event_type = lst_str[1];
			}

			if ((this.msg_type != BC_NOTIFICATION_MSG) && ((this.method_type == "addListener") || (this.method_type == "removeListener")))
				this.msg_type = NOTIFICATION_MSG;
		}
	}

	var createSocket = function() {
		var soc = new WebSocket("ws://localhost:18892/webapp/" + OBJECT);
		soc.onmessage = function(evt) { 
			var message = msgObject;
			message.init(evt.data);
			//self.message_handler(message);
			if (message.msg_type == RESPONSE_MSG) {
				var function_handle = callBack.pop(message.json.id);
				if (function_handle && function_handle.handle1) 
					function_handle.handle1(message.json.result);
			} else if (message.msg_type == ERROR_MSG) {
				var function_handle = callBack.pop(message.json.id);
				if (function_handle && function_handle.handle2) 
					function_handle.handle2(message.json.error);
			} else if (message.msg_type == NOTIFICATION_MSG) {
				if (message.method_type == "addListener") {
					var handler_lst = listenerCallBack.get(message.event_type);
					for (index in handler_lst) {
						if (message.json.result)
							handler_lst[index](message.json.result);
						else if (message.json.error)
							handler_lst[index](message.json.error);
						else
							console.log ("undefine result");
					}
				}
			} else if (message.msg_type == BC_NOTIFICATION_MSG) {
				if (errorhandler) errorhandler(message.json.result);
			} else { console.log ("unknown json message"); }
		}

		soc.send_data = function(func, param) {
			if (wSocket.readyState != 1 /*OPEN*/) return false;
			if (param) func["params"] = param;
			wSocket.send(JSON.stringify(func));
			return true;
		}

		return soc;
	}

	var api_object = {
		// Const Value

		// Evnet Type
		zones : "zones",
		supported : "supported",
		availableForRetrievals : "availableForRetrievals",
		availableForSettings : "availableForSettings",
		availableForSubscriptions : "availableForSubscriptions",
		identification : "identification",
		sizeConfiguration : "sizeConfiguration",
		fuelConfiguration : "fuelConfiguration",
		transmissionConfiguration : "transmissionConfiguration",
		wheelConfiguration : "wheelConfiguration",
		steeringWheelConfiguration : "steeringWheelConfiguration",
		engineStatus : "engineStatus",
		vehicleSpeed : "vehicleSpeed",
		wheelSpeed : "wheelSpeed",
		engineSpeed : "engineSpeed",
		vehiclePowerModeType : "vehiclePowerModeType",
		powertrainTorque : "powertrainTorque",
		acceleratorPedalPosition : "acceleratorPedalPosition",
		throttlePosition : "throttlePosition",
		tripMeters : "tripMeters",
		transmission : "transmission",
		cruiseControlStatus : "cruiseControlStatus",
		lightStatus : "lightStatus",
		interiorLightStatus : "interiorLightStatus",
		horn : "horn",
		chime : "chime",
		fuel : "fuel",
		engineOil : "engineOil",
		acceleration : "acceleration",
		engineCoolant : "engineCoolant",
		steeringWheel : "steeringWheel",
		wheelTick : "wheelTick",
		ignitionTime : "ignitionTime",
		yawRate : "yawRate",
		brakeOperation : "brakeOperation",
		buttonEvent : "buttonEvent",
		drivingMode : "drivingMode",
		nightMode : "nightMode",
		odometer : "odometer",
		transmissionOil : "transmissionOil",
		transmissionClutch : "transmissionClutch",
		brakeMaintenance : "brakeMaintenance",
		washerFluid : "washerFluid",
		malfunctionIndicator : "malfunctionIndicator",
		batteryStatus : "batteryStatus",
		tire : "tire",
		diagnostic : "diagnostic",
		languageConfiguration : "languageConfiguration",
		unitsOfMeasure : "unitsOfMeasure",
		mirror : "mirror",
		seatAdjustment : "seatAdjustment",
		driveMode : "driveMode",
		dashboardIllumination : "dashboardIllumination",
		vehicleSound : "vehicleSound",
		antilockBrakingSystem : "antilockBrakingSystem",
		tractionControlSystem : "tractionControlSystem",
		electronicStabilityControl : "electronicStabilityControl",
		topSpeedLimit : "topSpeedLimit",
		airbagStatus : "airbagStatus",
		door : "door",
		childSafetyLock : "childSafetyLock",
		seat : "seat",
		temperature : "temperature",
		rainSensor : "rainSensor",
		wiperStatus : "wiperStatus",
		wiperSetting : "wiperSetting",
		defrost : "defrost",
		sunroof : "sunroof",
		convertibleRoof : "convertibleRoof",
		sideWindow : "sideWindow",
		climateControl : "climateControl",
		atmosphericPressure : "atmosphericPressure",
		laneDepartureDetection : "laneDepartureDetection",
		alarm : "alarm",
		parkingBrake : "parkingBrake",
		parkingLights : "parkingLights",

		// DeviceAPI Method
		get: function(type, data, suc, err) {

			if(type==='zones'){
                
                setTimeout(function(){

                    let zones = {
                          vehicleSpeed : [0]
                        , vehiclePowerModeType : [0]
						, engineSpeed : [0]
						, somethingForError : [0]
                        , tripMeters : [0]
                        , transmission : [0]
                        , lightStatus : [ 9,5,24,20 ]
                        , fuel : [0]
                        , engineOil : [0]
                        , door : [ 9,5,24,20,16 ]
                        , parkingBrake : [0]
                    };              
                    return suc(zones);                    
                    //return err({code:911,message:'holy shit!'});
                },500)

			}else if(type==='supported'){
                
                setTimeout(function(){                
                    let supported = {
                          vehicleSpeed : true
                        , vehiclePowerModeType : true
                        , engineSpeed : true
                        , tripMeters : true
						, transmission : true
                        , lightStatus : true
                        , fuel : true
                        , engineOil : true
                        , door : true
                        , parkingBrake : true
                    }
                    return suc(supported);
                    //return err({code:911,message:'holy shit!'});
                },1000)
				
			}else if(type==='availableForRetrievals'){
                
                setTimeout(function(){                
                    let availableForRetrieval = {
                                       vehicleSpeed : {speed:"available"}
									 , vehiclePowerModeType : {value:"available"}
                                     , tripMeters : {meters:"available"}
									 , transmission : {gear:"available",mode:"available"}
                                     , lightStatus : {
                                         head:"available",rightTurn:"available",
                                         leftTurn:"available",brake:"available",fog:'not_supported',hazard:"available",
                                         parking:"available",highBeam:"available",automaticHeadlights:'not_supported',
                                         dynamicHighBeam:"not_supported_other",zone:"available"
                                     }
                                     , fuel : {
                                        level:"available",range:"available",instantConsumption:"available",averageConsumption:"available",
                                        fuelConsumedSinceRestart:"available",timeSinceRestart:'not_supported'
                                     }
                                     , engineOil : {
                                        level:"available",lifeRemaining:"not_supported_other",temperature:"available",pressure:"available",change:'not_supported'
                                     }
                                     , door : {
                                        status:"available",lock:"available",zone:"available"
                                     }
                                     , parkingBrake : {
                                        status:"available"
                                     }       
                    }
                    return suc(availableForRetrieval);		
                },2000)
                
			}else if(type==='availableForSettings'){
                    
                setTimeout(function(){                    
                    let availableForSetting = {
                                       vehicleSpeed : {speed:"not_supported"}
                                     , vehiclePowerModeType : {value:"not_supported"}
                                     , tripMeters : {meters:"available"}
									 , transmission : {gear:"not_supported",mode:"not_supported"}
                                     , lightStatus : {
                                         head:"available",rightTurn:"available",
                                         leftTurn:"available",brake:"available",fog:'not_supported',hazard:"available",
                                         parking:"available",highBeam:"available",automaticHeadlights:'not_supported',
                                         dynamicHighBeam:"not_supported_other",zone:"available"
                                     }
                                     , fuel : {
                                        level:"available",range:"available",instantConsumption:"available",averageConsumption:"available",
                                        fuelConsumedSinceRestart:"available",timeSinceRestart:'not_supported'
                                     }
                                     , engineOil : {
                                        level:"available",lifeRemaining:"not_supported_other",temperature:"available",pressure:"available",change:'not_supported'
                                     }
                                     , door : {
                                        status:"available",lock:"available",zone:"available"
                                     }
                                     , parkingBrake : {
                                        status:"available"
                                     }       
                    }
                    return suc(availableForSetting);
                },100)
                
			}else if(type==='availableForSubscriptions'){
                    
                setTimeout(function(){                    
                    let availableForSubscription = {
                                       vehicleSpeed : {speed:"available"}
                                     , vehiclePowerModeType : {value:"available"}
                                     , tripMeters : {meters:"available"}
									 , transmission : {gear:"available",mode:"available"}
                                     , lightStatus : {
                                         head:"available",rightTurn:"available",
                                         leftTurn:"available",brake:"available",fog:'not_supported',hazard:"available",
                                         parking:"available",highBeam:"available",automaticHeadlights:'not_supported',
                                         dynamicHighBeam:"not_supported_other",zone:"available"
                                     }
                                     , fuel : {
                                        level:"available",range:"available",instantConsumption:"available",averageConsumption:"available",
                                        fuelConsumedSinceRestart:"available",timeSinceRestart:'not_supported'
                                     }
                                     , engineOil : {
                                        level:"available",lifeRemaining:"not_supported_other",temperature:"available",pressure:"available",change:'not_supported'
                                     }
                                     , door : {
                                        status:"available",lock:"available",zone:"available"
                                     }
                                     , parkingBrake : {
                                        status:"available"
                                     }       
                    }
                    return suc(availableForSubscription);
                },150)                    
                    
			}else if(type==='vehicleSpeed'){
                
                setTimeout(function(){
                    let vehicleSpeed = {
                        value:[{speed:130,timeStamp:0}]
                    };              
                    return suc(vehicleSpeed);                    
                    // return err(
					// 	{error:'permission_denied',
					// 	 message:'error occurs'}
					// );
                },100)			
                
            }else if(type==='engineSpeed'){
				
                setTimeout(function(){
                    let engineSpeed = {
                        value:[{speed:3000,timeStamp:0}]
                    };              
                    return suc(engineSpeed);                    
                },200)

            }else if(type==='vehiclePowerModeType'){

                setTimeout(function(){
                    let vehiclePowerModeType = {
                        value:[{value:'running',timeStamp:0}]
                    };              
                    return suc(vehiclePowerModeType);                    
                },120)

            }else if(type==='tripMeters'){

                setTimeout(function(){
                    let tripMeters = {
                        value:[{
							meters:{
								distance:13000000,//long , meter
								averageSpeed:65,//short, km/hr
								fuelConsumption:6250//short ml/100km , 6250 ml = 16000M
							},timeStamp:0
						}]
                    };              
                    return suc(tripMeters);                    
                },120)

            }else if(type==='transmission'){

                setTimeout(function(){
                    let transmission = {
                        value:[{
							gear:8,
							mode:'drive',
							timeStamp:0
						}]
                    };              
                    return suc(transmission);                    
                },120)

            }else if(type==='door'){

                setTimeout(function(){
                    let Door = {
                        value:[
                            {status:'open',lock:true,zone:9,timeStamp:0},
                            {status:'ajar',lock:true,zone:5,timeStamp:0},
                            {status:'closed',lock:true,zone:24,timeStamp:0},
                            {status:'open',lock:true,zone:20,timeStamp:0},
                            {status:'closed',lock:false,zone:16,timeStamp:0}
                        ]
                    };              
                    return suc(Door);                    
                    //return err({code:911,message:'holy shit!'});

                },800)
                
			}else if(type==='lightStatus'){

                setTimeout(function(){
                    let lightStatus = {
                        value:[
						{
							head:true,
							rightTurn:true,
							leftTurn:true, 
							brake:true, 
							fog:true, 
							hazard:true,
							parking:true,
							highBeam:true,
							automaticHeadlights:true,
							dynamicHighBeam:true,
							zone:[8],
							timeStamp:0
						},
						{
							head:false,
							rightTurn:false,
							leftTurn:false, 
							brake:false, 
							fog:false, 
							hazard:false,
							parking:false,
							highBeam:false,
							automaticHeadlights:false,
							dynamicHighBeam:false,
							zone:[4],
							timeStamp:0
						},
						]
                    };              
                    return suc(lightStatus);                    
                },800)	


			}else if(type==='fuel'){

               setTimeout(function(){
                    let fuel = {
                        value:[{
							level:7,// short, percent
							range:450000,// long, meter
							instantConsumption:1250,// long, (Unit: milliliters per 100 kilometers) 
							averageConsumption:2250,// long, (Unit: milliliters per 100 kilometers) 
							fuelConsumedSinceRestart:4250,// long (Unit: milliliters per 100 kilometers) 
							timeSinceRestart:3600,// long , sec
							timeStamp:0
						}]
                    };              
                    return suc(fuel);                    
                },800)

			}else if(type==='engineOil'){

               setTimeout(function(){
                    let engineOil = {
                        value:[{
							level:61, //short, percent
							lifeRemaining:86, //short, percent
							temperature:120, //long , celcius
							pressure:101.325, //short , kilopascals 
							change:false,
							timeStamp:0
						}]
                    };              
                    return suc(engineOil);                    
                },800)

			}else if(type==='parkingBrake'){

               setTimeout(function(){
                    let parkingBrake = {
                        value:[{
							status:'active', //ParkingBrakeStatus
							timeStamp:0
						}]
                    };              
                    return suc(parkingBrake);                    
                },800)											

			}else{

				var func = request_json;
				if (suc == null)
					func.id = (window.performance.now()).toString();
				else
					func.id = callBack.push(type, 'get', suc, err);
				func.method = OBJECT + ".get." + type;
				return wSocket.send_data(func, data);

			}

			/*
			var func = request_json;
			if (suc == null)
				func.id = (window.performance.now()).toString();
			else
				func.id = callBack.push(type, 'get', suc, err);
			func.method = OBJECT + ".get." + type;
			return wSocket.send_data(func, data);
			*/

		},
		set: function(type, data, suc, err) {
			// data validation

			prt(data)

			setTimeout(function(){
				suc();                    
				//err();
			},1200)

			/*
			var func = request_json;
			if (suc == null)
				func.id = (window.performance.now()).toString();
			else
				func.id = callBack.push(type, 'set', suc, err);
			func.method = OBJECT + ".set." + type;
			return wSocket.send_data(func, data);
			*/
		},
		query: function(type, data, suc, err){
			var func = request_json;
			if (suc == null)
				func.id = (window.performance.now()).toString();
			else
				func.id = callBack.push(type, 'query', suc, err);
			func.method = OBJECT + ".query." + type;
			return wSocket.send_data(func, data);	
		},
		addListener: function(type, data, handler) {			
			
			//prt(type)
			setTimeout(function(){
				//handler(0);          
				handler(
					{ value:[{speed:240}] }
				);
			},1200);

			/*
			if (handler) {
				listenerCallBack.push(type, handler);
				listener_lst = listenerCallBack.get(type);
				if (listener_lst && listener_lst.length == 1) {
					var func = request_json;
					func.method = OBJECT + ".addListener." + type;
					return wSocket.send_data(func, data);
				}
			}
			*/

		},
		removeListener: function(type, handler) {			
			if (handler) {
				listenerCallBack.pop(type, handler);
				if (!listenerCallBack.get(type)) {
					var func = request_json;
					func.method = OBJECT + ".removeListener." + type;
					return wSocket.send_data(func, null);
				}
			}
		},
		// Object Extension Method
		init: function(appId, openCallback, closeCallback, errorCallback){

            setTimeout(function(){
                openCallback();
            },1000) 

			/*
			wSocket = createSocket();

			if (appId) request_json.app_id = appId;
			if (openCallback) wSocket.onopen = openCallback;
			if (closeCallback) wSocket.onclose = closeCallback;
			if (errorCallback) errorhandler = errorCallback;
			*/

		},
		reset: function (appId, openCallback, closeCallback, errorCallback) {
			wSocket.close();
			callBack.clear();
			listenerCallBack.clear();
			
			wSocket = createSocket();

			if (appId) request_json.app_id = appId;
			if (openCallback) wSocket.onopen = openCallback;
			if (closeCallback) wSocket.onclose = closeCallback;
			if (errorCallback) errorhandler = errorCallback;
		},
		version: function () {
			return "1.0.0";
		}
	}
	
	window.vehicle = api_object;

})(); 