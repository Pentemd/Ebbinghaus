const {parse} = require("url")
const express = require("express")
const {engine} = require("express-handlebars")
const {join} = require('path');
const { spawn } = require('child_process');
const {readFileSync, writeFileSync} = require("fs")


const {mainTasks} = require('./api/appTasks')


const EventEmitter = require("events")
const PORT = process.env.PORT || 8080
const THEURL = process.env.HOST || "localhost"

let api = new EventEmitter()
let server = express()


server.engine("handlebars",engine())
server.set('view engine', "handlebars")
server.set("views",join(__dirname, "views"))
server.use(express.static(join(__dirname, "public")))



server.get('/', (req, res) =>{
    res.render('home', {
        title : "Home"
    })

    
})

api.on("tasks", (nameof, dateof)=> {
    
    let tasksToCreate = [
        { title: nameof, due: dating(dateof, 0), notes: "Découverte du cours, le but est de comprendre parfaitement le cours (lecture active). Il faut être capable de l'expliquer devant toute la division." },
        { title: nameof, due: dating(dateof, 2), notes: "C'est l'heure de commencer les exos en relisant le cours de façon plus active. Prendre conscience des questions récurrentes et des erreurs que je fais" },
        { title: nameof, due: dating(dateof, 7), notes: "Plus d'exercices. Les questions sont maîtrisées, le cours est appliqué aux exos sans plus avoir besoin de celui ci." },
        { title: nameof, due: dating(dateof, 14), notes: "Faire les annales" }
        
      ];

    runTasks(tasksToCreate).catch((error) => {
        console.error('Erreur:', error);
    });
    
})
api.on("cal", (nameof, dateof) => {
    let [date1, date2, date3, date4] = [dating(dateof, 1), dating(dateof, 3), dating(dateof, 7), dating(dateof, 30)];
    const eventsToCreate = [
        {
          summary: nameof,
          description: "",
          start: {
            date: date1
          },
          end: {
            date: date1
          },
        },
        {
          summary: nameof,
          description: "",
          start: {
            date: date2
          },
          end: {
            date: date2
          },
        },
        {
            summary: nameof,
            description: "",
            start: {
              date: date3
            },
            end: {
              date: date3
            },
          },
          {
            summary: nameof,
            description: "",
            start: {
              date: date4
            },
            end: {
              date: date4
            },
          }
      ];

      mainCalendar(eventsToCreate)
})

server.get('/tasks', (req, res) =>{
    res.render('tasks', {
        title : "Ebbinghaus Tasks"
    })
    let ver = verify(req.url)
    if (ver[0] === true){
        console.log('Starting the process : Tasks')
        try{
        api.emit("tasks", ver[1].name, ver[1].date)
        }catch(err){
          console.log("Erreur !")
          //throw err;
        }
    }

    
})

server.listen(PORT, THEURL, () => {
    console.log("server is " + THEURL+ ":"+ PORT)
})


function dating(dateof, time){
    const event = new Date (dateof) 
    event.setDate(event.getDate() + time)
    let jsonDate = event.toJSON();
    jsonDate = jsonDate.split('T')
    jsonDate = jsonDate[0]
    return jsonDate
}

async function runTasks(tasksToCreate) {
    await mainTasks(tasksToCreate);
    console.log('Toutes les tâches ont été créées.');
  }


function verify(url){
    let query = parse(url, true).query
    if (query.name === undefined || query.date === undefined){
        console.log("Le Formulaire n'est pas valide")
        return [false, undefined];
    }else{
      console.log(query.date === undefined)
      console.log("Le Formulaire est valide", query.date)
        return [true, query];
             
    }
}
