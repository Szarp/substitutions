//var substitution = new getSubstitution();
//var b = exports.b = 0;
/*exports.dataArray=function(string){
    substitution.dataArray=string;
    
}
exports.keyArray=function(string){
    substitution.keyArray=string;
    
}
exports.changes=substitution.changes;
exports.abc=substitution.returnChanges;
//exports.x = a.removeLastCharakters('asdfghjkl');
*/


//exports.getB = function() { return b; };


module.exports=function(){
    this.keyList={};
    this.substitutionList={};
    this.keyElements=[];
    this.allChanges=[];
    this.changes=function(){
        this.returnChanges();
        //this.createKeyList();
        //console.log('im here');
        return this.allChanges;
    }
    this.returnChanges=function(){
        if(this.keyArray==undefined||this.dataArray==undefined){
            console.log('no data to translate');
            return;
        }
        this.createKeyList();
        //console.log(this.keyList);
        this.allKeyElements();
        //console.log(this.keyList);
        this.changeIdForElements();
    }
    this.changeIdForElements=function(){
        for (var i=0;i<this.dataArray.length;i++){
            var actualChange=this.dataArray[i];
            var newObj={};
            for (k in actualChange){

                if (k == 'changes'){
                    if(actualChange["cancelled"]==false){
                        var changes=[];
                        var someObj={};
                        var toChange = actualChange[k];
                        //console.log(toChange);
                        //someObj={};
                        for(var j=0; j<toChange.length;j++){
                            var name = toChange[j]['column'];
                            var categoryName=this.returnCategoryName(name);
                            //console.log(categoryName);
                            var value1 = toChange[j]['new'];
                            //console.log(value1);
                            if(value1 != undefined){
                                var tableElement=this.changeToTable(value1);
                                var value = this.findInCatgory(categoryName,tableElement);
                                someObj[categoryName]=value;
                                //console.log(newObj);

                                
                            }
                        }
                        var x={};
                        //x['changes']=someObj
                        //console.log(someObj);
                        this.allChanges[i]['changes']=someObj;
                        //console.log(someObj);
                    }
                }

                else{
                    var help='';
                    var categoryName=this.returnCategoryName(k);
                    if(categoryName == false){help=k}
                    var tableElement=this.changeToTable(actualChange[k]);
                    var value=this.findInCatgory(categoryName,tableElement);
                    //var newObj={}
                    newObj[categoryName]=value;
                    //changes[i][categoryName]
                    
                    //actualChange[k]=value;
                    //console.log(a+"   "+value);
                }
                this.allChanges[i]=newObj;
                //console.log(actualChange);
            }
        }
        //console.log(this.allChanges);
        return;
    }
    this.changeToTable = function(element){
        
        if(element.constructor === Array){
            //if(Array.isArray(element)){console.log('yes')}
            //console.log('hi',element )
            return element;
            //console.log('is table:  ' + element +'  '+category )
        }
        else{
            var newElement=[];
            newElement[0]=element;
            return newElement;
            //console.log('is string: ' + element)
        }
        
    }
    this.removeLastCharakters=function(string){
        var len = string.length;
        return string.slice(0,len-4);
        
    }
    this.findInCatgory=function(category,element){
        if (element[0] == ""){return element};
        var findingList=this.keyList[category];
        //console.log(findingList);
        if(findingList == undefined){return element};
        var elementsToReturn=[];
        for(var i=0;i<findingList.length;i++){
            //console.log('loop');
            //console.log(element.length);
            for(var j=0;j<element.length;j++){
                for (k in findingList[i]){
                   // console.log(element[j],k)
                    if(k == element[j]){
                        //console.log(findingList[i][k])
                        elementsToReturn[j]=findingList[i][k];
                    }
                    break;
            }
                
                //return elementsToReturn;
                //console.log('abc',elementsToReturn);
                //else{console.log('a:  '+findingList[i][k],element)}
            }
        }
        //console.log('hey',element);
        return elementsToReturn;
    }
    this.allKeyElements=function(){
        var i=0
        for(k in this.keyList){
            this.keyElements[i]=k;
            //console.log(this.keyList);
            i++;
        }
    }
    this.returnCategoryName=function(string){
        if(string.length>5){
            var slicedString=this.removeLastCharakters(string);
        }
        for(var i=0;i<this.keyElements.length;i++){
            //console.log(this.keyElements[i])
            var ifContain=this.isThereString(this.keyElements[i],slicedString);
            if(ifContain==true){return this.keyElements[i]};
            //console.log(ifContain);
        }
        return string;
    }
    this.isThereString=function(keyString,stringToFind) {
        return (keyString.indexOf(stringToFind) != -1);
    }
    this.createKeyList=function(){
        for (k in this.keyArray){ //techer
            var category=this.keyArray[k];
            //console.log(category);
            var num=0;
                this.keyList[k] = [];
            for(l in category){
                var element=category[l]
                var newObject={};
                newObject[element['id']] = element['short'];
                 this.keyList[k][num]=newObject;
                num++;
            }
        }
    }
}


















