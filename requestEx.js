var request= require('request');
var fs = require('fs');
var url='http://zso11.edupage.org/substitution/?';
var url2='http://zso11.edupage.org/gcall';
//var cookie = 'PHPSESSID=74us7g22md7ah58hln030jcf20; ';
var gDate=['7259810','f36e91b1'];
var varible="";
var request= require('request');
var querystring = require('querystring');
var form={};
var formData;
var contentLength;
/*
request(url,function(err,res,body){
    if(!err && res.statusCode ==200){
         console.log(res.headers['set-cookie']);
        //console.log(body);
        fs.writeFileSync(__dirname+'/json/pageZSO.txt', body, 'utf-8');
       // console.log(res.headers);
    }
})
*/
  //'set-cookie': [ 'PHPSESSID=9q2ks606oja6p37c1mb4octni5; path=/' ],
for(var i=1;i<11;i++){
    
    for(var j=1;j<11;j++){
        
        for(var k=1;k<11;k++){
            
            //for(var l=1;l<11;l++){
                varible=3*Math.pow(10,8)+7*Math.pow(10,7)+4*Math.pow(10,6)+i*Math.pow(10,5)+2*Math.pow(10,4)+j*Math.pow(10,3)+7*Math.pow(10,2)+k*10+5;
                x();
                console.log(varible);
        
                //console.log(6*10^5);
        //    }
            
            
        }
    }
    //Math.pow(10,)
    
}

//var request = require('request');
//7593327 1dc1b4b7 [ 'PHPSESSID=h1tb8i7mgbnpr3ug6kp5gp2ei0; path=/' ]
    var gDate=['7593327', '1dc1b4b7'];
    var cookie='PHPSESSID=9q2ks606oja6p37c1mb4octni5';
    var form = {
        zserial:varible
    };

    var formData = querystring.stringify(form);
    //console.log(formData);
    var contentLength = formData.length;

function x(){
     form = {
            zserial:varible
        };

            formData = querystring.stringify(form);
    //console.log(formData);
     contentLength = formData.length;

                request({
        headers: {
          'Content-Length': contentLength,
          'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie' : 'PHPSESSID=0busa990b19hc3nolnip5lb2h4'
        },
        uri:'http://support.zortrax.com/wp-includes/zserial.php',
        body: formData,
        method: 'POST'
      }, function (err, res, body) {
        //it works!
        //console.log(res);
        if(body =='false' ){
            console.log('wrong', varible)
            //console.log('ok');
        }
        else{console.log('rightsdsdsd',varible)}
      });
    
    
}

  