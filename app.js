var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var bodyParser = require('body-parser');
var fs = require('fs');
var mkdirp = require('mkdirp');
var busboy = require('connect-busboy');

var app = express();
var User = require('./User.model');
var Image = require('./Image.model');
var mongoose = require('mongoose');
var path = require('path');
var userName = null;
var userData = Array();

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
// app.use(logger('dev'));
app.use(bodyParser.json({limit: '15mb'}));
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    limit: '15mb',
    extended: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'users_folder')));
app.use(busboy());
app.route('/galery');
app.route('/galery/delete');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(function(req, res, next) {
    if (!req.user) {
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        res.header('Expires', '-1');
        res.header('Pragma', 'no-cache');
    }
    next();
});

// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));
//
// app.use('/', routes);
// app.use('/users', users);


//////////////////////////////////////////////////////////

const pg = require('pg');
const connectionString = 'postgres://sqxlcsuymisnbu:dyXu70Wuc2jTXyGwFGXFEnYloD@ec2-50-19-227-171.compute-1.amazonaws.com:5432/d66fqis9thtm0k';

var client = new pg.Client({
    user: "sqxlcsuymisnbu",
    password: "dyXu70Wuc2jTXyGwFGXFEnYloD",
    database: "d66fqis9thtm0k",
    port: 5432,
    host: "ec2-50-19-227-171.compute-1.amazonaws.com",
    ssl: true
}); 
client.connect();

   // "dbname=d66fqis9thtm0k host=ec2-50-19-227-171.compute-1.amazonaws.com port=54
// 32 user=sqxlcsuymisnbu password=dyXu70Wuc2jTXyGwFGXFEnYloD sslmode=require"
// Connection URL:
    // postgres://sqxlcsuymisnbu:dyXu70Wuc2jTXyGwFGXFEnYloD@ec2-50-19-227-171.compu
// te-1.amazonaws.com:5432/d66fqis9thtm0k

///////////////////////////////////////////////////////////
// var db = 'mongodb://localhost/db';
// mongoose.Promise = global.Promise;
// mongoose.connect(db);

app.get('/', function(req, res){
    res.send('happy to be here');
    console.log("================");
});

app.get('/users', function(req, res){
    console.log('getting all users');
    
    // User.find({})
    //     .exec(function(err, users){
    //         if (err){
    //             res.send(err);
    //         }else{
    //             console.log(users);
    //             res.json(users);
    //         }
    //     });
});

// app.get('/users/:id', function(req, res){
//     console.log('getting one user');
//     User.findOne({
//          _id:req.params.id
//     })
//         .exec(function(err, user){
//             if (err){
//                 res.send('Error!!!');
//             }else {
//                 console.log(user);
//                 res.json(user);
//             }
//         })
// });


app.get('/login', function(req, resp) {
    resp.sendFile( path.join( __dirname, 'public/index.html' ));//'./index.html', {root: __dirname});
});

app.post('/login', function(req, res){
    client.query('SELECT user_password FROM "users" WHERE user_name=$1;', [req.body.username], function (err, result) {
        if (err) {
             res.send(err);
            return console.error('error happened during query', err);
        }
        if (result.rows.length > 0){
            if (result.rows[0].user_password == req.body.password){
                userName = req.body.username;
                res.redirect('/galery');
            }
            else {
                res.redirect('/login');
            }
        }
    });
});
app.get('/signup', function(req, res){
   res.render('signup')
});

app.post('/signup', function(req, res){
    mkdirp(__dirname + '/users_folder/'+req.body.username+'/', function(err) {
        client.query('INSERT INTO "users" VALUES ($1, $2);', [req.body.username, req.body.password], function(err){
            if (err){
                res.render(err)
            }else
                res.redirect('/login')
        });
    });
});

app.get('/logout', function(req, res){
    res.clearCookie();
    res.redirect('/login');
    userName = null;
});

app.get('/galery', function(req, res){
    if (userName == null){
        res.redirect('/login');
        // userName = 'null';
    }
    client.query('SELECT img_name FROM "images" WHERE user_name=$1;',[userName],  function (err, result) {
        if (err) {
            res.send(err);
        }
        if(result){
            var data = [];
            for (i=0; i<result.rows.length; ++i ){
                data[i] = String(result.rows[i].img_name);
            }
            userData = [data, userName];
            res.render('galery', {data: data, owner: userName});
        }else
            res.render('galery', {});
    });
    // Image.find({"owner": userName}, function(err, data){
    //     console.log('Img'+data);
    //     if (data!="") {
    //         console.log('=======Start==========');
    //         for (i = 0; i < data.length; i++) {
    //             console.log(data[i])
    //             console.log('========End=========');
    //         }
    //         res.render('galery', {data: data, owner: data[0].owner});
    //     }else{
    //         res.render('galery', {});
    //     }

    // });
});


app.post('/galery', function(req, res){
    var fstream;
    var path = userName+'/';
    console.log("Uploading "+userName);
    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldname, file, filename) {
        fstream = fs.createWriteStream(__dirname + '/users_folder/'+userName+'/'+filename );
        file.pipe(fstream);

        client.query('INSERT INTO "images" VALUES ($1, $2, $3);',[userName, filename, path], function(err){
            if (err){
                res.render(err);
            }else{
                res.redirect('/galery');
            }

        });
        // fstream.on('close', function () {
        //     res.render('galery');
        // });
    });
});

app.post('/galery/delete', function(req, res){
    console.log('body-> ',req.body);
    var img_name = (req.body.img_name);
    console.log('DELETE img_name->'+img_name);

    if (img_name) {
        client.query("DELETE FROM images WHERE img_name=$1;", [img_name], function (err) {
            fs.unlinkSync(__dirname + '/users_folder/'+userName+'/'+img_name, function(err) {
                if (err) {
                    // return console.error(err);
                }
                console.log("File deleted successfully!");
            });
            if(err){
                // return console.error(err);
            }
        });
        res.redirect('/galery');

    }else
        res.redirect('/login');
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

// app.set('port', (process.env.port ||3000));
// app.listen(app.get('port'), function(){
//         console.log('Node js is listen on port ',app.get('port'), app.settings.env);
//     });
app.listen(process.env.PORT || 3001, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});
module.exports = app;
