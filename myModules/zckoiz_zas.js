//zckioz school communication
var fs = require ('fs');
var request = require('request');
var mon = require('./mongoConnection.js');
var config = require('./config');

var monChanges = new mon.zckoizSubstitutions(config.db);
function getChanges(callback){
    request("http://www.zckoiz.zabrze.pl/zastepstwa",function(err,res,body){
        var convert = new zckioz(body);
        convert.init();
        monChanges.save(assignId(convert.toSave),function(){
            setImmediate(function(){
                callback();
            });  
        })
	});
}
function assignId(preparedData){
    var data =preparedData.substitution.map(function(el){
        return el.className;
    })
    var classList=[];
    for(var j =0;j<data.length;j++){
        if(classList.indexOf(data[j])==-1){
            classList[classList.length]=data[j];
        }
    }
    preparedData["_id"]=preparedData.date;
    preparedData["classList"]=classList;
    return preparedData;
}
function zckioz(body){
    var self = this;
    this.url="http://www.zckoiz.zabrze.pl/zastepstwa";
    this.rawChanges=[];
    this.day="";
    this.toSave=""
    this.init=function(){
        self.convertText(body);
        self.clearBlank();
        self.getDay();
        self.splitText();
        self.toSave=self.save();
    }
    this.save=function(){
        return {substitution:self.rawChanges,date:self.day.date}   
    }
    this.convertText=function(text){
        var teacher="";
         text.split("<p").forEach(function(el){
            if (el.length<100){
                el = el.replace("</p>","");
                el = el.replace(/[\n\r]/g,"");// \n and \r deletion 
                el = el.substr(1);
                 if(el.indexOf("<strong>")>-1){
                     el = el.split("strong")[1];
                     el = el.substr(1);
                     el = el.replace("</","");
                     self.rawChanges.push([el]);
                     //console.log(el)
                 }
                 else if(el.indexOf("<u>")>-1){
                     el = el.replace("<u>","");
                     el = el.replace("</u>","");
                     teacher = el;
                     //console.log("Nauczyciel",el); 
                 }
                 else{
                     self.rawChanges.push({text:el,teacher:teacher});
                 }
            }
         });
    }
    this.clearBlank=function(){
        var elems =  self.rawChanges;
        var pat=['',' '];//some special charakter too
        self.rawChanges = self.rawChanges.filter(function(el){
            for(i in el){
                if(el[i]==pat[0] || el[i]==pat[1]){
                    el = null;
                    //console.log(el[i]);
                    return el !== null;
                }
            }
            return el;
        });
    }
    this.getDay=function(){
        var text = self.rawChanges[0][0];
        text = text.split(" ");
        self.day={dayName:text[0],date:text[1].replace(/[\.]/g,"-")}
        self.rawChanges = self.rawChanges.slice(1);
    }
    this.splitText=function(){
        var text=""
        self.rawChanges.map(function(el){
            text = el["text"];
            el["lessonNum"]=self.lessonNum(text);
            el["className"]=self.findClass(text);
            return el;
        })
    }
    this.lessonNum=function(text){
        var index = text.indexOf(".");
        return self.classToNumber(text.substr(0, index));
    }
    this.classToNumber = function(text){
        var nums=text.split("-");
        //console.log('nums',nums);
        nums = nums.map(function(el){return Number(el);});
        //console.log('numsMAp',nums);
        var allNums=[];
        if(nums.length>1){
            for(var i=nums[0];i<=nums[1];i++){
                //console.log(i)
                allNums.push(i);
            }
            return allNums;
        }
        else{
            return nums
        }
    }
    this.findClass=function (text){
        var beg = text.indexOf(".");
        var end = text.indexOf("–");//special charcode for - 
        return text.slice(beg+1, end-1);
    }
}

exports.subs = getChanges;