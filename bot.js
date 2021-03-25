var Twitter = require('twit');
const http = require('http');
const express = require('express');
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
var distDir = __dirname + "/dist/";
app.use(express.static(distDir));

// a middleware function with no mount path. This code is executed for every request to the router
router.use(function (req, res, next) {
  console.log('Request made to router');
  console.log('Time:', Date.now())
  next()
});

// a middleware sub-stack shows request info for any type of HTTP request to the /user/:id path
router.use('/', function (req, res, next) {
	console.log('received request. It is: ' + req);
	console.log('received res. It is: ' + res);
	if(req.query.crc_token != null)
	{	
	
	hmac = crypto.createHmac('sha256', process.env.CONSUMER_SECRET).update(req.query.crc_token).digest('base64')

	var txt = '{ "response_token": ' + '"sha256='+String(hmac) + '"}';
	
	var obj = JSON.parse(txt);
	
	res.send(obj);
       console.log("sent token");
	}
  next()
}, 
  
  function (req, res, next) {
  
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
app.post('/webhooks/twitter', (req, res) => {
	console.log('blah');
	//is a retweet, starts with B, isn't the main tweet
	if((req.body.tweet_create_events != null) && 
	(String(req.body.tweet_create_events[0].text).substring(0,2) == 'RT') &&
	((String(req.body.tweet_create_events[0].text).substring(20,21) == 'L') ||
	(String(req.body.tweet_create_events[0].text).substring(20,21) == 'B')) &&
	(String(req.body.tweet_create_events[0].id_str) != '1173977167891456005') &&
	can_tweet_RT)
	{
		console.log("rting");
		can_tweet_RT = !can_tweet_RT;
		var tweet = req.body.tweet_create_events[0];
		if(typeof usr_directory.find(user => user.id === tweet.user.id_str) === 'undefined')
				{
					console.log("we got a new user!");
					//console.log(tweet);
					usr_directory.push({name: tweet.user.screen_name, id: tweet.user.id_str, pet_score: 0, play_score: 0, feed_score: 0, num_visits: 1, can_interact: true, interact_timer: null, visiting_timer: null, visit_timer_waiting : false});

				}
		
		var tg = usr_directory[usr_directory.findIndex(find_usr, tweet.user.id_str)];
		
		clearTimeout(tg.visiting_timer);
		if(tg.can_interact)
		{
			T.post('statuses/update', { status: personalize(play_meows[Math.floor(Math.random()*play_meows.length)], tweet.user.screen_name)
					}, function(err, data, response) {
				console.log("play reply!")
				});
			tg.can_interact = false;
			interact_timer = setTimeout(function () {tg.can_interact = true; }, 1000*60*30);
		}
		else
		{
				console.log("cant interact!");
		}
		
		let RemindChance = Math.floor(Math.random() * 101);
		if(RemindChance <= 15  || tg.visit_timer_waiting == true)
		{
			let RemindTime = Math.floor(Math.random() * 7) + 7;
			tg.visiting_timer = setTimeout(function(){lonely_time(tg.name, tg);},1000*60*60*RemindTime);
			tg.visit_timer_waiting = true;
		}
			
	}
	//starts with 'B'
	else if(req.body.favorite_events != null && 
	String(((req.body.favorite_events[0].favorited_status.text).substr(0,1) == 'B') || 
			((req.body.favorite_events[0].favorited_status.text).substr(0,1) == 'L'))	&&
        String(req.body.favorite_events[0].user.id_str) != '1173977167891456005' )
	{
		var tweet = req.body.favorite_events[0];
		if(typeof usr_directory.find(user => user.id === tweet.user.id_str) === 'undefined')
				{
					console.log("we got a new user!");
					//console.log(tweet);
					usr_directory.push({name: tweet.user.screen_name, id: tweet.user.id_str, pet_score: 0, play_score: 0, feed_score: 0, num_visits: 1,can_interact: true, interact_timer: null,  visiting_timer: null, visit_timer_waiting : false});

				}
		
		var tg = usr_directory[usr_directory.findIndex(find_usr, tweet.user.id_str)];
		
		clearTimeout(tg.visiting_timer);
		if(tg.can_interact)
		{
			T.post('statuses/update', { status: personalize(pet_meows[Math.floor(Math.random()*pet_meows.length)], tweet.user.screen_name)
					}, function(err, data, response) {
				console.log("pet reply!")
				});
			tg.can_interact = false;
			interact_timer = setTimeout(function () {tg.can_interact = true; }, 1000*60*30);
		}
		else
		{
				console.log("cant interact!");
		}
		let RemindChance = Math.floor(Math.random() * 101);
		if(RemindChance <= 15  || tg.visit_timer_waiting == true)
		{
			let RemindTime = Math.floor(Math.random() * 7) + 7;
			tg.visiting_timer = setTimeout(function(){lonely_time(tg.name, tg);},1000*60*60*RemindTime);
			tg.visit_timer_waiting = true;
		}
		
			
		
	}
	else if(!can_tweet_RT)
		can_tweet_RT = !can_tweet_RT;
	
	res.send("");
});
function lonely_time(name, tg)
{
	T.post('statuses/update', { status: personalize(lonely_meows[Math.floor(Math.random()*lonely_meows.length)], name)
					}, function(err, data, response) {
				console.log("lonely! reply!")
				});
	tg.visit_timer_waiting = false;
	
}
const PORT = process.env.PORT || 3000;
http.createServer(app).listen(PORT, () => {
  console.log('Express server listening on port' + PORT);
});




var pet_texts_1 = ['You give Belle some chin scratches', 'You scratch Belle behind her ears', 'You pat Belle on her head.', 'You pet Belle along her back.', 'You give Belle belly rubs.'];
var pet_texts_2 = ['She purrs and closes her eyes.', 'She purrs and nuzzles her head against your hand', 'She blinks slowly at you', 'You feel warm and fuzzy inside', 'She purrs and nods off to sleep', 'She starts kneading on a blanket'];
var pet_meows = [' gives Belle some chin scratches.  \n\
              ∧__∧　           \n\
　　     (  ^ . ^ ) (         She purrs and \n\
       ____ |  ¥  |__)_     nuzzles her head \n\
             (_\\__/_)      against their hand.\n\
      ——————/———', ' gives Belle some chin scratches.  \n\
              ∧__∧　           \n\
　　     (  ^ . ^ ) (              She purrs and \n\
       ____ |  ¥  |__)____        closes her \n\
             (_\\__/_)            eyes.\n\
      ——————/———',' gives Belle some chin scratches.  \n\
              ∧__∧　           \n\
　　     (  ^ . ^ ) (              She blinks\n\
       ____ |  ¥  |__)_________  slowly at \n\
             (_\\__/_)           them. \n\
      ——————/———',' gives Belle some chin scratches.  \n\
              ∧__∧　           \n\
　　     (  ^ . ^ ) (              They feel \n\
       ____ |  ¥  |__)_____      warm and  \n\
             (_\\__/_)             fuzzy inside.\n\
      ——————/———',' gives Belle some chin scratches.  \n\
              ∧__∧　           \n\
　　     (  ^ . ^ ) (              She purrs \n\
       ____ |  ¥  |__)_________  and nods \n\
             (_\\__/_)              off to sleep. \n\
      ——————/———',' gives Belle some chin scratches.  \n\
              ∧__∧　           \n\
　　     (  ^ . ^ ) (         She starts \n\
       ____ |  ¥  |__)_____ kneading on \n\
             (_\\__/_)         a blanket. \n\
      ——————/———', ' scratches Belle behind her ears.  \n\
              ∧__∧　           \n\
　　     (  ^ . ^ ) (         She purrs and \n\
       ____ |  ¥  |__)______nuzzles her head \n\
             (_\\__/_)            against their hand.\n\
      ——————/———', ' scratches Belle behind her ears.  \n\
              ∧__∧　           \n\
　　     (  ^ . ^ ) (         She purrs and \n\
       ____ |  ¥  |__)______closes her \n\
             (_\\__/_)              eyes.\n\
      ——————/———',' scratches Belle behind her ears.  \n\
              ∧__∧　           \n\
　　     (  ^ . ^ ) (         She blinks\n\
       ____ |  ¥  |__)______slowly at \n\
             (_\\__/_)              them.\n\
      ——————/———',' scratches Belle behind her ears.  \n\
              ∧__∧　           \n\
　　     (  ^ . ^ ) (         They feel \n\
       ____ |  ¥  |__)______warm and  \n\
             (_\\__/_)        fuzzy inside.\n\
      ——————/———',' scratches Belle behind her ears.  \n\
              ∧__∧　           \n\
　　     (  ^ . ^ ) (         She purrs \n\
       ____ |  ¥  |__)______and nods \n\
             (_\\__/_)              off to sleep.\n\
      ——————/———',' scratches Belle behind her ears.  \n\
              ∧__∧　           \n\
　　     (  ^ . ^ ) (         She starts \n\
       ____ |  ¥  |__)______kneading on \n\
             (_\\__/_)              a blanket.\n\
      ——————/———', ' pats Belle on her head.  \n\
              ∧__∧　           \n\
　　     (  ^ . ^ ) (         She purrs and \n\
       ____ |  ¥  |__)______nuzzles her head \n\
             (_\\__/_)            against their hand.\n\
      ——————/———', ' pats Belle on her head.  \n\
              ∧__∧　           \n\
　　     (  ^ . ^ ) (         She purrs and \n\
       ____ |  ¥  |__)______closes her \n\
             (_\\__/_)              eyes.\n\
      ——————/———',' pats Belle on her head.  \n\
              ∧__∧　           \n\
　　     (  ^ . ^ ) (         She blinks\n\
       ____ |  ¥  |__)______slowly at \n\
             (_\\__/_)              them.\n\
      ——————/———',' pats Belle on her head.  \n\
              ∧__∧　           \n\
　　     (  ^ . ^ ) (         They feel \n\
       ____ |  ¥  |__)______warm and  \n\
             (_\\__/_)        fuzzy inside.\n\
      ——————/———',' pats Belle on her head.  \n\
              ∧__∧　           \n\
　　     (  ^ . ^ ) (         She purrs \n\
       ____ |  ¥  |__)______and nods \n\
             (_\\__/_)              off to sleep.\n\
      ——————/———',' pats Belle on her head.  \n\
              ∧__∧　           \n\
　　     (  ^ . ^ ) (         She starts \n\
       ____ |  ¥  |__)______kneading on \n\
             (_\\__/_)              a blanket.\n\
      ——————/———', ' pets Belle along her back.  \n\
              ∧__∧　           \n\
　　     (  ^ . ^ ) (         She purrs and \n\
       ____ |  ¥  |__)______nuzzles her head \n\
             (_\\__/_)            against their hand.\n\
      ——————/———', ' pets Belle along her back.  \n\
              ∧__∧　           \n\
　　     (  ^ . ^ ) (         She purrs and \n\
       ____ |  ¥  |__)______closes her \n\
             (_\\__/_)              eyes.\n\
      ——————/———',' pets Belle along her back.  \n\
              ∧__∧　           \n\
　　     (  ^ . ^ ) (         She blinks\n\
       ____ |  ¥  |__)______slowly at \n\
             (_\\__/_)              them.\n\
      ——————/———',' pets Belle along her back.  \n\
              ∧__∧　           \n\
　　     (  ^ . ^ ) (         They feel \n\
       ____ |  ¥  |__)______warm and  \n\
             (_\\__/_)         fuzzy inside.\n\
      ——————/———',' pets Belle along her back.  \n\
              ∧__∧　           \n\
　　     (  ^ . ^ ) (         She purrs \n\
       ____ |  ¥  |__)______and nods \n\
             (_\\__/_)              off to sleep.\n\
      ——————/———',' pets Belle along her back.  \n\
              ∧__∧　           \n\
　　     (  ^ . ^ ) (         She starts \n\
       ____ |  ¥  |__)______kneading on \n\
             (_\\__/_)              a blanket.\n\
      ——————/———', ' gives Belle belly rubs.  \n\
              ∧__∧　           \n\
　　     (  ^ . ^ ) (        She purrs and \n\
       ____ |  ¥  |__)______nuzzles her head \n\
             (_\\__/_)            against their hand.\n\
      ——————/———', ' gives Belle belly rubs.  \n\
              ∧__∧　           \n\
　　     (  ^ . ^ ) (         She purrs and \n\
       ____ |  ¥  |__)______closes her \n\
             (_\\__/_)              eyes.\n\
      ——————/———',' gives Belle belly rubs.  \n\
              ∧__∧　           \n\
　　     (  ^ . ^ ) (         She blinks\n\
       ____ |  ¥  |__)______slowly at \n\
             (_\\__/_)              them.\n\
      ——————/———',' gives Belle belly rubs.  \n\
              ∧__∧　           \n\
　　     (  ^ . ^ ) (         They feel \n\
       ____ |  ¥  |__)______warm and  \n\
             (_\\__/_)        fuzzy inside.\n\
      ——————/———',' gives Belle belly rubs.  \n\
              ∧__∧　           \n\
　　     (  ^ . ^ ) (         She purrs \n\
       ____ |  ¥  |__)______and nods \n\
             (_\\__/_)              off to sleep.\n\
      ——————/———',' gives Belle belly rubs.  \n\
              ∧__∧　           \n\
　　     (  ^ . ^ ) (         She starts \n\
       ____ |  ¥  |__)______kneading on \n\
             (_\\__/_)              a blanket.\n\
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
                    ∧_∧   Belle pauses, \n\
              )    ( •.•)   then scratches at it \n\
              ~(___¥)               \n\
                 u    u    \n\
      —/———/—————/————/	 ', ' points a laser on the floor in Belle\'s direction. \n\
                    ∧_∧   Belle tenses and \n\
              )    ( •.•)   gets ready to \n\
              ~(___¥)    strike.           \n\
                 u    u    \n\
      —/———/—————/————/	 ' ];


var idle_meows = ['Belle is bored.\n\
\n\
                          ======\n\
        ∧__∧　      ||   PLAY     ||\n\
　 (  • w • ) (    || WITH ME ||\n\
   __ |  ¥  |__)____ ======\n\
      (_\\__/_)                 ||\n\      ', 'Belle is staring off into space.\n\
\n\
              ∧__∧　           \n\
　　     (  • . • ) (       \n\
       ____ |  ¥  |__)__________\n\
             (_\\__/_)                        \n\      ', 'Belle is chasing some dust.\n\
                   ∧__∧　           \n\
　　          (  • . • )        \n\
            (    |  V  |  --              .\n\
             ) (_____)   -\n\
               //    //                  \n\      ', 'Belle is playing with some string.\n\
             |   ∧_∧\n\
             (  (•ᴥ• )  (\n\
      ____ ) `` \\V \\_)____________\n\
                  ,(___)            \n\      ','Belle is eating some food. \n\
                             ∧_∧\n\
                     )___( ᵔ . ᵔ )\n\
                     (____&)   ,.,.,.,.\n\
                      u    u   /_____\\\n\      ', 'Belle is playing with a rubber band.\n\
                 ∧_∧\n\
               ( •ヮ• )  (\n\
      _____\'\
	  0\'\
	  \\V \\_\
	  )_______\n\    \
                    ,(___)            \n\      ','Belle is catching rays.\n\
        \\              \\               \\\n\
          \\           _\\___  ∧__∧ \\\n\
            \\    _/|  ___ ﾉ _^.^ ﾉ \\\n\
              \\___/_   \\_,\\_,\\_,\\_,__\\\n\      ','Belle is lounging.\n\
\n\
         ∧__∧\n\
  _ ︵(  • . • )︵____________\n\
     |_ |   V   | _|\n\
     |_ \\_____/_ |\n\
_____________________________', 'Belle found a box.\n\
               ∧__∧　           \n\
　　     (  • w • )             \n\
          \\_u__u__//\n\
          |              |       \n\
          |_________|        \n\
      ——————/———\n','Belle scratches her post.\n\
               ∧__∧　      ___   \n\
　　     (  ^ . ^ )     (     )      \n\
       __(   /      | //__ | `  |_____   \n\
            (_____|     /_ |  ` |_ \n\
      —————/__________\\n\      ', 'Belle is rolling around in someone\'s shoes.\n\
(                                                 \n\
) __n\'____n\'______\n\
 \\__________/( • m • )    \n\
       (__X_||)  V—V\n\
                 \n','Belle is staring out of the window.\n\
  _________      ∧__∧              \n\
/___ |____/    ( • . • )  ____\n\
/___ |____/         \\________/ \ \n\
/___ |____/ _____u    u___  /\n\
/____|___ /_______________\n\      ','Belle is staring out of the window.\n\
  __________        ∧__∧              \n\
/____ |_____/      ( • . • ) \n\
/____ |_____/       |   Y  \\  (\n\
/____ |_____/  ___ |______)____\n\
/_____|____ /_________________\n\      ', 'Belle found the top of the fridge.\n\
            ∧__∧\n\
   __︵(  • . • )︵___\n\
  /   |_ |   V   | _|     / \n\
 /__|_ \\_____/_ |___/|\n\
|                     |    |  |\n\
|____________ | __| /|\n\
|                     |    |  |\n\
|                     |    |  |\n\
|____________ |__ | /', 'Belle found her way onto the dining room table.\n\
              ∧__∧              \n\
            ( • . • )   (\n\
             |   Y  \\  (\n\
        ___ |______)__________\n\
       | ============|\n\
       |____________________|\n\
       ||                             ||','Belle found the wifi router and is stealing its warmth.\n\
            ∧__∧\n\
      ︵( • w •)︵\n\
   / |_ |   V   | _| \  _________________\n\
 /_ |_ \\_____/_ |_\\\n\
|   : o [        ]  o: |\n\      ', 'Belle is spying down a bug.\n\
                    ∧_∧   \n\
              )    ( o.o)             \'.\'\n\
              ~(___¥)                \n\
                 u    u              \n\
      —/———/—————/————/\n','Belle is bored.\n\
\n\
                          ======\n\
        ∧__∧　      ||   PLAY     ||\n\
　 (  o w o ) (    || WITH ME ||\n\
   __ |  ¥  |__)____ ======\n\
      (_\\__/_)                 ||\n\      ','Belle is staring off into space.\n\
\n\
              ∧__∧　           \n\
　　     (  • - • ) (       \n\
       ____ |  ¥  |__)__________\n\
             (_\\__/_)                        \n\      ','Belle is chasing some dust.\n\
                   ∧__∧　           \n\
　　          (  • ᴥ • )        \n\
            (    |  V  |  --              .\n\
             ) (_____)   -\n\
               //    //                  \n\      ','Belle is playing with some string.\n\
             |   ∧_∧\n\
             (  (•.• )  (\n\
      ____ ) `` \\V \\_)____________\n\
                  ,(___)            \n\      ','Belle is eating some food. \n\
                             ∧_∧\n\
                     )___( ᵔ w ᵔ )\n\
                     (____&)   ,.,.,.,.\n\
                      u    u   /_____\\\n\      ','Belle is playing with a rubber band.\n\
                 ∧_∧\n\
               ( •.• )  (\n\
      _____\'\
	  0\'\
	  \\V \\_\
	  )_______\n\    \
                    ,(___)            \n\      ','Belle is catching rays.\n\
        \\              \\               \\\n\
          \\           _\\___  ∧__∧ \\\n\
            \\    _/|  ___ ﾉ _^_^ ﾉ \\\n\
              \\___/_   \\_,\\_,\\_,\\_,__\\\n\      ','Belle is lounging.\n\
\n\
         ∧__∧\n\
  _ ︵(  • w • )︵____________\n\
     |_ |   V   | _|\n\
     |_ \\_____/_ |\n\
_____________________________\n\      ', 'Belle found a box.\n\
               ∧__∧　           \n\
　　     (  • . • )             \n\
          \\_u__u__//\n\
          |              |       \n\
          |_________|        \n\
      ——————/———\n','Belle scratches her post.\n\
               ∧__∧　      ___   \n\
　　     (  o w o )     (     )      \n\
       __(   /      | //__ | `  |_____   \n\
            (_____|     /_ |  ` |_ \n\
      —————/__________\\n\      ', 'Belle is rolling around in someone\'s shoes.\n\
(                                                 \n\
) __n\'____n\'______\n\
 \\__________/( • m • )    \n\
       (__X_||)  V—V\n\
                 \n','Belle is staring out of the window.\n\
  _________      ∧__∧              \n\
/___ |____/    ( ^__^ )  ____\n\
/___ |____/         \\________/ \ \n\
/___ |____/ _____u    u___  /\n\
/____|___ /_______________\n\      ','Belle is staring out of the window.\n\
  __________        ∧__∧              \n\
/____ |_____/      ( ^__^ ) \n\
/____ |_____/       |   Y  \\  (\n\
/____ |_____/  ___ |______)____\n\
/_____|____ /_________________\n\      ', 'Belle found the top of the fridge.\n\
            ∧__∧\n\
   __︵(  • w • )︵___\n\
  /   |_ |   V   | _|     / \n\
 /__|_ \\_____/_ |___/|\n\
|                     |    |  |\n\
|____________ | __| /|\n\
|                     |    |  |\n\
|                     |    |  |\n\
|____________ |__ | /', 'Belle found her way onto the dining room table.\n\
              ∧__∧              \n\
            ( • w • )   (\n\
             |   Y  \\  (\n\
        ___ |______)__________\n\
       | ============|\n\
       |____________________|\n\
       ||                             ||','Belle found the wifi router and is stealing its warmth.\n\
            ∧__∧\n\
      ︵( • . •)︵\n\
   / |_ |   V   | _| \  _________________\n\
 /_ |_ \\_____/_ |_\\\n\
|   : o [        ]  o: |\n\      ', 'Belle is spying down a bug.\n\
                    ∧_∧   \n\
              )    ( •.•)             \'.\'\n\
              ~(___¥)                \n\
                 u    u              \n\
      —/———/—————/————/\n','Belle is sleeping.\n\
_________________________\n\
           z\n\
         z\n\
       z\n\
∧__∧ ____\n\
( n . n)___ )\\\n\
               _/\n\      ','Belle is sleeping.\n\
_________________________\n\
           z\n\
         z\n\
       z\n\
∧__∧ ____\n\
( u . u)___ )\\\n\
               _/\n\      ','Belle is sleeping.\n\
_________________________\n\
                z\n\
              z\n\
     _____z_____\n\
 //  ∧__∧ ____  \\\\\n\
 ||  ( u . u)___ )\\  ||\n\
   \\\\______°_° _/ //\n\      ','Belle is sleeping.\n\
_________________________\n\
                z\n\
              z\n\
     _____z_____\n\
 //  ∧__∧ ____  \\\\\n\
 ||  ( n . n)___ )\\  ||\n\
   \\\\______°_° _/ //\n\      ','Belle is sleeping on the couch.\n\
            ___________________\n\
          /               Z\n\
   ___ /       o     z          o\n\
 /  o  \\ \     ∧__∧ ___\n\
 \\____/ __( u . u)___ )\\_____\n\
      ||                   °° _/\n\
      ||______________________\n\      ','Belle is sleeping on the couch.\n\
            ___________________\n\
          /               Z\n\
   ___ /       o     z          o\n\
 /  o  \\ \     ∧__∧ ___\n\
 \\____/ __( n . n)___ )\\_____\n\
      ||                   °° _/\n\
      ||______________________\n\      ','Belle is sleeping.\n\
   ¸   , \n\
   -O-           /    |           z\n\
    ¹   `          /    |           z\n\
                   /    |          z \n\
    @      @  /    |  ∧__∧ ____\n\
    \\|/,,,,.,.\\|/ /     | ( u . u)___ )\\\n\
    ▒▒▒▒  /     |_______°° _/_\n\      ','Belle is watching outside.\n\
   ¸   , \n\
   -O-           /    |\n\
    ¹   `          /    |       ∧__∧ \n\
    @      @  /    |     ( • w • )  (\n\
    \\|/,,,,.,.\\|/ /     |      |   Y  \\  (\n\
    ▒▒▒▒  /      |__ (          )_\n\ ','Belle is watching the rain.\n\
    ▓▓   ▓▓\n\
    /  ,   . ,/  ,  /   |\n\
    /, ,   /   ,   ,/   |       ∧__∧\n\
    @  ,   @  /    |     ( • w • )  (\n\
    \\|/,,,,.,.\\|/ /     |      |   Y  \\  (\n\
    ▒▒▒▒  /      |__ (          )_\n\      ','Belle is sleeping.\n\
   ▓▓  ▓▓                       z\n\
   * *   * *      /    |           z    \n\
   *   *    *     /    |          z       \n\
   *  *  *   *   /    |  ∧__∧ ____\n\
   *,,,,*,..*,.,   /     | ( u . u)___ )\\\n\
    ▒▒▒▒   /     |_______°° _/_\n\      ','Belle is watching the snow.\n\
   ▓▓  ▓▓                       \n\
   *   *    *     /    |      ∧__∧      \n\
   *  *  *   *   /    |     ( • w • )  (\n\
   *,,,,*,..*,.,   /     |      |   Y  \\  (\n\
    ▒▒▒▒   /     |__ (          )_\n\ ','Belle is rolling around.\n\
(                                                 \n\
) __n\'____n\'______\n\
 \\__________/( • m • )\n\
 _____________V—V _____________________\n\ ','Belle is rolling around.\n\
(                                                 \n\
) __n\'____n\'______\n\
 \\__________/( o m o )\n\
 _____________V—V _____________________\n\ ','Belle is scared of the vacuum\n\
                            ╔ =====\n\
           ∧__∧         //\n\
  /  ͡  \\( • ~ •)        //\n\
{  _____  }          //\n\
u        u        [____]\n\ ','Belle is scared of the vacuum\n\
                            ╔ =====\n\
           ∧__∧         //\n\
  /  ͡  \\( • ~ •)        //\n\
{  _____  }          //\n\
u        u        [____]\n\ ','Belle is in her tunnel. \n\
           =======\n\
     / /       ∧__∧       \\ \\\n\
     | |  ︵(  • w • )︵   | |\n\
     | |    |_ |   V   |  _|    | |\n\
     | |     |_ \\_____/_ |   | |\n\
       \\ \\                     / /\n\
             =======\n\ ','Belle is in her tunnel. \n\
           =======\n\
     / /       ∧__∧       \\ \\\n\
     | |  ︵(  • . • )︵   | |\n\
     | |    |_ |   V   |  _|    | |\n\
     | |     |_ \\_____/_ |   | |\n\
       \\ \\                     / /\n\
             =======\n\ ','Like to pet the cat.\n\
\n\
              ∧__∧　           \n\
　　     (  • . • ) (       \n\
       ____ |  ¥  |__)__________\n\
             (_\\__/_)                        \n\      ','Like to pet the cat.\n\
            ____________z______\n\
          /               Z\n\
   ___ /       o     z          o\n\
 /  o  \\ \     ∧__∧ ___\n\
 \\____/ __( n . n)___ )\\_____\n\
      ||                   °° _/\n\
      ||______________________\n\      ','Like to pet the cat.\n\
               ∧__∧　           \n\
　　     (  • . • )             \n\
          \\_u__u__//\n\
          |              |       \n\
          |_________|        \n\
      ——————/———\n','Like to pet the cat. \n\
                             ∧_∧\n\
                     )___( ᵔ . ᵔ )\n\
                     (____&)   ,.,.,.,.\n\
                      u    u   /_____\\\n\      ','Like to pet the cat.\n\
_________________________\n\
                z\n\
              z\n\
     _____z_____\n\
 //  ∧__∧ ____  \\\\\n\
 ||  ( u . u)___ )\\  ||\n\
   \\\\______°_° _/ //\n\      '];

var lonely_meows = [' is usually here by now, Belle thought. She is lonely. \n\
              ∧__∧　           \n\
　　     (  • o • ) (       \n\
       ____ |  ¥  |__)______\n\
             (_\\__/_)                        \n\
      ——————/————/_/—',' ? , Where are they? Belle misses pets. \n\
              ∧__∧　           \n\
　　     (  • _ • ) (       \n\
       ____ |  ¥  |__)______\n\
             (_\\__/_)                        \n\
      ——————/————/_/—', ' isn\'t home , Belle misses them. \n\
              ∧__∧　           \n\
　　     (  • o • ) (       \n\
       ____ |  ¥  |__)_______\n\
             (_\\__/_)                        \n\
      ——————/————/_/—', ' is a good friend, Belle is thinking of them. \n\
              ∧__∧　           \n\
　　     (  • w • ) (       \n\
       ____ |  ¥  |__)______\n\
             (_\\__/_)                        \n\
      ——————/————/_/—',' ? , Where are they? Belle loves them. \n\
              ∧__∧　           \n\
　　     (  • ᴥ • ) (       \n\
       ____ |  ¥  |__)______\n\
             (_\\__/_)                        \n\
      ——————/————/_/—'];
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
var liked_tweet = false;
setInterval(function(){ 

console.log('post_count is ' + post_count);
if(post_count % 17 != 0)
{
	
 http.get("http://bellethecatbot.herokuapp.com");
}
else
{

console.log("posting pic");
var s = Math.floor(Math.random()*idle_meows.length);
console.log('going to tweet this one: ' + idle_meows[s]); 
if (String(idle_meows[s]).includes("fridge"))
{
T.post('statuses/update', { status: idle_meows[s]}, function(err, data, response) {
				console.log("posted tweet!")
				});
}
else
{	
	T.post('statuses/update', { status: add_ending(idle_meows[s])}, function(err, data, response) {
				console.log("posted tweet!")
				});
}
}
post_count += 1; 	

}, 1000*60*10);

function like_tweet(tweet)
{
        console.log('someone tweeted about cats');
	if(liked_tweet == false)
	{
		T.post('favorites/create', { id: tweet.id_str });
	        liked_tweet = true;
        }
	
}

function find_usr(currentValue, index, array)
{
	
	return currentValue.id == this;
}
