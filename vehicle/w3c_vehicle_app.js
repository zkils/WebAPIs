
let vehicle =  window.navigator.vehicle;

function whenError(vehicleErrorInterface){
    prt(vehicleErrorInterface.error)
    prt(vehicleErrorInterface.message)
    console.info('callback for error')
}


// example
// new Zone( ['rear'] );
// new Zone( ['front','left'] );
// new Zone( [ ['rear'],['front','left'] ] )
let frontRight = new Zone( ['front','right'] ),
    multi = new Zone( [ ['rear'],['front','left'] ] );

let doc = document;

vehicle.start(function(){
    
    let availEnum = vehicle.enum.availability;

    // SPEED
    if( vehicle.vehicleSpeed.availableForRetrieval('speed') === availEnum.AVAILABLE ){

        let speed;
        vehicle.vehicleSpeed.get().then((vehicleSpeed)=>{
            prt(vehicleSpeed);
            speed = vehicleSpeed.speed;
            doc.querySelector('#'+'vehicleSpeed').children[1].textContent  = speed;
        },whenError);
    }
    
    // ENGINE_SPEED
    vehicle.engineSpeed.get().then(function(engineSpeed){
        prt(engineSpeed);
        doc.querySelector('#'+'engineSpeed').children[1].textContent  = engineSpeed.speed;
    },function(err){
        console.log('enginSpeed');
    });

    // VEHICLE_POWER_MODE_TYPE
    vehicle.vehiclePowerModeType.get().then(function(vehiclePowerModeType){
        prt(vehiclePowerModeType)
        doc.querySelector('#'+'vehiclePowerModeType').children[1].textContent  = vehiclePowerModeType.value;
    },function(err){
        console.log('vehiclePowerModeType');
    });

    // TRIP_METERS
    vehicle.tripMeters.get().then(function(tripMeters){
        prt(tripMeters);
        doc.querySelector('#'+'tripMeters').children[1].textContent  = tripMeters.meters.distance;
    },function(){
        console.log('tripMeters');
    });

    // TRANSMISSION
    vehicle.transmission.get().then(function(transmission){
        prt(transmission);
        doc.querySelector('#'+'transmission').children[1].textContent  = transmission.mode;
    },function(){
        console.log('transmission');
    });

    // LIGHT_STATUS , zone있음
    vehicle.lightStatus.get().then(function(lightStatus){
        prt(lightStatus)
        doc.querySelector('#'+'lightStatus').children[1].textContent  = lightStatus[0].head;
    },function(){
        console.log('lightStatus')
    });        

    // FUEL
    vehicle.fuel.get().then(function(fuel){
        prt(fuel);
        doc.querySelector('#'+'fuel').children[1].textContent  = fuel.level;
    },function(){
        console.log('fuel');
    });        

    // ENGINE_OIL
    vehicle.engineOil.get().then(function(engineOil){
        prt(engineOil);
        doc.querySelector('#'+'engineOil').children[1].textContent  = engineOil.change;
        
    },function(){
        console.log('engineOil');
    });

    // DOOR
    vehicle.door.get().then(function(door){
        prt(door);
        doc.querySelector('#'+'door').children[1].textContent  = door[1].status;
    },function(){
        console.log('door');
    });

    // PARKING_BRAKE
    vehicle.parkingBrake.get().then(function(parkingBrake){
        prt(parkingBrake);
        doc.querySelector('#'+'parkingBrake').children[1].textContent  = parkingBrake.status;

    },function(){
        console.log('parkingBrake');
    });


},function(){
    
    prt('errr')
    
});


/*
let lbs = window.navigator.lbs; 
lbs.currentPosition.get().then(function(pos){

    let crd = pos.coords;
    console.log('Your current position is:');
    console.log('Latitude : ' + crd.latitude);
    console.log('Longitude: ' + crd.longitude);
    console.log('More or less ' + crd.accuracy + ' meters.');

});
*/












// example
// new Zone( ['rear'] );
// new Zone( ['front','left'] );
// new Zone( [ ['rear'],['front','left'] ] )

//let frontLeft = new Zone( ['front','right'] );
//let frontLeft = new Zone( ['rear'] );

//prt( all.equals(frontLeft) )
//prt( all.contains(frontLeft) )

//let frontLeft = new Zone( [ ['left','rear'], ['front','right'], ['front'] ] );
//let all = new Zone( [ ['left','front'], ['front','right'], ['rear'] ] );

/*
                      To Think
중복 zone을 넣었을 때 처리는????

*/



/*
var vehicleSpeedSub = vehicle.vehicleSpeed.subscribe(function (vehicleSpeed) {
  console.log("Vehicle speed changed to: " + vehicleSpeed.speed);
  vehicle.vehicleSpeed.unsubscribe(vehicleSpeedSub);
});
*/


/*
function reject(errorData)
{
  console.log("Error occurred during set: " + errorData.message + " code: " + errorData.error);
}
*/



/*

    navigator.vehicle.door.get().then(function(door){

        prt(door)
        let frontRight = new Zone( ['front','right'] )
        let size = door.length;

        for (var i = 0; i < size; i++) {
            if(door[i].zone.equals(frontRight)){
                door[i].status;
                prt(door[i].status)
            }
        }

    });

*/
