//save reqests to files
var mongo = require('./mongoFunctions.js'),
    assert = require('assert'),
    request= require('request'),
        jsonFromHtml = require('./getJsonFromHtml.js'),
    userMod = require('./getSubstitution.js'),
     querystring = require('querystring');

var substitution =new jsonFromHtml();
var user= new userMod();
//module.exports= getSomeSubstitution;
var getSomeSubstitution = function(date,callback){
    getData(date,function(data){
        convertToSubstitutions(data,function(convertedData){
            saveSubstitutions(date,convertedData,function(){
                    
                mongo.findById(date,'substitutions',function(x){


                   // console.log(x);
                })
                console.log('save substitution '+ date);
                setImmediate(function() {
                    callback(convertedData);
                });
                
            })
            
        })
    })
              //console.log(x);
}
var getData = function(date,callback){
    downloadData(date,function(err,body){
        if(err){
            getCookie(function(){
                downloadData(date,function(err,newBody){
                    setImmediate(function() {
                        callback(newBody);
                    });
                })
            });
        }
        else{
            setImmediate(function() {
                callback(body);
            });
        }   
    });
}
    function getParams(callback){
        //this.ex('ab');
        var url='http://zso11.edupage.org/substitution/?';
        request(url,function(err,res,body){
            if(!err && res.statusCode ==200){
                getGPIDandGSH(body,function(params){
                    var cookie=res.headers['set-cookie'];
                    var data = {
                        'gpid':params[0],
                        'gsh':params[1],
                        'cookie':cookie
                    }
                    console.log(JSON.stringify(data));
                    saveToCollection(['testCollection',data],function(){
                        console.log('data added: '+data);
                        
                    })
                    
                });
                //ex(this.body);
                //  console.log('hi',params[0],params[1],cookie);
                //save somewhere
            }
        });
        setImmediate(function() {
                callback();
            });
    }
function downloadData(date,callback){
    var url1='http://zso11.edupage.org/gcall';
    mongo.findById('params','testCollection',function(params){    
     //var gDate=['7593327', '1dc1b4b7'];
    var cookie=params['cookie'];
    var form = {
        gpid:params['gpid'],
        gsh:params['gsh'],
        action:"switch",
        date:date,
        _LJSL:"2,1"
    };
    var formData = querystring.stringify(form);
    var contentLength = formData.length;

    request({
        headers: {
          'Content-Length': contentLength,
          'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie' : cookie
        },
        uri: url1,
        body: formData,
        method: 'POST'
      }, function (err, res, body) {
        assert.equal(null,err);
                setImmediate(function() {
                callback(body.length<100,body);
            });
            //console.log(body);
        
      });

    });
}

    var getCookie=function(callback){
        //this.ex('ab');
        var url='http://zso11.edupage.org/substitution/?';
        request(url,function(err,res,body){
            if(!err && res.statusCode ==200){
                getGPIDandGSH(body,function(params){
                    var cookie=res.headers['set-cookie'];
                    var data = {
                        'gpid':params[0],
                        'gsh':params[1],
                        'cookie':cookie
                    }
                    console.log(JSON.stringify(data));
                    mongo.modifyById('params','testCollection',data,function(){
                        console.log('data added: '+data);
                        
                    })
                setImmediate(function() {
                callback(data);
            });
                    
                });
                //ex(this.body);
                //  console.log('hi',params[0],params[1],cookie);
                //save somewhere
            }

        });

    }
    
function saveSubstitutions(date,data,callback){
    var dataToSave={};
        dataToSave['substitution']=data;
        //console.log(dataToSave);
        mongo.modifyById(date,'substitutions',dataToSave,function(){
            setImmediate(function() {
                callback();
            });
            //console.log('saved substitutions '+date);
            
            //ok;
        })
    
}
function convertToSubstitutions(data,callback){
    //console.log('hi');
    var response;
    substitution.fileString=data;
    var err=substitution.testIfCorrectFile();
    //console.log(err);
    if(err){
        substitution.getJsonObj();
        user.keyArray=JSON.parse(substitution.keyObj);
        user.dataArray=JSON.parse(substitution.dataObj);
        //console.log(substitution.dataObj);
        response=user.changes();
        //fs.writeFileSync(__dirname+'/json/dataEx.txt', JSON.stringify(user.dataArray), 'utf-8');
    }
    else{
        response='no substitutions';
    }
    console.log('convertFunc',response);
    setImmediate(function() {
        callback(response);
    });

    
    
}
    var getGPIDandGSH=function(data,callback){
        //console.log('mi');
        var gshString='gsh';
        var a=data.indexOf('gsh');
        var gpid=data.slice(a-8,a-1);
        var gsh=data.slice(a+4,a+12);
        setImmediate(function() {
            callback([gpid,gsh]);
        });
    }
    
exports.subs = getSomeSubstitution;
exports.getData = getData;
exports.downloadData = downloadData;
exports.getCookie = getCookie;
exports.convert = convertToSubstitutions;
exports.save = saveSubstitutions;
//exports.getGPIDandGSH = getGPIDandGSH;