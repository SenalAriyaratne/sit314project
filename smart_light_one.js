const mqtt = require('mqtt');
const mqtt_client = mqtt.connect("mqtt://broker.hivemq.com:1883");

const id_smartlight = 1;
var connect = true;
var onOff = false; // at the start light will be switched off
//////TOPICS////////
//Publish to topics



var connection_status = "smart_light/"+id_smartlight+"/connected"
var on_off_status = "smart_light/"+id_smartlight+"/status"

//Message types
var typeone = "connect_status" // connection status message type
var typetwo = "onoff_status"  // on or off status message type

// Subscribe to topics
var act_topic_one = "smart_light/"+id_smartlight+"/act/onoff"
var ac_topic_two = "smart_light/"+id_smartlight+"/act/brightness"


// Connection status check message published to mqtt server
mqtt_client.on('connect', () => {
    msg_loadone = {
        Type : "smart_light",
        TypeMsg : "connect_status",
        id : id_smartlight,
        data : connect    
    }
    console.log(`Connected to mqtt server from smart light id ${id_smartlight}`);
    mqtt_client.publish(connection_status, message = JSON.stringify(msg_loadone));
    console.log(`Published from smart light id ${id_smartlight} with connect status : ${connect}`);
    
})

// Publish the on off status of the smart light

mqtt_client.on('connect', () => {
    msg_loadtwo ={
        Type: "smart_light",
        TypeMsg: typetwo,
        id: id_smartlight,
        data: onOff
    }
    console.log("Publishing the status of the smart light on/off:", onOff);
    mqtt_client.publish(on_off_status, JSON.stringify(msg_loadtwo));
})


///////////// subscribe to actions from the mqtt server

mqtt_client.on('connect', () => {
    mqtt_client.subscribe(act_topic_one);
})

mqtt_client.on('message', (topic = act_topic_one, message) => {

    console.log(topic.toString());
    var rcv_data  = JSON.parse(message);
    console.log("Received data from server:",rcv_data);
    var switchlight = rcv_data.data;
    if(onOff === false && switchlight === true){
        console.log("@Switiching on the light");
        onOff = true;
        console.log(`Current status on = true/ off = false: ${onOff}`);
        //update the mqtt server
        msg_loadtwos ={
            Type: "smart_light",
            TypeMsg: typetwo,
            id: id_smartlight,
            data: onOff
        }
        mqtt_client.publish(topic = on_off_status, JSON.stringify(msg_loadtwos));
        
    } else if (onOff === true && switchlight === true) 
    {
        console.log(`@@Lights are already on. on = true / off= false : ${onOff} `);
        //update the mqtt server
        msg_loadtwos ={
            Type: "smart_light",
            TypeMsg: typetwo,
            id: id_smartlight,
            data: onOff
        }
        mqtt_client.publish(topic = on_off_status, JSON.stringify(msg_loadtwos));

    }else if ( onOff === true && switchlight === false)
    {
        console.log(`@@@Switching off the lights.. current status , ${onOff}`);
        onOff = false;
        console.log(`New status ${onOff}`);
        console.log(`@@@Lights are switched off. new status : ${onOff}`);
        //update the mqtt server
        msg_loadtwos ={
            Type: "smart_light",
            TypeMsg: typetwo,
            id: id_smartlight,
            data: onOff
        }
        mqtt_client.publish(topic = on_off_status, JSON.stringify(msg_loadtwos));

    }else
    {
        console.log(`current status of the lights ${onOff}`);
        console.log(`lights are already switched off`);
        //update the mqtt server
        msg_loadtwos ={
            Type: "smart_light",
            TypeMsg: typetwo,
            id: id_smartlight,
            data: onOff
        }
        mqtt_client.publish(topic = on_off_status, JSON.stringify(msg_loadtwos));
    }



})