/******************************************************************************
 * LBS (Location Based Service) Web API
 * 
 * @version     1.0.0
 * @author      LuxLee
 * @url         www.xxx.com
 * @description to get data regarding LBS
 *****************************************************************************/
'use strict';
(function(window){

    let eventType = {
        CURRENT_POSITION : 'currentPosition'
    }

    class LbsInterface{
        constructor(){
            this.me = {};
        }
    }

    class LbsConfigurationInterface{
        constructor(){

        }        
    }

    class LbsSignalInterface{
        constructor(){

        }
    }

    class CurrentPosition{
        constructor(){
            
        }

        get(){
            return new Promise( (resolve,reject) => {
                navigator.geolocation.getCurrentPosition(function(data){
                    resolve(data);
                })
            });
        }

    }


    let _lbs = {

         start:function(){
            try {
                window.navigator.lbs[eventType.CURRENT_POSITION] = new CurrentPosition();
            } catch (error) {
                console.error(error);
            }
        }

    }

    /* INJECTION */ 
    window.navigator.lbs = _lbs;
    _lbs.start();

})(window);