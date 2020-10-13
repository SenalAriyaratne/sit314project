const mqtt = require('mqtt');
const mqtt_server = mqtt.connect("mqtt://broker.hivemq.com:1883");

const http = require('http');
const fetch = require('node-fetch');

const idss = [1, 2];
var list_of_connected_sl = []; // list connected smart lights
var list_of_connected_md = []; // list for connected motion sensors
///////////TOPICS///////////////////
//subscribe to these topic 
var connection_status_all = "smart_light/+/connected"
var on_off_status_all = "smart_light/+/status"

var connect_status_motionall = "smart_light/+/motionsenconnect"

var motion_sensor_action_all = "smart_light/+/motionsensor/out"


//Publish to these topics
var act_topic_one = "smart_light/id/act/onoff"
var ac_topic_two = "smart_light/id/act/brightness"

//Message types from smart lights
var typeone = "connect_status" // connection status message type
var typetwo = "onoff_status"  // on or off status message type
var typethree = "onoff_action" // action message on or off

//Message type for Motion Sensor
const type_m_one = "motionconnect_status"
const type_m_two = "motion_action"

//Devices
const smartlight = "smart_light";
const motionsensor = "motion_sensor";

//Subscribe to all the connection status message from all the lights
mqtt_server.on('connect', () => {
    mqtt_server.subscribe(connection_status_all);
})

mqtt_server.on('message', (topic = connection_status_all, message) => {
    console.log(topic.toString());
    //console.log(message.toString());
    var datacnc = JSON.parse(message);
    console.log('Received for connected', datacnc);
    var rcv_id = datacnc.id;
    var idrrcv = datacnc.id;
    var stdatacnc = JSON.stringify(datacnc);
    //  console.log('Message type ::' ,typeof datacnc.TypeMsg);
    var checkidbl = list_of_connected_sl.includes(rcv_id);
    console.log(checkidbl);
    if (checkidbl === false && datacnc.TypeMsg === typeone) {
        list_of_connected_sl.push(datacnc.id);
        console.log("Added new connected id to connected id list . New ID : ", rcv_id);
        fetch('http://localhost:3000/smart_light/connectstatus', {
            method : 'POST',
            headers : { 'Content-Type':'application/json' },
            body: JSON.stringify(datacnc)
            
        }).then(res => res.json())
          .then(json => console.log(json))
          .catch(err => console.log(err))
        /*
        var options_smlc = {
            hostname: 'localhost',
            port: '3000',
            path: '/smart_light',
            method: 'POST',
            headers : {
                'Content-Type': 'application/json',
                'Content-Length': stdatacnc.length
            }
        }; 
        const req = http.request(options_smlc, res => {
            console.log(`statusCode : ${res.statusCode}`)

            
        })

        req.on('error', error => {
            console.log(error);
        })
        */
        
        
    }
    console.log("Updated list :", list_of_connected_sl);
    //Send data to main server to store the data using http get 


    // send the connected status to the main server where the value will be stored on Mongodb
})
///

//Subscribe to all the light status messages
mqtt_server.on('connect', () => {
    mqtt_server.subscribe(on_off_status_all);
})

mqtt_server.on('message', (topic = on_off_status_all, message) => {
    console.log(topic.toString());
    var rcvdata = JSON.parse(message);
    console.log("Receveived data:", rcvdata);
    if(rcvdata.Type === smartlight && rcvdata.TypeMsg === typetwo){
        if(list_of_connected_sl.includes(rcvdata.id) == true){
            console.log(`Smart light is connected and will update the status to the main Server.`);
            fetch('http://localhost:3000/smart_light/onoffstatus', {
                method : 'POST',
                headers : { 'Content-Type':'application/json' },
                body: JSON.stringify(rcvdata)
                
            }).then(res => res.json())
              .then(json => console.log(json))
              .catch(err => console.log(err))
         
        }
    }
})


// Publish actions to switch on off based on the motion sensor
/*
mqtt_server.on('connect', () => {

    setInterval(demoone, 5000);

    function demoone() {
        const on_b = true;
        const off_b = false;
        if(list_of_connected_sl.length === 0 ) return;
        for (i = 0; i < list_of_connected_sl.length; i++) {
            msgpayload = {
                Msgtype: typethree,
                id: list_of_connected_sl[i],
                onoffs: on_b,
            }
            var pubtop = "smart_light/" + list_of_connected_sl[i] + "/act/onoff"
            mqtt_server.publish(pubtop, JSON.stringify(msgpayload));
            console.log(`Published to ${pubtop}`);


        }

    }



})*/

// MOtion sensor connect

mqtt_server.on('connect', () => {

    mqtt_server.subscribe(topic = connect_status_motionall);

})

mqtt_server.on('message', (topic = connect_status_motionall, message) => {
    console.log(topic.toString());
    var rcv_mdata = JSON.parse(message);
    var checkmid = list_of_connected_md.includes(rcv_mdata.idm);
    if(checkmid === false){
        list_of_connected_md.push(rcv_mdata.idm);
        console.log('Added new motion sensor id to the connected list ',list_of_connected_md);
        if (rcv_mdata.TypeMsg === type_m_one && rcv_mdata.Type === motionsensor){
            console.log('Received Message from motion sensor id ' + rcv_mdata.idm + 'dataa = ', rcv_mdata);
            fetch('http://localhost:3000/motion_sensor/connectstatus', {
                method : 'POST',
                headers : { 'Content-Type':'application/json' },
                body: JSON.stringify(rcv_mdata)
                
            }).then(res => res.json())
              .then(json => console.log(json))
              .catch(err => console.log(err))
        }
    }
    
    
})

//Check for any motion related 

mqtt_server.on('connect', () => {
    mqtt_server.subscribe(topic = motion_sensor_action_all);
})

mqtt_server.on('message', (topic, message) => {
    console.log(topic.toString());
    var checkdata = JSON.parse(message);
    console.log('Received message from motion sensor id : ' + checkdata.idm + 'and data is ', checkdata);
    if (checkdata.data === true) {
        if (checkdata.TypeMsg === type_m_two) {
            msgactionload = {
                TypeMsg: typethree,
                id: checkdata.idm,
                data: true,
            }
            mqtt_server.publish(topic = "smart_light/" + checkdata.idm + "/act/onoff", message = JSON.stringify(msgactionload));
            console.log(`Published to smart light:: ${checkdata.idm} and publishe true to switch on lights`);

        }

    } else {
        if (checkdata.TypeMsg === type_m_two) {
            msgactionload = {
                TypeMsg: typethree,
                id: checkdata.idm,
                data: false,
            }
            mqtt_server.publish(topic = "smart_light/" + checkdata.idm + "/act/onoff", message = JSON.stringify(msgactionload));
            console.log(`Published to smart light:: ${checkdata.idm}`);

        }

    }
})
