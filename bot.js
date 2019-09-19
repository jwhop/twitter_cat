var Twitter = require('twit');
const http = require('http');
const express = require('express');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
var bodyParser = require('body-parser');
var crypto = require('crypto');


var usr_directory = [];
var tweet_directory = [];


 var T = new Twitter({
        consumer_key: process.env.CONSUMER_KEY,
        consumer_secret: process.env.CONSUMER_SECRET,
        access_token: process.env.ACCESS_TOKEN,
        access_token_secret: process.env.ACCESS_TOKEN_SECRET
    });


console.log('Authentication successful. Running bot...\r\n')

const app = express();
app.use(bodyParser.json());
var router = express.Router();


// a middleware function with no mount path. This code is executed for every request to the router
router.use(function (req, res, next) {
  console.log('Time:', Date.now())
  next()
});

// a middleware sub-stack shows request info for any type of HTTP request to the /user/:id path
router.use('/', function (req, res, next) {
	
	if(req.query.crc_token != null)
	{
	console.log(req.query.crc_token);
	
	
	hmac = crypto.createHmac('sha256', process.env.CONSUMER_SECRET).update(req.query.crc_token).digest('base64')

	var txt = '{ "response_token": ' + '"sha256='+String(hmac) + '"}';
	console.log(txt);
	var obj = JSON.parse(txt);
	console.log(obj);
	res.send(obj);
	}
  next()
}, 
  
  function (req, res, next) {
  console.log('Request Type:', req.method)
  next()
});

function personalize(str, usr)
{
	var string = "@";
	string += String(usr);
	string += (str);
	return string;
	
}
var can_tweet_RT = true;
// mount the router on the app
app.use('/', router);
app.post('/', (req, res) => {
	console.log(req.body.favorite_events);
	
	if((req.body.tweet_create_events != null) && 
	(String(req.body.tweet_create_events[0].text).substr(0,2) == 'RT') &&
	can_tweet_RT)
	{
		can_tweet_RT = !can_tweet_RT;
		var tweet = req.body.tweet_create_events[0];
		if(typeof usr_directory.find(user => user.id === tweet.user.id_str) === 'undefined')
				{
					console.log("we got a new user!");
					console.log(tweet);
					usr_directory.push({name: tweet.user.screen_name, id: tweet.user.id_str, pet_score: 0, play_score: 0, feed_score: 0, num_visits: 1, visiting: false, visiting_timer: null});

				}
		
		var tg = usr_directory[usr_directory.findIndex(find_usr, tweet.user.id_str)];
		
		clearTimeout(tg.visiting_timer);

		T.post('statuses/update', { status: personalize(play_meows[Math.floor(Math.random()*play_meows.length)], tweet.user.screen_name)
					}, function(err, data, response) {
				console.log("play reply!")
				});
		
		
		tg.visiting_timer = setTimeout(function(){lonely_time(tg.name, tg.visiting_timer);},1000*60*2);
			
	}

	else if(req.body.favorite_events != null && req.body.favorite_events[0])
	{
		var tweet = req.body.favorite_events[0];
		if(typeof usr_directory.find(user => user.id === tweet.user.id_str) === 'undefined')
				{
					console.log("we got a new user!");
					console.log(tweet);
					usr_directory.push({name: tweet.user.screen_name, id: tweet.user.id_str, pet_score: 0, play_score: 0, feed_score: 0, num_visits: 1, visiting: false, visiting_timer: null});

				}
		
		var tg = usr_directory[usr_directory.findIndex(find_usr, tweet.user.id_str)];
		
		clearTimeout(tg.visiting_timer);

		T.post('statuses/update', { status: personalize(pet_meows[Math.floor(Math.random()*pet_meows.length)], tweet.user.screen_name)
					}, function(err, data, response) {
				console.log("pet reply!")
				});
		
		
		tg.visiting_timer = setTimeout(function(){lonely_time(tg.name, tg.visiting_timer);},1000*60*2);
			
		
	}
	else if(!can_tweet_RT)
		can_tweet_RT = !can_tweet_RT;
	
	res.send("");
});
function lonely_time(name, timer)
{
	T.post('statuses/update', { status: personalize(lonely_meows[Math.floor(Math.random()*lonely_meows.length)], name)
					}, function(err, data, response) {
				console.log("lonely! reply!")
				});
	timer = setTimeout(function(){lonely_time(name, timer)},1000*60*2);
	
}
const PORT = process.env.PORT || 3000;
http.createServer(app).listen(PORT, () => {
  console.log('Express server listening on port' + PORT);
});




