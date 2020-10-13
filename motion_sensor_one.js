const mqtt = require('mqtt');
const mqtt_motion = mqtt.connect("mqtt://broker.hivemq.com:1883");

var motion_id = 1;
var motion_datat = true;
var motion_dataf = false;
var motion_data_s = true;
// Publish topics 

var motion_connection = "smart_light/"+motion_id+"/motionsenconnect"
var motion_out = "smart_light/"+motion_id+"/motionsensor/out"

//Publish connection status
mqtt_motion.on('connect', () => {
    msgmotion ={
        Type: "motion_sensor",
        TypeMsg : "motionconnect_status",
        idm : motion_id,
        data : motion_data_s,
    }
    mqtt_motion.publish(topic = motion_connection, message = JSON.stringify(msgmotion));
    console.log('connected from motion sensor id:', motion_id);

})

//publish whether a person entered the room or not
// for demo 

setTimeout( () => {
    console.log('Person entered the room 1');
    msgmotioncheckt = {
        Type : "motion_sensor",
        TypeMsg : "motion_action",
        idm: motion_id,
        data: true,
    }
    mqtt_motion.publish(topic= motion_out, message = JSON.stringify(msgmotioncheckt));
}, 10000);

setTimeout( () => {
    console.log("Person left the room 1");
    msgmotioncheck = {
        TypeMsg : "motion_action",
        idm : motion_id,
        data: false,
    }
    mqtt_motion.publish(topic = motion_out, message = JSON.stringify(msgmotioncheck));
}, 20000);
