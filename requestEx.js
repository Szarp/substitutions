var request= require('request');
var fs = require('fs');
var url='http://zso11.edupage.org/substitution/?';
var url2='http://zso11.edupage.org/gcall';
//var cookie = 'PHPSESSID=74us7g22md7ah58hln030jcf20; ';
var gDate=['7259810','f36e91b1'];

var request= require('request');
function cookieFromPage(){
    this.url='http://zso11.edupage.org/';
    this.cookie=[];
    this.params=[];
    this.getCookie=function(){
        request(this.url,function(err,res,body){
            if(!err && res.statusCode ==200){
                this.params=this.getGPIDandGSH(body);
                this.cookie=res.headers['set-cookie'];
            }
        })
    }
    this.getGPIDandGSH=function(file){
        var gshString='gsh';
        var a=file.indexOf('gsh');
        var gpid=file.slice(a-8,a-1);
        var gsh=file.slice(a+4,a+12);
        return [gpid,gsh];
    }
    
    
}
function setDate(){
    //this.Today = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
    //this.day
    //this.month
    //this.year
    this.dispalyTime=function(){
        return this.year+'-'+this.month+'-'+this.day;
    }
    this.updateTime=function(){
        this.year = this.Today.getFullYear();
        this.month = this.Today.getMonth()+1;
        this.day = this.Today.getDate();
        if(this.month<10){this.month='0'+this.month;};
        if(this.day<10){this.day='0'+this.day;};
    }
    this.todayIs=function(){
        this.Today = new Date();
        this.updateTime();

    }
    this.tommorowIS=function(){
        this.Today = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
        this.updateTime();
    }
    this.yeasterdayIS=function(){
        this.Today = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
        this.updateTime();
    }
    this.setDate=function(year,month,day){
        this.Today=new Date();
        this.Today.setFullYear(year);
        this.Today.setDate(day);
        this.Today.setMonth(month);
        this.updateTime();
        
    }
    
}
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
var querystring = require('querystring');
//var request = require('request');
//7593327 1dc1b4b7 [ 'PHPSESSID=h1tb8i7mgbnpr3ug6kp5gp2ei0; path=/' ]
function getDateFromGcall(){
    var gDate=['7593327', '1dc1b4b7'];
    var cookie='PHPSESSID=9q2ks606oja6p37c1mb4octni5';
    var form = {
        gpid:gDate[0],
        gsh:gDate[1],
        action:"switch",
        date:"2016-09-26",
        _LJSL:"2,1"
    };

    var formData = querystring.stringify(form);
    //console.log(formData);
    var contentLength = formData.length;

    request({
        headers: {
          'Content-Length': contentLength,
          'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie' : cookie
        },
        uri: url2,
        body: formData,
        method: 'POST'
      }, function (err, res, body) {
        //it works!
       // console.log(res);
        console.log(body);
      });
}
  