var pet_texts_1 = ['You give Belle some chin scratches', 'You scratch Belle behind her ears', 'You pat Belle on her head.', 'You pet Belle along her back.', 'You give Belle belly rubs.'];
var pet_texts_2 = ['She purrs and closes her eyes.', 'She purrs and nuzzles her head against your hand', 'She blinks slowly at you', 'You feel warm and fuzzy inside', 'She purrs and nods off to sleep', 'She starts kneading on a blanket'];
var pet_meows = [' gives Belle some chin scratches.  \n\
              ∧__∧　           \n\
　　     (  ^ . ^ ) (              She purrs and \n\
       ____ |  ¥  |__)_________  nuzzles her head \n\
             (_\\__/_)                 against their hand.          \n\
      ——————/———', ' gives Belle some chin scratches.  \n\
              ∧__∧　           \n\
　　     (  ^ . ^ ) (              She purrs and \n\
       ____ |  ¥  |__)_________  closes her \n\
             (_\\__/_)                   eyes.          \n\
      ——————/———',' gives Belle some chin scratches.  \n\
              ∧__∧　           \n\
　　     (  ^ . ^ ) (              She blinks\n\
       ____ |  ¥  |__)_________  slowly at \n\
             (_\\__/_)                   them.          \n\
      ——————/———',' gives Belle some chin scratches.  \n\
              ∧__∧　           \n\
　　     (  ^ . ^ ) (              They feel \n\
       ____ |  ¥  |__)_________  warm and  \n\
             (_\\__/_)             fuzzy inside.          \n\
      ——————/———',' gives Belle some chin scratches.  \n\
              ∧__∧　           \n\
　　     (  ^ . ^ ) (              She purrs \n\
       ____ |  ¥  |__)_________  and nods \n\
             (_\\__/_)                   off to sleep.          \n\
      ——————/———',' gives Belle some chin scratches.  \n\
              ∧__∧　           \n\
　　     (  ^ . ^ ) (              She starts \n\
       ____ |  ¥  |__)_________  kneading on \n\
             (_\\__/_)                   a blanket.          \n\
      ——————/———', ' scratches Belle behind her ears.  \n\
              ∧__∧　           \n\
　　     (  ^ . ^ ) (              She purrs and \n\
       ____ |  ¥  |__)_________  nuzzles her head \n\
             (_\\__/_)                 against their hand.          \n\
      ——————/———', ' scratches Belle behind her ears.  \n\
              ∧__∧　           \n\
　　     (  ^ . ^ ) (              She purrs and \n\
       ____ |  ¥  |__)_________  closes her \n\
             (_\\__/_)                   eyes.          \n\
      ——————/———',' scratches Belle behind her ears.  \n\
              ∧__∧　           \n\
　　     (  ^ . ^ ) (              She blinks\n\
       ____ |  ¥  |__)_________  slowly at \n\
             (_\\__/_)                   them.          \n\
      ——————/———',' scratches Belle behind her ears.  \n\
              ∧__∧　           \n\
　　     (  ^ . ^ ) (              They feel \n\
       ____ |  ¥  |__)_________  warm and  \n\
             (_\\__/_)             fuzzy inside.          \n\
      ——————/———',' scratches Belle behind her ears.  \n\
              ∧__∧　           \n\
　　     (  ^ . ^ ) (              She purrs \n\
       ____ |  ¥  |__)_________  and nods \n\
             (_\\__/_)                   off to sleep.          \n\
      ——————/———',' scratches Belle behind her ears.  \n\
              ∧__∧　           \n\
　　     (  ^ . ^ ) (              She starts \n\
       ____ |  ¥  |__)_________  kneading on \n\
             (_\\__/_)                   a blanket.          \n\
      ——————/———', ' pats Belle on her head.  \n\
              ∧__∧　           \n\
　　     (  ^ . ^ ) (              She purrs and \n\
       ____ |  ¥  |__)_________  nuzzles her head \n\
             (_\\__/_)                 against their hand.          \n\
      ——————/———', ' pats Belle on her head.  \n\
              ∧__∧　           \n\
　　     (  ^ . ^ ) (              She purrs and \n\
       ____ |  ¥  |__)_________  closes her \n\
             (_\\__/_)                   eyes.          \n\
      ——————/———',' pats Belle on her head.  \n\
              ∧__∧　           \n\
　　     (  ^ . ^ ) (              She blinks\n\
       ____ |  ¥  |__)_________  slowly at \n\
             (_\\__/_)                   them.          \n\
      ——————/———',' pats Belle on her head.  \n\
              ∧__∧　           \n\
　　     (  ^ . ^ ) (              They feel \n\
       ____ |  ¥  |__)_________  warm and  \n\
             (_\\__/_)             fuzzy inside.          \n\
      ——————/———',' pats Belle on her head.  \n\
              ∧__∧　           \n\
　　     (  ^ . ^ ) (              She purrs \n\
       ____ |  ¥  |__)_________  and nods \n\
             (_\\__/_)                   off to sleep.          \n\
      ——————/———',' pats Belle on her head.  \n\
              ∧__∧　           \n\
　　     (  ^ . ^ ) (              She starts \n\
       ____ |  ¥  |__)_________  kneading on \n\
             (_\\__/_)                   a blanket.          \n\
      ——————/———', ' pets Belle along her back.  \n\
              ∧__∧　           \n\
　　     (  ^ . ^ ) (              She purrs and \n\
       ____ |  ¥  |__)_________  nuzzles her head \n\
             (_\\__/_)                 against their hand.          \n\
      ——————/———', ' pets Belle along her back.  \n\
              ∧__∧　           \n\
　　     (  ^ . ^ ) (              She purrs and \n\
       ____ |  ¥  |__)_________  closes her \n\
             (_\\__/_)                   eyes.          \n\
      ——————/———',' pets Belle along her back.  \n\
              ∧__∧　           \n\
　　     (  ^ . ^ ) (              She blinks\n\
       ____ |  ¥  |__)_________  slowly at \n\
             (_\\__/_)                   them.          \n\
      ——————/———',' pets Belle along her back.  \n\
              ∧__∧　           \n\
　　     (  ^ . ^ ) (              They feel \n\
       ____ |  ¥  |__)_________  warm and  \n\
             (_\\__/_)              fuzzy inside.          \n\
      ——————/———',' pets Belle along her back.  \n\
              ∧__∧　           \n\
　　     (  ^ . ^ ) (              She purrs \n\
       ____ |  ¥  |__)_________  and nods \n\
             (_\\__/_)                   off to sleep.          \n\
      ——————/———',' pets Belle along her back.  \n\
              ∧__∧　           \n\
　　     (  ^ . ^ ) (              She starts \n\
       ____ |  ¥  |__)_________  kneading on \n\
             (_\\__/_)                   a blanket.          \n\
      ——————/———', ' gives Belle belly rubs.  \n\
              ∧__∧　           \n\
　　     (  ^ . ^ ) (              She purrs and \n\
       ____ |  ¥  |__)_________  nuzzles her head \n\
             (_\\__/_)                 against their hand.          \n\
      ——————/———', ' gives Belle belly rubs.  \n\
              ∧__∧　           \n\
　　     (  ^ . ^ ) (              She purrs and \n\
       ____ |  ¥  |__)_________  closes her \n\
             (_\\__/_)                   eyes.          \n\
      ——————/———',' gives Belle belly rubs.  \n\
              ∧__∧　           \n\
　　     (  ^ . ^ ) (              She blinks\n\
       ____ |  ¥  |__)_________  slowly at \n\
             (_\\__/_)                   them.          \n\
      ——————/———',' gives Belle belly rubs.  \n\
              ∧__∧　           \n\
　　     (  ^ . ^ ) (              They feel \n\
       ____ |  ¥  |__)_________  warm and  \n\
             (_\\__/_)             fuzzy inside.          \n\
      ——————/———',' gives Belle belly rubs.  \n\
              ∧__∧　           \n\
　　     (  ^ . ^ ) (              She purrs \n\
       ____ |  ¥  |__)_________  and nods \n\
             (_\\__/_)                   off to sleep.          \n\
      ——————/———',' gives Belle belly rubs.  \n\
              ∧__∧　           \n\
　　     (  ^ . ^ ) (              She starts \n\
       ____ |  ¥  |__)_________  kneading on \n\
             (_\\__/_)                   a blanket.          \n\
      ——————/———'
	  
	  ];

