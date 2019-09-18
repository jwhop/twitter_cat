const express = require ('express');
const bodyParser = require ('body-parser');
const twitterWebhooks = require('twitter-webhooks');
const https = require ('https');
 
const app = express();
app.use(bodyParser.json());
 
const userActivityWebhook = twitterWebhooks.userActivity({
    serverUrl: 'https://bellethecatbot.herokuapp.com/',
    route: '/msg/', //default : '/'
    consumerKey: 'sW4r7Va0AB2r47XQoqMcQ72ve',
    consumerSecret: 'YYEVd0X3V29gfkniGlkaVhX55TrRh5Nvcz3d3kWxKTDTnYsRRt',
    accessToken: '1173977167891456005-WbrCI9jNGPNDlOkg6X0Wiso59QCbv3',
    accessTokenSecret: 'yd8xi7wGmx5MkZyfqNbMSz71TRWcMuewdgf4rN1cAJyKv',
    environment: 'Check', //default : 'env-beta'
    app
});
 
//Register your webhook url - just needed once per URL
userActivityWebhook.register();
 
//Subscribe for a particular user activity
userActivityWebhook.subscribe({
    userId: '1173977167891456005',
    accessToken: '1173977167891456005-WbrCI9jNGPNDlOkg6X0Wiso59QCbv3',
    accessTokenSecret: 'yd8xi7wGmx5MkZyfqNbMSz71TRWcMuewdgf4rN1cAJyKv'
})
.then(function (userActivity) {
    userActivity
    .on('favorite', (data) => console.log (userActivity.id + ' - favorite'))
    .on ('tweet_create', (data) => console.log (userActivity.id + ' - tweet_create'))
    .on ('follow', (data) => console.log (userActivity.id + ' - follow'))
    .on ('mute', (data) => console.log (userActivity.id + ' - mute'))
    .on ('revoke', (data) => console.log (userActivity.id + ' - revoke'))
    .on ('direct_message', (data) => console.log (userActivity.id + ' - direct_message'))
    .on ('direct_message_indicate_typing', (data) => console.log (userActivity.id + ' - direct_message_indicate_typing'))
    .on ('direct_message_mark_read', (data) => console.log (userActivity.id + ' - direct_message_mark_read'))
    .on ('tweet_delete', (data) => console.log (userActivity.id + ' - tweet_delete'))
});
 
//listen to any user activity
userActivityWebhook.on ('event', (event, userId, data) => console.log (userId + ' - favorite'));
 
//listen to unknown payload (in case of api new features)
userActivityWebhook.on ('unknown-event', (rawData) => console.log (rawData));
 
const server = https.createServer(app).listen(1337, () => {
  console.log('Express server listening on port 1337');
});
