module.exports = function findBraces(){
    //this.counter=0;
    this.findBracketObject=function(char,indexOfChar,pattern){
        //if(char !='{' && char != '{'){
          //  throw('bad char in module findBraces');
        //}
        if(char == pattern[0]){
            this.beginBrace();
        }
        if(char == pattern[1]){
            this.endBrace();
        }
        this.stopFindingBraces(indexOfChar);
    }
    this.startBracing=function(indexOfBrace){
        this.braceCounter=0;
        this.endOfArray=0;
        this.isObjFound=false;
        this.beginOfArray=indexOfBrace;
    }
    this.beginBrace=function(){
       this.braceCounter+=1;
        
    }
    this.endBrace=function(){
        this.braceCounter-=1;  
    }
    this.stopFindingBraces=function(indexOfBrace){
        if(this.braceCounter==0){
            this.endOfArray=indexOfBrace;
            this.isObjFound=true;
        }
    }
}