var play_texts_1 = ['You scratch at the ground.', 'You grab a toy mouse and toss it towards her', 'You point a laser on the floor in her direction'];
var play_texts_2 = ['Her pupils widen as she leaps towards it.', 'She tenses and gets ready to strike.', 'She pauses, then scratches at it'];
var play_meows = [' grabs a toy mouse and tossses it.\n\
                    ∧_∧   Belle\'s pupils widen  \n\
              )    ( •.•)   as she leaps towards it\n\
              ~(___¥)                   _^^_\n\
                 u    u              ~~/__•.•\\\n\
      —/———/—————/————/',' grabs a toy mouse and tossses it.\n\
                    ∧_∧   Belle tenses and  \n\
              )    ( •.•)   gets ready to strike\n\
              ~(___¥)                   _^^_\n\
                 u    u              ~~/__•.•\\\n\
      —/———/—————/————/',' grabs a toy mouse and tossses it.\n\
                    ∧_∧   Belle pauses,  \n\
              )    ( •.•)   then scratches at it.\n\
              ~(___¥)                   _^^_\n\
                 u    u              ~~/__•.•\\\n\
      —/———/—————/————/', ' scratches at the ground. \n\
                    ∧_∧   Belle\'s pupils widen \n\
              )    ( •.•)   as she leaps \n\
              ~(___¥)    towards it.           \n\
                 u    u    \n\
      —/———/—————/————/	 ',' scratches at the ground. \n\
                    ∧_∧   Belle tenses  \n\
              )    ( •.•)   and gets ready \n\
              ~(___¥)    to strike.           \n\
                 u    u    \n\
      —/———/—————/————/	 ',' scratches at the ground. \n\
                    ∧_∧   Belle pauses, \n\
              )    ( •.•)   then scratches  \n\
              ~(___¥)    at it.           \n\
                 u    u    \n\
      —/———/—————/————/	 ', ' points a laser on the floor in Belle\'s direction. \n\
                    ∧_∧   Belle\'s pupils widen \n\
              )    ( •.•)   as she leaps \n\
              ~(___¥)    towards it.           \n\
                 u    u    \n\
      —/———/—————/————/	 ', ' points a laser on the floor in Belle\'s direction. \n\
                    ∧_∧   Belle pupils widen \n\
              )    ( •.•)   as she leaps \n\
              ~(___¥)    towards it.           \n\
                 u    u    \n\
      —/———/—————/————/	 ', ' points a laser on the floor in Belle\'s direction. \n\
                    ∧_∧   Belle pupils widen \n\
              )    ( •.•)   as she leaps \n\
              ~(___¥)    towards it.           \n\
                 u    u    \n\
      —/———/—————/————/	 ' ];


