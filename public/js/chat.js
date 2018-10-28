
var socket = io.connect();

var box =$('#chat_box');
var send=$('#sendBtn');
var bottom=true;
var typing =false;
var message= $('#message');
var noP=$('#noP');
var userName=$('#invisible').text();
if(userName===undefined)
 userName= anonymous;
var colors=['green-text','yellow-text text-darken-2','red-text','blue-text','teal-text','brown-text','black-text','purple-text','orange-text','pink-text','amber-text','indigo-text','lime-text','deep-purple-text','light-green-text'];
var r=Math.floor((Math.random() *colors.length) );


send.click(sent);
message.on('keydown',function(e){
	if(e.keyCode === 13){
		//console.log($('.typing'));
	
		sent();
	}
	else{
		if(!typing)
		{
			socket.emit('typing',{userT:userName});
			typing=true;
		}
	}
});

socket.on('typing',function(data){
	check();
	box.append('<p class=" typing green-text" >'+data.userT + ' is typing...</p>');
	if(bottom)
 		box.stop().animate({scrollTop:box.prop('scrollHeight')},3000);
})
function sent(){
	typing=false;
	socket.emit('chat-message',{
		message : message.val(),
		userName:userName,
		color:colors[r]
	});
	message.val('');
}
socket.on('new-user',function(data){
	//console.log('inside this');
	
	//console.log(data.newUser);
	box.append('<p class="center-align users green-text" >'+data.newUser + ' has joined</p>');
	// if(bottom)
	//console.log(data.count);
	
 		box.stop().animate({scrollTop:box.prop('scrollHeight')},3000);
	setTimeout(function(){ $('.users').fadeOut() }, 2000);
});
socket.on('updateList',function(data){
	noP.text('There are '+data.cnt+' participants');
})
socket.on('chat-message',function(data){
	$('.typing').remove();
check();	
	box.append('<p class="messages grey lighten-2 " ><span id="userHandle" class='+data.color+' >' + data.userName + ' :</span>  '+ data.message + '</p>');

	// $('#chat_box').animate({ scrollTop: $(document).height() }, "slow");
 // 		 return false;
 
 		if(bottom)
 		box.stop().animate({scrollTop:box.prop('scrollHeight')},3000);
 	
 		  //box.scrollTop(box.prop('scrollHeight'));
			
	//$("#chat_box").scrollTop($("#chat_box").children().height());
});
socket.on('play',function(){
	$.playSound("./assets/chatSound.mp3");
})
function check(){
	//console.log(box.scrollTop()+", "+box.prop('scrollHeight'));

	if(box.scrollTop()+300<box.prop('scrollHeight'))
		bottom=false;
	else
		bottom=true;
}
socket.on('user-disconnect',function(data){
		
	
	//console.log(data.newUser);
	box.append('<p class="center-align users red-text darken-2" >'+data.disconnectedUser + ' has disconnected</p>');

	//if(bottom)
	
	noP.text('There are '+data.cnt+' participants');
 		box.stop().animate({scrollTop:box.prop('scrollHeight')},3000);
	setTimeout(function(){ $('.users').fadeOut() }, 2000);	
})
