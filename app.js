var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var bodyParser = require('body-parser');
var fs = require('fs');
var busboy = require('connect-busboy');
var jq = require('jquery');


var app = express();
var User = require('./User.model');
var Image = require('./Image.model');
var mongoose = require('mongoose');
var path = require('path');

var userName = null;

// // view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
// app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'users_folder')));
app.use(busboy());
app.route('/galery');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));
//
// app.use('/', routes);
// app.use('/users', users);


///////////////////////////////////////////////////////////


// var db = 'mongodb://localhost/db';
var db = 'mongodb://192.168.1.101:27017/db';
mongoose.Promise = global.Promise;
// mongoose.connect(db);

app.get('/', function(req, res){
    res.send('happy to be here');
    console.log("================");
});

app.get('/users', function(req, res){
    console.log('getting all users');
    User.find({})
        .exec(function(err, users){
            if (err){
                res.send(err);
            }else{
                console.log(users);
                res.json(users);
            }
        });
});

app.get('/users/:id', function(req, res){
    console.log('getting one user');
    User.findOne({
         _id:req.params.id
    })
        .exec(function(err, user){
            if (err){
                res.send('Error!!!');
            }else {
                console.log(user);
                res.json(user);
            }
        })
});


app.get('/login', function(req, resp) {
    resp.sendFile( path.join( __dirname, 'public/index.html' ));//'./index.html', {root: __dirname});
});

app.post('/login', function(req, res){
    console.log(req.body.username + ' - ' + req.body.password);
    console.log(req.body);

    User.findOne({"name":req.body.username, "password":req.body.password}, function(err, users){
            if (err){
                res.send(err);
            }else{
                console.log('Users: ' + users);
                if (users!=null) {
                    userName = req.body.username;
                    res.redirect('/galery')
                }else{
                    // res.redirect('/login');
                    res.sendFile(path.join(__dirname, 'public/index.html'));
                }
            }
        });
});
app.get('/signup', function(req, res){
   res.render('signup')
});

app.post('/signup', function(req, res){
    var user = new User({
        "name":req.body.username,
        "password":req.body.password
    }, { strict: false });
    user.save(function(err){
        res.redirect('/login')
    });
})

app.get('/galery', function(req, res){

    if (userName == null){
        userName = 'null';
    }
    Image.find({"owner": userName}, function(err, data){
        console.log('Img'+data);
        if (data!="") {
            console.log('=======Start==========');
            for (i = 0; i < data.length; i++) {
                console.log(data[i])
                console.log('========End=========');
            }
            res.render('galery', {data: data, owner: data[0].owner});
        }else{
            res.render('galery', {});
        }

    });
});


// var myObject, newfolder;
// myObject = new ActiveXObject("Scripting.FileSystemObject");
// newfolder = myObject.CreateFolder ("c:\\newtmp\\");

app.post('/galery', function(req, res){
    var fstream;
    var path = userName+'/';
    console.log("Uploading "+userName);
    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldname, file, filename) {
        console.log("Uploading: " + filename);
        console.log("Uploading: " + fieldname);
        console.log("Uploading: " + file);
        fstream = fs.createWriteStream(__dirname + '/users_folder/'+userName+'/'+filename );
        file.pipe(fstream);
        var img = new Image({
            'owner':userName,
            'img_name':filename,
            'img_path':path
        }, { strict: false });
        console.log('Schema =>'+img);
        img.save(function(err){

        });
        fstream.on('close', function () {
            Image.find({}).exec( function(err, data){
                console.log('Data'+data)
                console.log(' ')
            });
            res.render('galery');
        });
    });
});

/////////////////////////////////////////////////////////////

//
// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   var err = new Error('Not Found');
//   err.status = 404;
//   next(err);
// });
//
//
// // error handlers
//
// // development error handler
// // will print stacktrace
// if (app.get('env') === 'development') {
//   app.use(function(err, req, res, next) {
//     res.status(err.status || 500);
//     res.render('error', {
//       message: err.message,
//       error: err
//     });
//   });
// }
//
// // production error handler
// // no stacktraces leaked to user
// app.use(function(err, req, res, next) {
//   res.status(err.status || 500);
//   res.render('error', {
//     message: err.message,
//     error: {}
//   });
// });

app.use(express.static(__dirname+'public'));
app.use('/css',express.static(path.join(__dirname, 'public/stylesheets')));
app.use(express.static('/public/stylesheets/'));
module.exports = app;
