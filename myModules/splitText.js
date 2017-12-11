var callFunc = require('./postCallFunctions.js');
/*
 splitText
 */

var allClasses = ["1a","1b","1c","1d","1e","1f","2a","2b","2c","2d","3a","3b","3c","3d","2ga","2gb","2gc","2gd","3ga","3gb","3gc","3gd"];
//splitBySpace("   0 Ala ma kota");

var teachers = [] //teacher's list
//send mess to Admin if to many fields after split
//find if in some first fields is classname
//command on help
//
var teacherList = teachers.map(function(el){
    //el=el.toLowerCase();
    return el.split(' ');
});
//console.log(similarTeachers("senderowi"));
function similarTeachers(teacherString,callback){
    var buff;
    var x = teacherList.map(function(el){
        return el.map(function(single){
            return compare(teacherString,single);
        })
    });
    var te=[];
    for(var i=0;i<x.length;i++){
        for (var j=0;j<x[i].length;j++){
            if(x[i][j]<4){
                te.push(teachers[i]);
                break;
            }
        }
        
    }
    console.log(te);
    
}
function compare (str1, str2) {
      var prevRow = [],
    str2Char = [];
      var str1Len = str1.length,
        str2Len = str2.length;
      
      // base cases
      if (str1Len === 0) return str2Len;
      if (str2Len === 0) return str1Len;

      // two rows
      var curCol, nextCol, i, j, tmp;

      // initialise previous row
      for (i=0; i<str2Len; ++i) {
        prevRow[i] = i;
        str2Char[i] = str2.charCodeAt(i);
      }
      prevRow[str2Len] = str2Len;

      var strCmp;

        // calculate current row distance from previous row without collator
        for (i = 0; i < str1Len; ++i) {
          nextCol = i + 1;

          for (j = 0; j < str2Len; ++j) {
            curCol = nextCol;

            // substution
            strCmp = str1.charCodeAt(i) === str2Char[j];

            nextCol = prevRow[j] + (strCmp ? 0 : 1);

            // insertion
            tmp = curCol + 1;
            if (nextCol > tmp) {
              nextCol = tmp;
            }
            // deletion
            tmp = prevRow[j + 1] + 1;
            if (nextCol > tmp) {
              nextCol = tmp;
            }

            // copy current col value into previous (in preparation for next iteration)
            prevRow[j] = curCol;
          }

          // copy last col value into previous (in preparation for next iteration)
          prevRow[j] = nextCol;
        }
      
      return nextCol;
}
//console.log(compare("",""));

function splitBySpace(string){
    return string.split(' ');
}
function commandValidation(text){
    var allClasses = ["1a","1b","1c","1d","1e","1f","2a","2b","2c","2d","3a","3b","3c","3d","2ga","2gb","2gc","2gd","3ga","3gb","3gc","3gd"];
    var day="";

    if(allClasses.indexOf(text[1]) > -1){
        if(text[0] == "0" || text[0] == "1")
        return true;
    }
    else 
        return false;
    
    
}
function ifChanges(text,callback){
    if(commandValidation(text)){
        var day;
        switch(text[0]){
            case "0":
                day="today";
            break;
            case "1":
                day="tommorow"
            break;
        }
        callFunc.changesForMessenger(text[1],day,function(allChanges,weekDay){
            setImmediate(function(){
                callback(allChanges,weekDay);
            });            
        });    
    }
    else{
        setImmediate(function(){
                callback();
            });
    }
}

//All messages to messagesCollection
//all unread messages to messengerPerson
//after read just pop them somwwhere else
//what with system messages

exports.split=splitBySpace;
exports.validate=commandValidation;
exports.ifChanges=ifChanges;











