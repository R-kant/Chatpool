const express= require('express'),
 bodyParser=require('body-parser'),
 mongoose = require('mongoose'),
 User     = require('./models/user'),
 passport = require('passport'),
 localStratergy=require('passport-local'),
 passportlm= require('passport-local-mongoose'),
 socket= require('socket.io');


mongoose.connect("mongodb://R:991155@cluster0-shard-00-00-jm0pv.mongodb.net:27017,cluster0-shard-00-01-jm0pv.mongodb.net:27017,cluster0-shard-00-02-jm0pv.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true", { useNewUrlParser: true });
var app= express();
app.use(express.static("public"));
var handleName ;
app.use(require('express-session')({
	secret: "Ravikant Mishra",
	resave:false,
	saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({extended:true}));
passport.use(new localStratergy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.set('view engine','ejs');
//=======
//Routes
//=======
app.get('/',isLoggedin,function(req,res){
	res.render('chatPage',{handle:handleName});
});


// Auth Routes

app.get('/register',function(req,res){
	res.render('register');
});

app.post('/register',function(req,res){

	User.register(new User({username:req.body.username}),req.body.password,function(err,user){
		if(err){
			console.log(err);
		}
		else
		{
			
			res.redirect('/login');
		}
	});
});

app.get("/login",function(req,res){
	res.render('login');
});

app.post('/login',passport.authenticate('local',{
	successRedirect: '/',
	failureRedirect: '/login'
}), function(req,res){
});

app.get('/logout',function(req,res){
	req.logout();
	res.redirect('/');
});


function isLoggedin(req,res,next){
	if(req.isAuthenticated()){
		handleName=req.user.username;
		return next();
	}
	res.redirect('/login');
}
var server=app.listen(process.env.PORT,process.env.IP);

var io = socket(server);
var users=[];
var cnt=0;
io.sockets.on('connection',function(socket){
	users.push({
		id:socket.id,
		userHandle:handleName
		});
	cnt++;
	
	socket.broadcast.emit('new-user',
		{
			newUser:handleName,


		}
	);
	io.emit('updateList',{cnt:cnt});
	socket.on('chat-message',function(data){
		
		io.emit('chat-message',data);
		socket.broadcast.emit('play');
	});
	socket.on('disconnect',function(){
		//console.log('server side disconnect');
		cnt--;
		var data={
			disconnectedUser:null,
			cnt:cnt
		};
		users.forEach(function(user){
			if(user.id==socket.id)
			{
					data.disconnectedUser=user.userHandle;
				//console.log(user.userHandle);	
			}
		});
		
		
		socket.broadcast.emit('user-disconnect',data);

	});
	socket.on('typing',function(data){
		socket.broadcast.emit('typing',data);
	})
	
});
