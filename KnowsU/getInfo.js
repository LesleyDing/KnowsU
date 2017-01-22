var request=require('request');

exports.getInfo = function(){

request.get('https://api.spotify.com/v1/search?q=Happy&type=track',function(err,res,body){
  
  if(!error && res.statusCode == 200 ) 
  {
    console.log(res);
  }
  
});
    

}