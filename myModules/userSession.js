
/* module to create sessions */
var sessionList ={};

function sessionCreator(){
    this.sessionId='sessionList';
    
    this.findIfSessionExist=function(cookie){
        var obj = this.getSessionElement();
        for(k in sessionList){
            if(k == cookie){
                return sessionList[k].id;
            }
        }
        return '0000';
    }
    this.addNewSession=function(id,cookie){
        //var list = this.getSessionElement();
        var sessionEl = new session(id,cookie);
        var newElement = sessionEl.returnParams();
        sessionList[newElement[0]]=newElement[1];
        console.log(sessionEl.returnParams());
        
        
    }
    this.getSessionElement=function(){
        return sessionList;
    }
    this.deleteOld = function(){
        var time = new Date().getTime();
        //console.log('time: ',time);
        for(k in sessionList){
            if(sessionList[k].exTime < time){
                //console.log('deleting: ',sessionList[k]);
                delete sessionList[k];
            }
        }
        //console.log('actualList',sessionList);
    }
    
}


function session(id,cookie){
    this.cookie = cookie;
    this.id = id;
    this.expirationTime = '';
    
    this.returnParams=function(){
        this.expirationTime=this.setExTime();
        var obj = []
        obj[0] = this.cookie 
        obj[1] = {id:this.id,
                exTime:this.expirationTime}
        return obj; 
            
        
    }
    this.setExTime=function(){
        var expirationTime = 2;
        var time = new Date()
        return time.getTime()+1000*60*60*expirationTime;
        
    }
    
    
}
exports.sessionCreator = sessionCreator;
exports.session = session;
