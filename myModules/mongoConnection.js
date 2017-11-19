var MongoClient = require('mongodb').MongoClient,
    config = require('./config'),
    assert = require('assert');
/*
mongo functions v2
*/
//var mon = new mongo('ZSO11','person');

//mon.find({},{},function(e,x){
//    console.log(x);
//})

//var x = new messengerCollection('ZSO11');
/*
x.update('0000',{personal:{wtf:"hejjhsdjhs",oncemore:"hey"}},function(e,r){
    //console.log('update',e,r);
    x.find({_id:'0000'},{},function(e,r){
    console.log('find',r);
})
    
})
*/
//x.addPerson("0005",function(e,r){console.log("add person",e,r);});
//x.update("0003",{"personal":{picture:"a"}},function(e,r){});
//mox.find({},{},function(e,r){console.log('find3',r);})
//x.stats(function(e,r){console.log('stats',e,r);});
//x.notificationList(function(e,r){console.log('list',e,r);});
/*
x.addPeronalData("0000",
                 {name:'Bartek Mazur',picture:'https://google.com'},function(e,r){
    x.find({_id:"0000"},{},function(ee,rr){
        console.log('found personal data',ee,rr);
    })
    //console.log('personal data',e,r);
    
})
*/
//x.readPersonalData("0000",function(e,r){console.log("perosnal data",e,r);})
//x.update("0000",x.personStructure,function(){});
/*
function messengerCollection(DB){
    var self=this;
    mongo.call(this,DB,'messengerPerson');
}
*/
var x = new substitutionsCollection('ZSO11');
//console.log("x",x);
/*
x.largeFind(function(item){
    if(item._id=='2017-10-15')
        console.log(item);
});
*/
x.find({_id:'2017-10-19'},{},function(e,r){
    //console.log("r",r);
})


    
   // db.close();

