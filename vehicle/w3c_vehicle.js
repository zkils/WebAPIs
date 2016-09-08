/******************************************************************************
 * Vehicle Web API
 * 
 * @version     1.0.0
 * @author      LuxLee
 * @url         www.xxx.com
 * @description to get vehicle data
 *****************************************************************************/
let prt = console.log.bind(console);
'use strict';
{

    let eventType = {
		ZONES : "zones",
		SUPPORTED : "supported",
		AVAILABLE_FOR_RETRIEVALS : "availableForRetrievals",
		AVAILABLE_FOR_SETTINGS : "availableForSettings",
		AVAILABLE_FOR_SUBSCRIPTIONS : "availableForSubscriptions",
		IDENTIFICATION : "identification",
		SIZE_CONFIGURATION : "sizeConfiguration",
		FUEL_CONFIGURATION : "fuelConfiguration",
		TRANSMISSION_CONFIGURATION : "transmissionConfiguration",
		WHEEL_CONFIGURATION : "wheelConfiguration",
		STEERING_WHEEL_CONFIGURATION : "steeringWheelConfiguration",
		ENGINE_STATUS : "engineStatus",
		VEHICLE_SPEED : "vehicleSpeed",
		WHEEL_SPEED : "wheelSpeed",
		ENGINE_SPEED : "engineSpeed",
		VEHICLE_POWER_MODE_TYPE : "vehiclePowerModeType",
		POWERTRAIN_TORQUE : "powertrainTorque",
		ACCELERATOR_PEDAL_POSITION : "acceleratorPedalPosition",
		THROTTLE_POSITION : "throttlePosition",
		TRIP_METERS : "tripMeters",
		TRANSMISSION : "transmission",
		CRUISE_CONTROL_STATUS : "cruiseControlStatus",
		LIGHT_STATUS : "lightStatus",
		INTERIOR_LIGHT_STATUS : "interiorLightStatus",
		HORN : "horn",
		CHIME : "CHIME",
		FUEL : "fuel",
		ENGINE_OIL : "engineOil",
		ACCELERATION : "acceleration",
		ENGINE_COOLANT : "engineCoolant",
		STEERING_WHEEL : "steeringWheel",
		WHEEL_TICK : "wheelTick",
		IGNITION_TIME : "ignitionTime",
		YAW_RATE : "yawRate",
		BRAKE_OPERATION : "brakeOperation",
		BUTTON_EVENT : "buttonEvent",
		DRIVING_MODE : "drivingMode",
		NIGHT_MODE : "nightMode",
		ODOMETER : "odometer",
		TRANSMISSION_OIL : "transmissionOil",
		TRANSMISSION_CLUTCH : "transmissionClutch",
		BRAKE_MAINTENANCE : "brakeMaintenance",
		WASHER_FLUID : "washerFluid",
		MALFUNCTION_INDICATOR : "malfunctionIndicator",
		BATTERY_STATUS : "batteryStatus",
		TIRE : "tire",
		DIAGNOSTIC : "diagnostic",
		LANGUAGE_CONFIGURATION : "languageConfiguration",
		UNITS_OF_MEASURE : "unitsOfMeasure",
		MIRROR : "mirror",
		SEAT_ADJUSTMENT : "seatAdjustment",
		DRIVE_MODE : "driveMode",
		DASHBOARD_ILLUMINATION : "dashboardIllumination",
		VEHICLE_SOUND : "vehicleSound",
		ANTILOCK_BRAKING_SYSTEM : "antilockBrakingSystem",
		TRACTION_CONTROL_SYSTEM : "tractionControlSystem",
		ELECTRONIC_STABILITY_CONTROL : "electronicStabilityControl",
		TOP_SPEED_LIMIT : "topSpeedLimit",
		AIRBAG_STATUS : "airbagStatus",
		DOOR : "door",
		CHILD_SAFETY_LOCK : "childSafetyLock",
		SEAT : "seat",
		TEMPERATURE : "temperature",
		RAIN_SENSOR : "rainSensor",
		WIPER_STATUS : "wiperStatus",
		WIPER_SETTING : "wiperSetting",
		DEFROST : "defrost",
		SUNROOF : "sunroof",
		CONVERTIBLE_ROOF : "convertibleRoof",
		SIDE_WINDOW : "sideWindow",
		CLIMATE_CONTROL : "climateControl",
		ATMOSPHERIC_PRESSURE : "atmosphericPressure",
		LANE_DEPARTURE_DETECTION : "laneDepartureDetection",
		ALARM : "alarm",
		PARKING_BRAKE : "parkingBrake",
		PARKING_LIGHTS : "parkingLights",
    };

    const BIT_TO_ZONE_INIT = 0,
          BIT_TO_ZONE_GET = 1,
          ZONE_TO_BIT = 2;

    let basedData = {size:0},
        afv = window.vehicle;
    
    /* DECLARATION */
    class Zone{
        constructor(zone=[],driverr=['front','left']){
            this.value = zone;
            Object.defineProperty(this, 'driver',
                                  { enumerable: false, get: function() {
                                      return new Zone(driverr);
                                  } });
        }

        equals(zone){
            
            let isEqual = true,
                thisZone = bitToZoneToBit(ZONE_TO_BIT,this),
                inZone = bitToZoneToBit(ZONE_TO_BIT,zone);
            let size = thisZone.length, sizee = inZone.length, 
                thisAndIn = false;

            for (var i = 0; i < size; i++) {
                if(!isEqual) break;
                for (var j = 0; j < sizee; j++) {
                    thisAndIn = thisZone[i] === inZone[j];
                    if( !thisAndIn ){
                        isEqual = false;
                    }else if(thisAndIn){
                        isEqual = true;
                        break;
                    }
                }
            }

            return isEqual;
        }

        contains(zone){

            let isContained = false,
                thisZone = bitToZoneToBit(ZONE_TO_BIT,this),
                inZone = bitToZoneToBit(ZONE_TO_BIT,zone);
            let size = thisZone.length, sizee = inZone.length;

            for (var i = 0; i < size; i++) {
                for (var j = 0; j < sizee; j++) {
                    if( thisZone[i] === inZone[j] ){
                        isContained = true;
                        break;
                    }
                }
                if(isContained) break;
            }

            return isContained;
        }

        containWhere(){
            //return thisZone index which matches to inZone
            return null;
        }
    }
    
    class VehicleInterfaceError{
        constructor(error,message){
            this.error = error;
            this.message = message;
        }
    }

    class VehicleInterface{
        constructor(s,z,e,b){
            this.supported = s;
            this.zones = z;
            this.me = {eventType:e};
            this.me._proto_ = {zones:b}; 
        }
        
        get(zoneAsArray=null){
            
            let resolvee, rejectt, result, size = 0;
            return new Promise( (resolve,reject) => { //VehicleInterfaceError
                resolvee = (data) => {
                    
                    result = bitToZoneToBit(BIT_TO_ZONE_GET, data.value);
                    size = data.value.length;

                    //if having zone as attribute, convert zone and put it in 
                    for (var i = 0; i < size; i++) {
                        if( data.value[i].hasOwnProperty('zone') ){
                            data.value[i].zone = result[i];
                        }
                    }

                    //if single value, pass the first index only
                    if(data.value.length === 1){
                        resolve( data.value[0] );
                    }else{
                        resolve( data.value );
                    }

                };
                rejectt = (data) => {
                    reject( new VehicleInterfaceError(data.error,data.message) );                    
                }
                afv.get(this.me.eventType,
                        zoneAsArray === null ? this.me._proto_.zones : bitToZoneToBit(ZONE_TO_BIT, zoneAsArray),
                        resolvee, reject);
            });
            
        }
        availableForRetrieval(attrName){
            return availableForMethods(eventType.AVAILABLE_FOR_RETRIEVALS,this.me.eventType,attrName)
        }
        
        //availabilityChangedListener(){}
        //removeAvailabilityChangedListener(){}
        
    }    
    
    class VehicleConfigurationInterface extends VehicleInterface{
        constructor(s,z,e,bz){super(s,z,e,bz);}
    }

    class VehicleSignalInterface extends VehicleInterface{
        constructor(s,z,e,bz){super(s,z,e,bz);}
    
        //must return Promise. The "resolve" callback indicates the set was successful. No data is passed to resolve. 
        //If there was an error, "reject" will be called with a VehicleInterfaceError object
        set(dataObject, zoneAsArray = null){
            
            if( !(dataObject) ){
                throw NullParameterException('Set()');
            }

            let rejectt;
            return new Promise( (resolve,reject) => { //VehicleInterfaceError
                rejectt = (data) => {
                    reject( new VehicleInterfaceError(data.error,data.message) );                    
                }                 
                afv.set(this.me.eventType,
                        zoneAsArray === null ? null : bitToZoneToBit(ZONE_TO_BIT, zoneAsArray),
                        resolve,reject);
            });

        };
        
        //must return handle to subscription or 0 if error
        subscribe(vehicleInterfaceCallback, zoneAsArray = null){

            if(!vehicleInterfaceCallback){
                throw NullParameterException('subscribe()');
            }            
            let resolvee = (data) => {
                vehicleInterfaceCallback(data.value)
            }
            afv.addListener(this.me.eventType,
                            zoneAsArray === null ? null : bitToZoneToBit(ZONE_TO_BIT, zoneAsArray),     
                            resolvee);
        };

        //must return void. unsubscribes to value changes on this interface.        
        unsubscribe(handle){
            if(!handle){
                throw NullParameterException('unsubscribe()');
            }  
            afv.removeListener(this.me.eventType, handle);
        };
        
        availableForSetting(attrName){
            return availableForMethods(eventType.AVAILABLE_FOR_SETTINGS,this.me.eventType,attrName)
        }

        availableForSubscription(attrName){
            return availableForMethods(eventType.AVAILABLE_FOR_SUBSCRIPTIONS,this.me.eventType,attrName)
        }
        
    }    
    
    /** Configuration and Identification Interfaces **/    
    
    /** Running Status Interfaces **/
    class VehicleSpeed extends VehicleSignalInterface{
        constructor(s,z,e,bz){super(s,z,e,bz);}
    }
    class EngineSpeed extends VehicleSignalInterface{
        constructor(s,z,e,bz){super(s,z,e,bz);}
    }
    class VehiclePowerModeType extends VehicleSignalInterface{
        constructor(s,z,e,bz){super(s,z,e,bz);}
    }    
    class Trip{
        constructor(){}        
    }
    class TripMeters extends VehicleSignalInterface{
        constructor(s,z,e,bz){super(s,z,e,bz);}
    }
    class Transmission extends VehicleSignalInterface{
        constructor(s,z,e,bz){super(s,z,e,bz);}
    }    
    class LightStatus extends VehicleSignalInterface{
        constructor(s,z,e,bz){super(s,z,e,bz);}
    }        
    class Fuel extends VehicleSignalInterface{
        constructor(s,z,e,bz){super(s,z,e,bz);}
    }       
    class EngineOil extends VehicleSignalInterface{
        constructor(s,z,e,bz){super(s,z,e,bz);}
    }       
    
    /** Maintenance Interfaces **/
    
    /** Personalization Interfaces **/
    
    /** DrivingSafety Interfaces **/
    class Door extends VehicleSignalInterface{
        constructor(s,z,e,bz){super(s,z,e,bz);}
    }      
    
    /** Climate Interfaces **/
    
    /** Vision and Parking Interfaces **/
    class ParkingBrake extends VehicleSignalInterface{
        constructor(s,z,e,bz){super(s,z,e,bz);}
    }   

    /** MANAGEMENT **/
    let TypeException = function(type){
            console.error(`TypeException: ${type} type is required for parameter(s).`);
        },
        OutOfSwitchCaseException = function(){
            console.error(`OutOfSwitchCaseException: cannot find proper case`);
        },
        NullParameterException = function(type){
            console.error(`NullParameterException: ${type}`);
        }

    let _vehicle ={
        
        start:function(_successCb_, _errorCb_){
         
            if(typeof _successCb_ != 'function'){
                _errorCb_();
                throw TypeException('function');
            }
            
            let afv = window.vehicle,
                openCallbackError = null,
                closeCallbackError = null,
                errorCallback = null;                

            openCallbackError = function(error,type){
                console.error(`Based-data (${type}) Collection Error 
                => errorCode:${error.code}
                => message:${error.message}`);
            }

            function open_callback(){
                console.log('%c === Start to collect based data ===', 'color:dodgerblue')

                let basedDataList = [],
                    isError = false;

                    basedDataList.push(eventType.SUPPORTED);
                    basedDataList.push(eventType.ZONES);
                    basedDataList.push(eventType.AVAILABLE_FOR_RETRIEVALS);
                    basedDataList.push(eventType.AVAILABLE_FOR_SETTINGS);
                    basedDataList.push(eventType.AVAILABLE_FOR_SUBSCRIPTIONS);

                for( let i in basedDataList){
                    if(isError) break;
                    let b_data = basedDataList[i];
                    afv.get(b_data,null,function(based_data){
                        basedData[b_data] = based_data;
                        basedData['size']++;
                        console.log(`${b_data} is ready`);
                    },function(error){
                        isError = true;
                        openCallbackError(error,b_data);
                    });            
                    }

                validateIfBasedDataAreAllset();
                function validateIfBasedDataAreAllset(){
                    if(basedData.size !== basedDataList.length){
                        setTimeout(function(){
                            validateIfBasedDataAreAllset();
                        },2000)
                    }else if(basedData.size === basedDataList.length){
                        helloVehicle(basedData);
                    }
                }

            }

            function close_callback(error){

            }

            function error_callback(error){
                console.error('closeCallbackError');
                //error.message
                //error.code
            }

            let widgetId = null;
            if(window.AppManager){
                widgetId = AppManager.getWidgetId();
            }else if(window.launcher){
                widgetId = launcher.getWidgetId();    
            }    

            afv.init(widgetId=123123, open_callback, close_callback, error_callback)            

            function helloVehicle(basedData){ 
                console.log('%c === End to collect based data ===', 'color:dodgerblue')
                
                let bd = basedData,
                    bs = bd[eventType.SUPPORTED],
                    bz = bd[eventType.ZONES],
                    e = eventType;

                try {

                    /** Running Status Interfaces **/
                    window.navigator.vehicle[e.VEHICLE_SPEED] = new VehicleSpeed( 
                        bs[e.VEHICLE_SPEED],
                        bitToZoneToBit( BIT_TO_ZONE_INIT, bz[e.VEHICLE_SPEED] ),
                        e.VEHICLE_SPEED,
                        bz[e.VEHICLE_SPEED]
                    );

                    window.navigator.vehicle[e.ENGINE_SPEED] = new EngineSpeed( bs[e.ENGINE_SPEED], bitToZoneToBit( BIT_TO_ZONE_INIT, bz[e.ENGINE_SPEED] ), e.ENGINE_SPEED, bz[e.ENGINE_SPEED] );
                    window.navigator.vehicle[e.VEHICLE_POWER_MODE_TYPE] = new VehiclePowerModeType( bs[e.VEHICLE_POWER_MODE_TYPE], bitToZoneToBit( BIT_TO_ZONE_INIT, bz[e.VEHICLE_POWER_MODE_TYPE] ), e.VEHICLE_POWER_MODE_TYPE, bz[e.VEHICLE_POWER_MODE_TYPE] ) ;
                    window.navigator.vehicle[e.TRIP_METERS] = new TripMeters( bs[e.TRIP_METERS], bitToZoneToBit( BIT_TO_ZONE_INIT, bz[e.TRIP_METERS] ), e.TRIP_METERS, bz[e.TRIP_METERS] );
                    window.navigator.vehicle[e.TRANSMISSION] = new Transmission( bs[e.TRANSMISSION], bitToZoneToBit( BIT_TO_ZONE_INIT, bz[e.TRANSMISSION] ), e.TRANSMISSION, bz[e.TRANSMISSION] );
                    window.navigator.vehicle[e.LIGHT_STATUS] = new LightStatus( bs[e.LIGHT_STATUS], bitToZoneToBit( BIT_TO_ZONE_INIT, bz[e.LIGHT_STATUS] ),e.LIGHT_STATUS, bz[e.LIGHT_STATUS] );
                    window.navigator.vehicle[e.FUEL] = new Fuel( bs[e.FUEL], bitToZoneToBit( BIT_TO_ZONE_INIT, bz[e.FUEL] ),e.FUEL, bz[e.FUEL] );
                    window.navigator.vehicle[e.ENGINE_OIL] = new EngineOil( bs[e.ENGINE_OIL], bitToZoneToBit( BIT_TO_ZONE_INIT, bz[e.ENGINE_OIL] ),e.ENGINE_OIL,bz[e.ENGINE_OIL] );
                    
                    /** DrivingSafety Interfaces **/
                    window.navigator.vehicle[e.DOOR] = new Door( bs[e.DOOR], bitToZoneToBit( BIT_TO_ZONE_INIT, bz[e.DOOR] ),e.DOOR , bz[e.DOOR] );
                    
                    /** Vision and Parking Interfaces **/
                    window.navigator.vehicle[e.PARKING_BRAKE] = new ParkingBrake(bs[e.PARKING_BRAKE], bitToZoneToBit( BIT_TO_ZONE_INIT, bz[e.PARKING_BRAKE] ), e.PARKING_BRAKE, bz[e.PARKING_BRAKE] );

                } catch (err) {
                    console.error( tryCatchTemplate(err,'injection to window.navigator') )
                }
                _successCb_();
            }
        },
        enum:{}
    }
    
    /* INJECTION */ 
    window.navigator.vehicle = _vehicle;
    window.Zone = Zone;
    
    /* DEPENDENCIES FNCS */
    function availableForMethods(availableType,eventType,attrName){
        return basedData[availableType][eventType][attrName]||0;
    }
    
    function bitToZoneToBit(mode,data){
        
        let zones = {
            'none':0,
            'front':1,
            'middle':1<<1,
            'right':1<<2,
            'left':1<<3,
            'rear':1<<4,
            'center':1<<5,
            'top':1<<6,
            'central':1<<7,
            'bottom':1<<8
        }, result = [];
        
        switch (mode) {
            case BIT_TO_ZONE_INIT:
                result = BIT_TO_ZONE(data);
                break;

            // [ eventType instance , .. ] ->  [ zone , .. ]
            case BIT_TO_ZONE_GET:

                let size = data.length, zonesAsInt = []
                for (var i = 0; i < size; i++) {
                    zonesAsInt[i] = data[i].zone; 
                }
                result = BIT_TO_ZONE(zonesAsInt)
                break;                
            case ZONE_TO_BIT:

                let type = typeof data.value[0],
                    sizee  = data.value.length, sum = 0;
                if( type === 'string' ){

                    for (let i = 0; i < sizee; i++) {
                        sum += zones[ data.value[i] ];
                    }
                    result.push(sum);
                    sum = 0; 

                }else{

                    for (let i = 0; i < sizee; i++) {
                        let zone = data.value[i], sizeee = zone.length;
                        for (let j = 0; j < sizeee; j++)     {
                            sum += zones[zone[j]];
                        }
                        result.push(sum);
                        sum = 0;
                    }

                }
                break;
            default:
                throw new OutOfSwitchCaseException();
        }

        // [ int, .. ] -> [ zone , .. ]
        function BIT_TO_ZONE(data){

            let size = data.length,_zone_=[], re = [], result = [];
            for (let i = 0; i < size; i++) {
                for(let value in zones){

                    if( data[i] === 0 ){
                        _zone_.push(value);
                        break;
                    }
                    if(data[i] & zones[value]){
                        _zone_.push(value);
                    }

                }
                result = new Zone(_zone_);
                re.push(result);
                result = re;
                _zone_ = [];
            }

            return result;
        }

        return result;
    }
    
    function tryCatchTemplate(err,during){
        return `[TRY-CATCH] \n Message => ${err} \n During  => ${during}`;
    }

    window.navigator.vehicle.enum = {

        zonePosition: {
            FRONT:'front',MIDDLE:'middle',REAR:'rear',LEFT:'left',CENTER:'center',RIGHT:'right'
        },
        vehicleError: {
            PERMISSION_DENIED:'permission_denied',INVALID_OPERATION:'invalid_operation',TIMEOUT:'timeout',INVALID_ZONE:'invalid_zone',UNKNOWN:'unknown'
        },
        availability: {
            AVAILABLE:'available',NOT_SUPPORTED:'not_supported',NOT_SUPPORTED_YET:'not_supported_yet',
            NOT_SUPPORTED_SECURITY_POLICY:'not_supported_security_policy',
            NOT_SUPPORTED_BUSINESS_POLICY:'not_supported_business_policy',NOT_SUPPORTED_OTHER:'not_supported_other'
        },
        vehicleTypeEnum : {
            PASSENGER_CAR_MINI:'passengerCarMini', PASSENGER_CAR_LIGHT:'passengerCarLight', PASSENGER_CAR_COMPACT:'passengerCarCompact',
            PASSENGER_CAR_MEDIUM:'passengerCarMedium', PASSENGER_CAR_HEAVY:'passengerCarHeavy', SPORT_UTILITY_VEHICLE:'sportUtilityVehicle',
            PICKUP_TRUCK:'pickupTruck',VAN:'van',
            SEDAN:'sedan',COUPE:'coupe',CABRIOLET:'cabriolet',ROADSTER:'roadster',TRUCK:'truck'
        },
        fuelTypeEnum: {
            GASOLINE:'gasoline',METHANOL:'methanol',ETHANOL:'ethanol',DIESEL:'diesel',LPG:'lpg',CNG:'cng',ELECTRIC:'electric'
        },
        transmissionGearTypeEnum: {
            AUTO:'auto',MANUAL:'manual'
        },
        vehiclePowerMode: {
            OFF:'off',ACCESSORY1:'accessory1',ACCESSORY2:'accessory2',RUNNING:'running'
        },
        transmissionMode: {
            PARK:'park',REVERSE:'reverse',NEUTRAL:'neutral',LOW:'low',DRIVE:'drive',OVER_DRIVE:'overdrive'
        },
        button: {
            HOME:'home',BACK:'back',SEARCH:'search',CALL:'call',END_CALL:'end_call',MEDIA_PLAY:'media_play',
            MEDIA_NEXT:'media_next',MEDIA_PREVIOUS:'media_previous',MEDIA_PAUSE:'media_pause',VOICE_RECOGNIZE:'voice_recognize',
            ENTER:'enter',LEFT:'left',RIGHT:'right',UP:'up',DOWN:'down'
        },
        buttonEventType: {
            PRESS:'press',LONG_PRESS:'long_press',RELEASE:'release'
        },
        driveModeEnum: {
            COMFORT:'comfort',AUTO:'auto',SPORT:'sport',ECO:'eco',MANUAL:'manual',WINTER:'winter'
        },
        doorOpenStatus: {
            OPEN:'open',AJAR:'ajar',CLOSED:'closed'
        },
        occupantStatus: {
            ADULT:'adult',CHILD:'child',VACANT:'vacant'
        },
        identificationType: {
            PIN:'pin',KEY_FOB:'keyfob',BLUETOOTH:'Bluetooth',NFC:'NFC',FINGER_PRINT:'fingerprint',CAMERA:'camera',VOICE:'voice'
        },
        wiperControl: {
            OFF:'off',ONCE:'once',SLOWEST:'slowest',SLOW:'slow',MIDDLE:'middle',FAST:'fast',FASTEST:'fastest',AUTO:'auto'
        },
        convertibleRoofStatus: {
            CLOSED:'closed',CLOSING:'closing',OPENING:'opening',OPENED:'opened'
        },
        airflowDirection: {
            FRONT_PANEL:'frontpanel',FLOOR_DUCT:'floorduct',BILEVEL:'bilevel',DEFROST_FLOOR:'defrostfloor'
        },
        laneDepartureStatus: {
            OFF:'off',PAUSE:'pause',RUNNING:'running'
        },
        alarmStatus: {
            DISARMED:'disarmed',PREARMED:'preArmed',ARMED:'armed',ALARMED:'alarmed'
        },
        parkingBrakeStatusEnum: {
            IN_ACTIVE:'inactive',ACTIVE:'active',ERROR:'error'
        }
    }

};
