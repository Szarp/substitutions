var findBraces = require(__dirname +'/findBraces.js');
module.exports = function getJsonFromHtml(){
    //this.fileString
    //this.slicedString
    //this.keyObj
    findBraces.call(this);
    this.teacherString='"teachers":{';
    this.dataString='DataSource([';
    //this.teacherString='teacher';
    this.testIfCorrectFile=function(){
        var err;
        var index=this.fileString.indexOf(this.teacherString);
        err = true;
        if(index == -1){
            err=false;
        }
        return err;
        
    }
    this.getJsonObj=function(){
        this.cutFromTeacher();
            var keyIndex=this.iterateArray(['{','}']);
            this.keyObj=this.fileString.slice(keyIndex[0],keyIndex[1]+1);
        this.cutFromDataSource();
            var dataIndex=this.iterateArray(['[',']']);
            this.dataObj=this.fileString.slice(dataIndex[0],dataIndex[1]+1);
        
        
        
    }
    this.iterateArray =function(pattern){
        var x=0;
        for (var i=0; i < this.fileString.length; i++) {
            var char =this.fileString.charAt(i);
            //console.log('char: '+char);
            if(char ==pattern[0] && x==0){
                this.startBracing(i);
                x=1;
            }
                
                this.findBracketObject(char,i,pattern);
                //console.log('brace: '+this.braceCounter);
            
            if(this.isObjFound == true){
                return[this.beginOfArray,this.endOfArray];
            }
        }
            //console.log(texto.charAt(i)); 
        
    }
    this.indexOfStringInFile=function(string){
        var index=this.fileString.indexOf(string);
        if(index == -1){
            console.log('problem with finding teacherString: ');
            console.log(Date());
            console.log(string);
            return;
        }
        return index;
        
    }
    this.cutFromTeacher=function(){
        var beginpoint=this.indexOfStringInFile(this.teacherString);
        this.fileString=this.fileString.slice(beginpoint-2,this.fileString.length);
    }    
    this.cutFromDataSource=function(){
        var beginpoint=this.indexOfStringInFile(this.dataString);
        this.fileString=this.fileString.slice(beginpoint+this.dataString.length-1,this.fileString.length);
    }
    this.findKeyObject=function(){
        
        
    }
    this.findBraces=function(){//klamry
        this.startBracing();
        var a=this.iterateArray();
        console.log(a);
        
    }
}