//save reqests to files
var mongo = require('./mongoFunctions.js'),
    assert = require('assert'),
    request= require('request'),
    jsonFromHtml = require('./getJsonFromHtml.js'),
    userMod = require('./getSubstitution.js'),
    querystring = require('querystring');

/*
    module to comunicate with ZSO11 server
    
*/


var substitution =new jsonFromHtml();
var user= new userMod();
//module.exports= getSomeSubstitution;
var getSomeSubstitution = function(date,callback){
    getData(date,function(data){
        convertToSubstitutions(data,function(convertedData){
            //console.log('converted',convertedData);
            classListFromDate(convertedData,function(res){
                var dataToSave={};
                dataToSave['substitution']=convertedData;
                dataToSave['userList']=res;
                saveSubstitutions(date,dataToSave,function(){

                    mongo.findById(date,'substitutions',function(err,x){


                        console.log(x);
                    })
                    console.log('save substitution '+ date);
                    setImmediate(function() {
                        callback(convertedData);
                    });

                })
            })
            
        })
    })
              //console.log(x);
}
function classListFromDate(convertedData,callback){
    var classList=[];
    if (convertedData =='no substitutions'){
        setImmediate(function(){
            callback({});
        });   
        
    }
    else{
     //mongo.findById(date,'substitutions',function(e,doc){
         console.log('doc',convertedData);
         var changes = convertedData;
        for(var i=0;i<changes.length;i++){
            var oneChange = changes[i];
            var newClass = oneChange['classes'];
            console.log('newClass',newClass);
            for(var j =0;j<newClass.length;j++){    
                if(classList.indexOf(newClass[j])==-1){
                    classList[classList.length]=newClass[j];
                }
            }
        }
        setImmediate(function(){
            callback(classList);
        });   
    }

    //})
}
var getData = function(date,callback){
    downloadData(date,function(err,body){
        if(!err){
            getCookie(function(){
                downloadData(date,function(err1,newBody){
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
    mongo.findById('params','testCollection',function(err1,params){    
     //var gDate=['7593327', '1dc1b4b7'];
        console.log('params',params);
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
                        console.log('cookies saved: '+data);
                        
                        setImmediate(function() {
                            callback(data);
                        });
                    })
                });
                //ex(this.body);
                //  console.log('hi',params[0],params[1],cookie);
                //save somewhere
            }
        });

    }
    
function checkIfAnySubstitutions(callback){
    var res;
    getData(date,function(body){
       if(body.indexOf('column') != -1){
                res=true;
                console.log('i see something');
            }
        else{
            res=false;
            console.log('nothing')
        }

        setImmediate(function() {
                callback(res);
        });
    })
        
}
function saveSubstitutions(date,data,callback){
    var dataToSave={};
        dataToSave['substitution']=data.substitution;
        dataToSave['userList']=data.userList;
    
        //console.log(dataToSave);
        mongo.modifyById(date,'substitutions',data,function(){
            setImmediate(function() {
                callback(); //callback no need
            });
            //console.log('saved substitutions '+date);
            
            //ok;
        })
    
}
function convertToSubstitutions(data,callback){
    //console.log('hi');
    var allChanges;
    substitution.fileString=data;
    var err=substitution.testIfCorrectFile();
    //console.log(err);
    if(err){
        substitution.getJsonObj();
        user.keyArray=JSON.parse(substitution.keyObj);
        user.dataArray=JSON.parse(substitution.dataObj);
        //console.log(substitution.dataObj);
        allChanges=user.changes();
    }
    else{
        allChanges='no substitutions';
    }
    //console.log('convertFunc: ',allChanges);
    setImmediate(function() {
        callback(allChanges); //respone converted changes
    });   
}
function getGPIDandGSH (data,callback){ //take params to send request
        var a=data.indexOf('gsh');
        var gpidIndex;
        var gshIndex;
        //"gpid=634226&gsh=d2ec0c25"
        for (var i=0; i<11;i++){
            
            if (data.charAt(a-i)=='='){
                gpidIndex=a-i;
                break;
            }
            
        }
        for (var i=0; i<20;i++){
            //console.log('char',data.charAt(a+i));
            if (data.charAt(a+i)=='"'){
                gshIndex=a+i;
                break;
            }
            
        }
        var gpid=data.slice(gpidIndex+1,a-1);
        //var gpid='a';
        var gsh=data.slice(a+4,gshIndex);
        //var gsh='b';
        //console.log(gpid,gsh);
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
exports.getGPIDandGSH = getGPIDandGSH;