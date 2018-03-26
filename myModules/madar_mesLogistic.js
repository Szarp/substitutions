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