var idle_meows = ['Belle is bored.\n\
\n\
             ∧__∧　            ============\n\
　　    (  • w • ) (         || PLAY WITH ME ||\n\
       ____ |  ¥  |__)______ ============_\n\
             (_\\__/_)                        ||\n\      ', 'Belle is staring off into space.\n\
\n\
              ∧__∧　           \n\
　　     (  • . • ) (       \n\
       ____ |  ¥  |__)__________________________\n\
             (_\\__/_)                        \n\      ', 'Belle is chasing some dust.\n\
                   ∧__∧　           \n\
　　          (  • . • )        \n\
            (    |  V  |  --                .\n\
             ) (_____)   -\n\
               //    //                  \n\      ', 'Belle is playing with some string.\n\
             |   ∧_∧\n\
             (  (•ᴥ• )  (\n\
      ____ ) `` \\V \\_)_______________________                  \n\
                  ,(___)            \n\      ', 'Belle is eating some food. \n\
                                  ∧_∧\n\
                          )___( ᵔ . ᵔ )\n\
     _____________ (____&)__,.,.,.,.  ___________     \n\
                           u    u   /_____\\\n\      ', 'Belle is playing with a rubber band.\n\
                 ∧_∧\n\
               ( •ヮ• )  (\n\
      _____\'\
	  0\'\
	  \\V \\_\
	  )_______________________             \n\    \
                    ,(___)            \n\      ', 'Belle is catching rays.\n\
____________\\___________________ \\________________   \n\
                  \\           _____  ∧__∧ \\\n\
                       \\    _/|  ___ ﾉ _^.^ ﾉ \\\n\
                         \\___/_   \\_,\\_,\\_,\\_,__\\\n\
'];

