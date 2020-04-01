const express = require('express');
const app = express();
const axios = require('axios');
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser');

//config body-parser
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

//config handlebars
app.engine('handlebars', handlebars({defaultLayout: 'main'}))
app.set('view engine', 'handlebars')

//.env
const dotenv = require('dotenv');
dotenv.config();

console.log(process.env.TEST)

app.get('/', (req, res) => {

    axios({
        "method": "GET",
        "url": "https://fortniteapi.io/shop?lang=en",
        "headers": {
            "Authorization": process.env.API_KEY_FORTNITE
        }
    }).then(response => {
        console.log(response.data.featured)
        var d = new Date()
        var date = d.toLocaleDateString();
        res.render('index', {
            results: response.data.featured,
            date
        })
    }).catch(err => {
        console.log(err)
    })

    
});

app.get('/searchID', (req, res) => {
    res.render('searchID')
});

app.post('/searchIDprocess', (req, res) => {
    axios({
        "method": "GET",
        "url": `https://fortniteapi.io/lookup?username=${req.body.username}`,
        "headers": {
            "Authorization": process.env.API_KEY_FORTNITE
        } 
    }).then(response => {
        if (response.data.result) {
            const player_id = response.data.account_id
            res.render('searchID', {
                player_id
            })
        } else {
            const player_id = 'Este username não existe!'
            res.render('searchID', {
                player_id
            })
        }
    }).catch(err => {
        console.log(err)
    })
});

app.get('/statusPlayer', (req, res) => {
    res.render('statusPlayer')
});

app.post('/searchStatus', (req, res) => {
    const player_id = req.body.player_id
    axios({
        "method": "GET",
        "url": `https://fortniteapi.io/matches?account=${player_id}`,
        "headers": {
            "Authorization": process.env.API_KEY_FORTNITE
        }
    }).then(response => {
        if (response.data.result) {
            //console.log(response.data.matches)
            var tournaments = []
            for ( var i = 0; i <= response.data.matches.length; i++ ) {
                if (response.data.matches[i]) {
                    if ( response.data.matches[i].readable_name == 'Tournament (Duos)' ) {
                        response.data.matches[i].imageURL = process.env.IMAGE_URL_TOURNAMENT_DUOS
                        tournaments.push(response.data.matches[i])
                    } else {
                        if ( response.data.matches[i].readable_name == 'Tournament (Solo)') {
                            response.data.matches[i].imageURL = process.env.IMAGE_URL_TOURNAMENT_SOLO
                            tournaments.push(response.data.matches[i])
                        }
                    }
                }
            }

            console.log(response.data.matches)
            //console.log(tournaments)

            res.render('statusPlayer', {
                results: tournaments
            })
        } else {
            axios({
                "method": "GET",
                "url": `https://fortniteapi.io/lookup?username=${player_id}`,
                "headers": {
                    "Authorization": process.env.API_KEY_FORTNITE
                } 
            }).then(response => {
                if (response.data.result) {
                    const user_id = response.data.account_id
                    axios({
                        "method": "GET",
                        "url": `https://fortniteapi.io/matches?account=${user_id}`,
                        "headers": {
                            "Authorization": process.env.API_KEY_FORTNITE
                        }
                    }).then(response => {
                        console.log(response.data)
                        var tournaments = []
                        for ( var i = 0; i <= response.data.matches.length; i++ ) {
                            if (response.data.matches[i]) {
                                if ( response.data.matches[i].readable_name == 'Tournament (Duos)' ) {
                                    response.data.matches[i].imageURL = process.env.IMAGE_URL_TOURNAMENT_DUOS
                                    tournaments.push(response.data.matches[i])
                                } else {
                                    if ( response.data.matches[i].readable_name == 'Tournament (Solo)') {
                                        response.data.matches[i].imageURL = process.env.IMAGE_URL_TOURNAMENT_SOLO
                                        tournaments.push(response.data.matches[i])
                                    }
                                }
                            }
                        }
            
                        //console.log(response.data.matches)
                        //console.log(tournaments)
            
                        res.render('statusPlayer', {
                            results: tournaments
                        })
                    })


                } else {
                    res.render('statusPlayer', {
                        alert: 'Username/ID invalid!'
                    })
                }


            }).catch(err => {
                console.log(err)
            })
        }
        

    }).catch(err => {
        console.log(err)
    })
});

app.get('/allmaps', (req, res) => {
    axios({
        "method": "GET",
        "url": "https://fortniteapi.io/maps/list",
        "headers": {
            "Authorization": process.env.API_KEY_FORTNITE
        }
    }).then(response => {
        const maps = []
        for (var i = 0; i <= response.data.maps.length; i++ ) {
            if (response.data.maps[i]) {
                if (response.data.maps[i].urlPOI == null ) {
                    response.data.maps[i].imageURL = response.data.maps[i].url
                    maps.push(response.data.maps[i])
                } else {
                    response.data.maps[i].imageURL = response.data.maps[i].urlPOI
                    maps.push(response.data.maps[i])
                }
            }
        }

        console.log(maps)
        res.render('allmaps', {
            maps
        })
    }).catch(err => {
        console.log(err)
    })
});

app.get('/battlepass', (req, res) => {
    axios({
        "method": "GET",
        "url": "https://fortniteapi.io/battlepass?lang=en&season=current",
        "headers": {
            "Authorization": process.env.API_KEY_FORTNITE
        }
    }).then(response => {
        const BattlePassPaid = []

        for (var i = 0; i <= response.data.paid.rewards.length; i++) {
            if (response.data.paid.rewards[i]) {
                if (response.data.paid.rewards[i].images.full_background) {
                    response.data.paid.rewards[i].full_backgroundURL = response.data.paid.rewards[i].images.full_background
                    BattlePassPaid.push(response.data.paid.rewards[i])
                } else {
                    response.data.paid.rewards[i].full_backgroundURL = response.data.paid.rewards[i].images.icon
                    BattlePassPaid.push(response.data.paid.rewards[i])
                }
                
            }
        }

        
        const BattlePassFree = []

        for (var i = 0; i <= response.data.free.rewards.length; i++) {
            if ( response.data.free.rewards[i]) {
                if ( response.data.free.rewards[i].full_background) {
                    response.data.free.rewards[i].full_backgroundURL = response.data.free.rewards[i].images.full_background
                    BattlePassFree.push(response.data.free.rewards[i])
                } else {
                    response.data.free.rewards[i].full_backgroundURL = response.data.free.rewards[i].images.icon
                    BattlePassFree.push(response.data.free.rewards[i])
                }
            }
        }

        res.render('battlepass', {
            BattlePassPaid, BattlePassFree
        })
    }).catch(error => {
        console.log(error)
    })
});

app.listen(process.env.PORT_THIS_SERVER, (req, res) => {
    console.log(`Server is running in port ${process.env.PORT_THIS_SERVER}`)
});


const API = require('call-of-duty-api')({ platform: "battle" });

API.MWwz('Gabrielh2c#1234').then(data => {
    console.log(data.br);  // see output
    const time_played_m = parseInt(data.br.timePlayed) / 60 
    const time_played_h = (time_played_m / 60) 
}).catch(err => {
    console.log(err);
});