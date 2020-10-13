const express = require('express');
const server = express();
const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://Senal:1234@project.vkg3k.mongodb.net/project?retryWrites=true&w=majority');



const Smartlightdata = require('./models/smartlight');

const Motionsensordata = require('./models/motionsensor');

const http = require('http');
const { Console } = require('console');

const port = 3000;
// Lists for incoming data store
var connected_ids = []; // connected smart lights
var connected_idms = []; // connected motion sensors
//Message types from smart lights
const typeone = "connect_status" // connection status message type
const typetwo = "onoff_status"  // on or off status message type
const typethree = "onoff_action" // action message on or off

// Message types from motion sensor
const type_m_one = "motionconnect_status"
const type_m_two = "motion_action"

//connect device types
const smartlight = "smart_light"
const motionsensor = "motion_sensor"

// 
server.use(express.json());

server.listen(port, () => {
    console.log(`Listening on port ${port}`);
})

server.post('/smart_light/connectstatus', function (req, res) {

    let data = req.body;
    console.log("Received data", data);
    res.send(JSON.stringify(data));

    if (data.Type === smartlight) {
        var boolcheck = connected_ids.includes(data.id);
        if (boolcheck === false) {
            connected_ids.push(data.id)
            if (connected_ids.includes(data.id) === true) {
                var new_smartlight = new Smartlightdata({
                    Type: data.Type,
                    id: data.id,
                    connectstatus: data.data,
                    actionon_off: [],
                })
                Smartlightdata.exists({ id: data.id }, function (err, docs) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        var check = docs;
                        if (check === true) {
                            console.log('Connected id already in the databse smartlight');
                        }
                        else {
                            console.log('Smart Light :' + data.id + ' ..New data is ', new_smartlight);
                            new_smartlight.save().then(doc => {
                                console.log('Saved smart light data:', doc);
                            });

                        }
                    }

                })


            }

        }

    }

    //after the id is entered to the coonected_l then a new data entry is created for database

    console.log('Updata smart light list:', connected_ids);
    console.log('Updates motion sensor list:', connected_idms);


})

server.post('/motion_sensor/connectstatus', (req, res) => {

    let mdata = req.body;
    res.send(JSON.stringify(mdata));
    var checkm = connected_idms.includes(mdata.idm)
    if (checkm === false) {
        console.log('Adding the new motion sensor id :' + mdata.idm + ' to the connected list motion..');
        connected_idms.push(mdata.idm);
        console.log('Updated list of motion sensors:', connected_idms);
        if (mdata.Type === motionsensor && mdata.TypeMsg === type_m_one) {

            console.log('Creating a new data entry for motion sensor id :', mdata.idm);
            var motion_sensornew = new Motionsensordata({
                Type: mdata.Type,
                id: mdata.idm,
                connectstatus: mdata.data,
                motionread: false,
            })
            console.log('Motion Sensor :' + mdata.idm + ' ..New data is ', motion_sensornew);
            motion_sensornew.save().then(doc => {
                console.log('Saved motion sensor data:', doc);
            }) /*.then(() => {
                mongoose.connection.close();
            */
        }

    }


})



//smart ight onoff status
// motion sensor read data
// 

server.post('/smart_light/onoffstatus', (req, res) => {
    let dataonoff = req.body;
    //check whether the smart light id has already registered in the database
    //if yes then add the new on off status to the entry
    Smartlightdata.exists({ id: dataonoff.id }, function (err, docs) {
        if (err) {
            console.log(err);
        }
        else {
            var check = docs;
            if (check === true) {
                console.log('Yes its in the database:: ID : ', dataonoff.id); // show the id
                console.log('On or OFF received from mqttserver : ', dataonoff.data);
                Smartlightdata.updateOne({ id: dataonoff.id }, { $push: {actionon_off: [dataonoff.data]} });
                mongoose.connection.close();
               // console.log(dataonoff.data);
                res.send(JSON.stringify(dataonoff));

                // 1.update mongodb "actionon_off" using push
                // 2.change the schema actionon_off to [bool]
                // 3.

            }

        }

    })

})