var lonely_meows = [' is usually here by now, Belle thought. She is lonely. \n\
              ∧__∧　           \n\
　　     (  • - • ) (       \n\
       ____ |  ¥  |__)________________\n\
             (_\\__/_)                        \n\
      ——————/————/_/—',' ? , Where are they? Belle misses pets. \n\
              ∧__∧　           \n\
　　     (  • _ • ) (       \n\
       ____ |  ¥  |__)________________\n\
             (_\\__/_)                        \n\
      ——————/————/_/—', ' isn\'t home , Belle misses them. \n\
              ∧__∧　           \n\
　　     (  • o • ) (       \n\
       ____ |  ¥  |__)_________________\n\
             (_\\__/_)                        \n\
      ——————/————/_/—' ];
function add_ending(statusmsg)
{
	for(i = 0; i < 20; i++)
	{
		c = Math.random();
		if(c <= 0.70)
			statusmsg += '—';
		else if (statusmsg[statusmsg.length-1] != '/')
			statusmsg += '/';
	}
	return statusmsg;
}
//every 20 mins 
var post_count = 0;
setInterval(function(){ 

if(post_count % 12  == 0)
{
	T.post('statuses/update', { status: add_ending(idle_meows[Math.floor(Math.random()*idle_meows.length)])}, function(err, data, response) {
				console.log("posted tweet!")
				});
				
	
}
else
{
	var meow = Math.random();
	if(meow < 0.33)
	{
		T.post('statuses/update', { status:meow(0) }, function(err, data, response) {
		console.log("meow!")});
	}
	else if (meow < 0.66)
	{
		T.post('statuses/update', { status:meow(1) }, function(err, data, response) {
		console.log("meow!")});
	}
	else
	{
		T.post('statuses/update', { status:meow(2) }, function(err, data, response) {
		console.log("meow!")});
	}
}
post_count++;



}, 1000*60*2);
function meow(num)
{
	var rtn_str = ""
	if(num == 0)
	{
		num_m = Math.floor(Math.random() * 5);
		for(i = 0; i < num_m; i++)
		{
			rtn_str += 'm'
		}
		
		num_e = Math.floor(Math.random() * 5);
		for(i = 0; i < num_e; i++)
		{
			rtn_str += 'e'
		}
		
		num_o = Math.floor(Math.random() * 5);
		for(i = 0; i < num_o; i++)
		{
			rtn_str += 'o'
		}
		
		num_w = Math.floor(Math.random() * 5);
		for(i = 0; i < num_w; i++)
		{
			rtn_str += 'w'
		}
	}
	else if (num ==1)
	{
		num_m = Math.floor(Math.random() * 5);
		for(i = 0; i < num_m; i++)
		{
			rtn_str += 'm'
		}
		
		num_r = Math.floor(Math.random() * 5);
		for(i = 0; i < num_e; i++)
		{
			rtn_str += 'r'
		}
		
		num_o = Math.floor(Math.random() * 5);
		for(i = 0; i < num_o; i++)
		{
			rtn_str += 'o'
		}
		
		num_w = Math.floor(Math.random() * 5);
		for(i = 0; i < num_w; i++)
		{
			rtn_str += 'w'
		}
	}
	else
	{
		num_p = Math.floor(Math.random() * 10);
		for(i = 0; i < num_p; i++)
		{
			rtn_str += 'p'
		}
		
		
		num_r = Math.floor(Math.random() * 10);
		for(i = 0; i < num_r; i++)
		{
			rtn_str += 'r'
		}
		
	}
	
}
var stream = T.stream('statuses/filter', { follow: ['1173977167891456005'] });

function find_usr(currentValue, index, array)
{
	
	return currentValue.id == this;
}