//x.collectionList(function(xy){console.log("col: ",xy);});
function substitutionsCollection(DB){
    var self=this;
    mongo.call(this,DB,'substitutions');
    this.substitutionsStructure={
        _id: "",
        substitution:[], //need change
        userList: {},
        date: "",
        teachersList: []
    }
    this.save=function(date,data,callback){
        var dataToSave={};
		dataToSave['substitution']=data.substitution;
		dataToSave['userList']=data.userList;
		dataToSave['date']=date;
		dataToSave['teachersList'] = data.teachersList;
        self.update(date,dataToSave,function(){
            setImmediate(function() {
                callback(); //callback not necessary
            });
            //ok;
        })
    }
    //this.coll
}
function personCollection(DB){
    var self=this;
    mongo.call(this,DB,'person');
    this.personStructure={ _id: "",
        personal:{
            id: "",
            settings:{
                setClass: "", notification: "", setTeacher:""
            },
            name: "",
            picture: ""
        },
        system:{
            secret: "",
            connected: false,
            lastLogin: 0,
            fromWhen: 0,
            messages:[]
        }
    }
    //console.log('schem',self.personStructure);
    this.collectionCheck=function(){
        //var schem =new collectionsSchema();
        self.find({},{},function(e,elems){
            var x;
            elems.forEach(function(el){
                //console.log();
                x = self.updateStructure(el,self.personStructure);
                self.update(el._id,x,function(e,r){
                    console.log("collection check: ",r.result);    
                })
                
            })
        })
    }
    this.addPerson=function(_id,callback){
        var time = new Date().getTime();
        var per = self.personStructure;
        per._id = _id;
        per.id=_id;
        per.system.fromWhen=time;
        self.find({_id:_id},{},function(e,r){
            if(r.length==0){
                self.insert([per],function(e,x){
                    setImmediate(function(){
                        callback(e,x.insertedCount);
                    });
                //console.log('col',x);
                });      
            }
            else{
                setImmediate(function(){
                    callback(0);
                });
            }
        })
    }
    this.addPeronalData=function(_id,arr,callback){
        self.update(_id,{"personal":arr},function(e,r){
            setImmediate(function(){
                callback(e,r);
            });   
        })
    }
    this.readPersonalData=function(_id,callback){
        self.find({_id:_id},{"personal":true},function(e,r){
            console.log('personal data request for: ',_id);
            if(r[0].personal){
                setImmediate(function(){
                    callback(e,{name:r[0].personal.name,picture:r[0].personal.picture});
                });  
            }
            else{console.log("some problem");}
        })
    }
    this.readSettings=function(_id,callback){
        self.find({_id:_id},{"personal":true},function(e,r){
            console.log('settings data request for: ',_id);
            setImmediate(function(){
                callback(e,{name:r[0].personal.name,settings:r[0].personal.settings});
            });  
        })
    }
    this.removePerson=function(_id,callback){
        self.remove(_id,function(e,r){
            setImmediate(function(){
                callback(e,r);
            });
        });
    }
    this.notificationList=function(callback){
        self.find(
            {"personal.settings.notification":'yes',"system.connected":true},{"personal.id":1,"personal.settings":1},
        function(e,r){
            var list=[];
            var arr={};
            for(var i=0;i<r.length;i++){
                arr['id']=r[i].personal['id'];
                arr['class']=r[i].personal.settings['setClass'];
                arr['teacher']='---'
                if(r[i].personal.settings['setTeacher']){
                    arr['teacher']=r[i].personal.settings['setTeacher'];
                }
                list[i]=arr;
                arr={};
            }
            setImmediate(function(){
					callback(list);
            }); 
                
        })
        
    }
    
}
function mongo(DB,collectionName){
    structureFunctions.call(this);
    var self=this;
    this.DB=DB;
    this.collName=collectionName;
    this.url='mongodb://localhost:27017/';
    this.remove=function(_id,callback){
        self.plainConnection(function(db){
            var collection = db.collection(self.collName);
            collection.remove({_id:_id}, {w:1}, function(err, r) {
                setImmediate(function(){
                    callback(err,r);
                });
                db.close();
            });
            
        });
    }
    this.stats=function(callback){
        self.plainConnection(function(db){
            var collection = db.collection(self.collName);
            collection.stats(function(err, r) {
                setImmediate(function(){
                    callback(err,r);
                });
                db.close();
            });
            
        });    
    }
    this.options=function(callback){
        self.plainConnection(function(db){
            var collection = db.collection(self.collName);
            collection.options(function(err, r) {
                setImmediate(function(){
                    callback(err,r);
                });
                db.close();
            });
        });    
    }
    this.update=function(_id,elemsToUpdate,callback){
        self.find({_id:_id},{},function(e,obj){
            if(obj.length>0){
                obj=self.updateValue(obj[0],elemsToUpdate);
                //obj=self.updateValue(obj,elemsToUpdate);
                console.log('obj',obj);
                self.plainConnection(function(db){
                    var collection = db.collection(self.collName);
                    collection.update({_id:_id},{$set:obj},{upsert:true, w: 1}, function(err, result) {
                        //if(err)
                        setImmediate(function(){
                            callback(err,result);
                        });
                        db.close();
                    });
                });
            }
        });
    }
    this.insert=function(elems,callback){
        self.plainConnection(function(db){
            var collection = db.collection(self.collName);
            collection.insert(elems, {w:1}, function(err, result) {
                db.close();
                //console.log("res err",result,err);
                setImmediate(function(){
                    callback(err,result);
                });
            });
        });
    }
    this.find=function(parToFind,parToDisplay,callback){
        self.plainConnection(function(db){
            var collection = db.collection(self.collName);
            collection.find(parToFind,{fields:parToDisplay}).toArray(function(e,r){
                setImmediate(function(){
                    callback(e,r);
                })    
            });
            db.close();
        });
    }
    this.plainConnection=function(func){
        MongoClient.connect(self.url+self.DB, function(err, db) {
            if(!err)
                func(db);
            else 
                throw 'cant connect';

        })

    }
    this.collectionList=function(callback){
        self.plainConnection(function(db){
            db.listCollections().toArray(function(err, collInfos) {
                setImmediate(function(){
                    callback(collInfos);
                })
                db.close();
            });
        })   
    }
    this.countDocs=function(callback){
        self.plainConnection(function(db){
            var collection = db.collection(self.collName);
            collection.find().count(function(err, count) {
                setImmediate(function(){
                    callback(count);
                });
                db.close();
            })
        })
    }
    this.largeFind=function(func){
        self.plainConnection(function(db){
            var collection = db.collection(self.collName);
            var cursor = collection.find();
            cursor.each(function(err, item) {
                if(item != null){
                    func(item);
                // If the item is null then the cursor is exhausted/empty and closed
                }
                else{
                    cursor.toArray(function(err, items) {
                        db.close();
                    });
                };
            });
        });    
    }
}
function structureFunctions(){
    dataGenerator.call(this);
    var self = this;
    //this.schema=schema;
    //console.log('schem',self.schema);
    /*
    this.compareStructure = function(obj,schema){ //return boolen
        var equal = true;
        for (i in obj){
            if(typeof(obj[i])=="object"){
                if(schema[i]!=null)
                   equal=self.compareStructure(obj[i],schema[i]);
            }
            if (!schema.hasOwnProperty(i))
                equal = false;
        }
        return equal;
    }*/
    this.updateStructure = function(obj,schema){
        //var equal = true;
        for (i in schema){
            //console.log("update struc",obj[i],obj.hasOwnProperty(i));
            //console.log('obj',obj,obj.hasOwnProperty(i));
            if (!obj[i]){
                //console.log("schema",self.schema[i]);
                obj[i]=schema[i];
            }
            if(typeof(obj[i])=="object" && obj[i]!=null){
                if(schema[i]!=null){
                    //console.log("i",i,obj[i],"schema",schema[i]);
                    obj[i]=self.updateStructure(obj[i],schema[i]);
                }
            }
            else{
                console.log(typeof(obj[i])==typeof(schema[i]));   
            }
        }
        return obj;
    }
    this.updateValue = function(obj,schema){
        obj=self.updateStructure(obj,schema);
        //var equal = true;
        for (i in schema){
            if(typeof(obj[i])=="object"){
                if(schema[i]!=null)
                    obj[i]=self.updateValue(obj[i],schema[i]);
            }
            else{
                obj[i]=schema[i];   
            }
        }
        return obj;
    }
    /*
    this.checkTypeof=function(obj,schema){
        var equal = [true,""];
        //console.log("ok");
        //var equal = true;
        var com = "";
        for (i in obj){
            if (!schema.hasOwnProperty(i)){
                equal[1]="no field in schema";
                //obj[i]=schema[i];
            }
            if(typeof(obj[i])=="object"){
                if(schema[i]!= null)
                    equal=self.checkTypeof(obj[i],schema[i]);
            }
            else{
                if(typeof(obj[i])!=typeof(schema[i]));
                    equal[0]=false;
            }
                console.log(equal);
        }
        return equal;
    }*/
    this.randomStructure=function(){
        var obj = {};
        //var equal = true;
        var com = ""
        for (i in self.schema){
            if(typeof(self.schema[i])=="object"){
                obj[i]=self.randomStructure(self.schema[i]);
            }
            else{
                obj[i]=self.dataFillByType(typeof(self.schema[i]));
            }
        }
        return obj;
    } 
}
function dataGenerator(){
    var self = this;
    this.textType=function(){
        //var text={};
        var len = new Date().getTime()%15+1;
        return self.randomText(len)
    }
    this.numType=function(){
        var len = new Date().getTime()%10+1;
        return Math.floor(Math.random() * Math.pow(10,len));
    }
    this.dataFillByType=function(type){
        switch(type){
            case "boolean":
            return self.boolType();
            break;
            case "number":
                return self.numType();
            break;
            case "string":
                return self.textType();
            break;
            default:return "err";break;
        }
    }
    this.boolType=function(){
        var len = new Date().getTime()%2;
        if(len==0)
            return false;
        else
            return true;
    }
    this.randomText=function(len) {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < len; i++){
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }
}
exports.mongo=mongo;
exports.person=personCollection;
exports.substituions= substitutionsCollection;