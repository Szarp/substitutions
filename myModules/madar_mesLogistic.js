function messengerFunc(configParams){
    var self=this
    sensorStatus.call(this,configParams);
    //this.test=function(){console.log("test")};
    this.status=function(callback){
        self.macList(function(list){
            list=JSON.parse(list)["connection"];
            var connected=0;
            var deconnected=-1;
            for(k in list){
                if(list[k]["RSSI"]!="")
                    connected++;
                else
                    deconnected++;
            }
            //list.forEach(function(a){console.log("name",a.name,"RSSI",a.RSSI)})
            //console.log(connected+" connected devices")
            //console.log(deconnected+" deconnected devices")
            setImmediate(function(){
                callback({"connected":connected,"deconnected":deconnected});
            });  
        })
    }
}
function sensorStatus(configParams){
    var self=this;
    Madar.call(this,configParams);
    this.average=function(arr){
        arr=arr["values"][0];
        arr=arr.filter(function(el){return el != null})
        var sum=0
        for(k in arr)
            sum+=arr[k];
        return Math.floor(sum/arr.length*10)/10;
    }
    this.sensor=function(text,callback){
        var form={}
        self.convertName(text,function(sens){
            if(sens !== undefined){
                form["name"]=sens["name"]
                if(sens["RSSI"]!=""){
                    form["status"]="connected";
                    self.lastMeasure(sens["MAC"],function(data){
                        form["data"]=self.average(data);
                        setImmediate(function(){
                            callback(form);
                        });  
                    })
                }
                else{
                    form["status"]="deconnected";
                    setImmediate(function(){
                        callback(form);
                    });
                }
            }
            else{
                setImmediate(function(){
                        callback({"name":text,"status":"not found"});
                    });  
            }
        })
    }
    this.convertName=function(text,callback){
        self.macList(function(list){
            list=JSON.parse(list)["connection"]
            text=text.toLocaleLowerCase();
            var sensor;
            for(k in list){
                if(list[k]["name"].toLowerCase()==text || list[k]["MAC"].toLowerCase()==text){
                    sensor=list[k]
                    break;
                }
            }
            setImmediate(function(){
                callback(sensor);
            });  
        })
    }
    this.lastMeasure=function(macAddr,callback){
        var x= new Date().localTime();
        self.measure(macAddr,x-60*1000*20,x-60*1000*5,function(params){
            setImmediate(function(){
                callback(JSON.parse(params));
            });  
        });
    }
}
function Madar(configParams){
    var self=this;
    this.dest="json.htm";
    //this.name='bartek';
    this.name=configParams["name"];
    this.pass=configParams["pass"];
    this.url=configParams["url"];
    this.form={
        name:self.name,
        pass:self.pass,
        report:'data',
        mac:'002A0004',
        fromtime:1522064653-60*1000*10,
        tilltime:1522064653+60*1000*10,
        param:3,
        raster:6
    };
    this.request=function(parms,callback){
        request(self.prepareGet(parms), function (error, response, body) {
            setImmediate(function(){
                callback(body);
            });
        })
    }
    this.prepareGet=function(params){
        var string = self.url+"";
        string+=self.dest+'?';
        //console.log(string);
        for(k in params){
            string+=k+'='+params[k]+';';
        }
        return string;
    }
    this.macList=function(callback){
        var form={}
        form["name"]=self.name;
        form["pass"]=self.pass;
        form["report"]="connection";
        self.request(form,function(res){
            setImmediate(function(){
                callback(res);
            });
        })
    }
    this.values=function(macAddr,ftime,ttime,callback){
        var form=self.form;
        form["report"]="data";
        form["fromtime"]=ftime;
        form["tilltime"]=ttime;
        form["mac"]=macAddr;
        //console.log("hi",form);
        self.request(form,function(res){
            setImmediate(function(){
                callback(res);
            });  
        })        
    }
    this.measure=function(macAddr,ftime,ttime,callback){
        var form=self.form;
        form["report"]="measure";
        form["fromtime"]=ftime;
        form["tilltime"]=ttime;
        form["mac"]=macAddr;
        //console.log("hi",form);
        self.request(form,function(res){
            setImmediate(function(){
                callback(res);
            });  
        })        
    }
    this.deleteStatic=function(tab){
        var newTab=""
        for(var l=10;l<tab.length;l++){
            //if(l%2==0){
                newTab+=parseInt(tab[l], 16);
                newTab+=","
            //}
        }
        return newTab.slice(0,newTab.length-1);
    }
}
