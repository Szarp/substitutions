
var set=new settings();
var z = new translateChanges();
z.className='1b'

function paramsFromServer(){
    
}
function getForm(){
    //console.log('hi');
    var a = document.getElementById('setClass').value;
    var b = document.getElementById('setNotification').value;
    b.value='no';
    var val = "1b";
    var sel = document.getElementById('setClass');
    var opts = sel.options;
    for(var opt, j = 0; opt = opts[j]; j++) {
        if(opt.value == val) {
            sel.selectedIndex = j;
            break;
        }
    }
    //b.value='no';
    //document.getElementById('fillPropertySpecie').value='no';
    console.log('param from form',a,b);
}
function loginToFacebook(){
    var q= new Date;
    //q.
    console.log(q.getTime()-5113963000);
    var url ='/facebookLogin';
     sendObj(url,{},function(obj){
         console.log(JSON.parse(obj));
        //var json = JSON.parse(obj);
        //set.saveData(json);
        //console.log(obj,json);
        //console.log(obj);
    });
    
}

function reqestForData(type){
    var url = 'getData'
    var form={};
    if(type =='today'){
        form['mode']='today';
        
    }
    if(type == 'tommorow'){
        form['mode']='tommorow';
    }
    //console.log(form);
    sendObj(url,form,function(obj){
        var json = JSON.parse(obj);
        //set.saveData(json);
        console.log(obj,json);
        z.data=json;
        if(obj =='"no substitutions"'){
            console.log('ji');
            z.data=[{"cancelled":[true],"note":["brak zmian"],
                    classes:[z.className]}];
            console.log(z.data);
        }
        z.displayData(); 
        //console.log(obj);
    });
}
var events = ['homePage','substitutionList','settingsMenu'];


function settings(){
    this.formId = 'setClass';
    this.saveData = function(data){
        this.changeDisplayEvents = data['changeDisplayEvents'];
        this.btnEvents=data['btnEvents'];
    }
    this.addChangeClick=function(){
        for(k in this.changeDisplayEvents){
            this.changeDisplayOnClick(this.changeDisplayEvents[k]);
        }
    }
    
    this.changeDisplayOnClick=function(key){
        console.log(key[0]);    
        var el = document.getElementById(key[0]);
        //console.log(el);
        el.addEventListener('click',function(){ goTo(key[1])},false);
    }
    this.addClicks=function(){
        for(k in this.btnEvents){
            var el = document.getElementById(k);
            //console.log(el);
            el.addEventListener('click',this.btnEvents[k],false);
            //console.log(this.btnEvents[k]);
        }
    }
}

function goTo(id){
        var el;
        for(var i=0; i<events.length;i++){
            el = document.getElementById(events[i]);
            if(events[i]==id){
                el.style.display='block';
            }
            else{
                el.style.display='none';
            }
        }
    }

function onLoadFunc(){
    set.saveData(event);
    set.addChangeClick();
    set.addClicks();
}


//var obj={'hey':'my name is skrilex','hey2':89};
    var sendObj = function(url,json_obj,callback){
    var http = new XMLHttpRequest();
    //var url = "get_data";
    var string_obj = JSON.stringify(json_obj);
        console.log(string_obj);
    http.open("POST", url, true);
    http.setRequestHeader("Content-type", "application/json");
    http.onreadystatechange = function() {//Call a function when the state changes.
        if(http.readyState == 4 && http.status == 200) {
            callback(http.responseText);
        }
    }
    http.send(string_obj);
}

function translateChanges(){
    //this.data
    this.divId='someId';
    this.parsedData="";
    this.finalTables="";
    //this.className=null;
    fieldsToFill.call(this);
    this.displayData=function(){
        console.log(this.className);
        this.finalTables="";
        this.getChange();
        this.tableTest();
    }
    this.getChange = function(){
        var string="";
        for(var j=0;j<this.data.length;j++){
            var findParam=this.changeContainsClass(this.data[j]);
            if(findParam){
            this.assignParams(this.data[j]);
            string=this.beginOfTable()+this.parsedData+this.endOfTable();
            //
            this.finalTables+=string;
            this.parsedData="";
            }
            //console.log(fi//);
        }

    }
    this.changeContainsClass = function(oneChange){
    if(this.className==null||this.className==undefined){return true};
    var classId=oneChange['classes'];
        for(var i=0;i<classId.length;i++){
            if(this.className == classId[i]){
                return true;
            }
        }
    return false;
    
    
}
    this.addToArray=function(keyText,keyValue,tabs){
        var text = this.createElement(keyText,keyValue,tabs);
        if(text !=""){
            this.parsedData+=text;
            //this.i++;
        }
    }
    this.tableTest=function(){
        var el = document.getElementById(this.divId);
        var text="";
        //console.log(a.innerHTML);
        el.innerHTML=this.finalTables;
    }
    this.assignParams = function(oneChange){
        this.i=0;
        var keyText="";
        var keyValue=""
        for (k in oneChange){
    //console.log('hey',k);
    //console.log('hey',this.fields);
            if(k=='cancelled'){
                keyText=this.fields[k];
                keyValue=this.getType(oneChange[k]);
                this.addToArray(keyText,keyValue,0);
            }
            else if(k=='changes'){
                this.addToArray('zastępstwo','jest',0);
                var changesIn=oneChange[k]
                for(l in changesIn){
                    keyText=this.fields[l];
                    keyValue=changesIn[l];   
                    this.addToArray(keyText,keyValue,1);
                    //console.log(keyText,keyValue);
                }
                
                //keyText=undefined;
                //console.log('some changes');
            }
            else{
                keyText=this.fields[k];
                keyValue=oneChange[k];
                this.addToArray(keyText,keyValue,0);
            }
            
            
            
            
        }
        
        
    }
    this.getType= function(value){
        if(value=='true'){
            this.style='backBlue'
            return 'anulowanie';
        }
        else{
            this.style='backRed'
            return 'zastępstwo';
        }
    }
    this.createElement=function(key,value,tabs){
        if(key==undefined||value==""){return '';};
        var tabString=this.createTabs(tabs);
        //console.log('tabs',tabs);
        var string = '<tr><td>'+tabString+'"'+key+'":<span>"'+value+'"</span></td></tr>';
        return string;
    }
    this.createTabs=function(tabs){
        var tabString="";
        for(var i=0;i<tabs*4;i++){
            tabString+='a';
        }
        if(tabs !=0){
            return '<span style="visibility: hidden;">'+tabString+'</span>'
        }
        else{
            return '';
        }
        
    }
    this.beginOfTable=function(){
        return '<table class="displayChanges '+this.style+'"><tbody>'
        
    }
    this.endOfTable=function(){
        return '</tbody></table>';
    }
    
}
    
var event={
        changeDisplayEvents :{
        'home':['navbar_home','homePage'],
        'substitution':['navbar_substitution','substitutionList'],
        'settings':['navbar_settings','settingsMenu']
    },
        btnEvents :{
        saveBtn:getForm,
        tommorowBtn:function(){reqestForData('tommorow')},
        todayBtn:function(){reqestForData('today')},
        chooseBtn:'',
        toFacebook:loginToFacebook

    }
}
function fieldsToFill(){
    this.fields={
        cancelled:'typ',
        note:'komentarz',
        periods:'lekcja',
        subjects:'przedmiot',
        teachers:'nauczyciel',
        classes:'klasa',
        classrooms:'sala',
        groupnames:'grupa',
        changes:'zmiany',
        substitution_types:'rodzaj'
    }
}