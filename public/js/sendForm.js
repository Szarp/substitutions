var settings1 = {'asd':12};
var settings2={};
var set=new traslateSettings();
var z = new translateChanges();

var btnEvents ={
            saveBtn:function(){takeValuesFromForm()},
            tommorowBtn:function(){requestForChanges('tommorow')},
            todayBtn:function(){requestForChanges('today')},
        }
function setValuesToForm(params){
    var formList=['setClass','setNotification'];
    for(var i=0;i<params.length;i++){
        var sel = document.getElementById(formList[i]);
        var opts = sel.options;
        for(var opt, j = 0; opt = opts[j]; j++) {
            if(opt.value == params[i]) {
                sel.selectedIndex = j;
                break;
            }
        }
    }
}
function takeValuesFromForm(){
    //console.log('hi');
    var form={};
    form['setClass'] = document.getElementById('setClass').value;
    form['notification'] = document.getElementById('setNotification').value;
    var url = 'postCall';
    form['mode'] = 'saveSettings';
    //console.log(form);
    z.setClassName(form.setClass);
    z.displayData();
    sendObj(url,form,function(obj){
        //var json = JSON.parse(obj); 
        console.log('saveSettings',obj);
    });
    //console.log('param from form',a,b);
}

function requestForChanges(type){
    console.log('hi');
    var url = 'postCall'
    var form={};
    form['mode']='getChanges'
    if(type =='today'){
        form['param']='today';
        
    }
    if(type == 'tommorow'){
        form['param']='tommorow';
    }
    //console.log(form);
    sendObj(url,form,function(obj){
        var json = JSON.parse(obj);
        //set.saveData(json);
        //console.log(obj,json);
        z.data=json;
        if(obj =='"no substitutions"'){
            console.log('ji');
            z.data=[{"cancelled":[true],"note":["brak zmian"],
                    classes:[z.className]}];
            console.log(z.data);
        }
        z.displayData(); 
       // console.log(obj);
    });
}


function traslateSettings(){
    this.formId = 'setClass';
    this.saveData = function(data){
        this.changeDisplayEvents = data['changeDisplayEvents'];
        this.btnEvents=btnEvents;
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
        el.addEventListener('click',function(){ homePosition(key[1])},false);
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

function homePosition(id){
        var el;
        for(var i=0; i<settings1.events.length;i++){
            el = document.getElementById(settings1.events[i]);
            if(settings1.events[i]==id){
                el.style.display='block';
            }
            else{
                el.style.display='none';
            }
        }
}
function onLoadFunc(){
    console.log('hi2');
    var url='postCall';
    var form={};
    form['mode']='getSettings';
    sendObj(url,form,function(obj){
    //    console.log(JSON.parse(obj));
        settings1 = JSON.parse(obj);
        console.log('hi',settings1);
        set.saveData(settings1.event);
    set.addChangeClick();
    set.addClicks();
        z.setFields(settings1['fields']);
        z.setClassName(settings1.formValues[0]);
    setValuesToForm(settings1['formValues'])
        //set.saveData(settings1);
       
    });
    console.log(settings1);
}


    var sendObj = function(url,json_obj,callback){
    var http = new XMLHttpRequest();
    //var url = "get_data";
    var string_obj = JSON.stringify(json_obj);
       // console.log(string_obj);
    http.open("POST", url, true);
    http.setRequestHeader("Content-type", "application/json");
    http.onreadystatechange = function() {//Call a function when the state changes.
        if(http.readyState == 4 && http.status == 200) {
            callback(http.responseText);
        }
    }
    http.send(string_obj);
}
    function sendMessage(){
        var url = 'postCall';
        var form = {};
        form['mode']='message';
        var el = document.getElementById('messageArea');
        form['param']=el.value;
        //console.log(el.value);
       sendObj(url,form,function(responeText){
            
            el.value=responeText;
        })
        //el.innerHTML='hi';
        
    }
function translateChanges(){
    //this.data
    this.divId='changesContainer';
    this.parsedData="";
    this.finalTables="";
    this.setClassName=function(className){
        this.className= className;
    }
    //this.className=null;
    //fieldsToFill.call(this);
    this.setFields = function(fields){
        this.fields=fields;
        
    }
    //this.fields=settings1['fields'];
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
            //console.log(string);
            this.finalTables+=string;
            this.parsedData="";
            }
            //console.log(fi//);
        }
        if(this.finalTables ==""){
            this.addToArray('brak','zastępstw',0);
            string=this.beginOfTable()+this.parsedData+this.endOfTable();
            //
            this.finalTables+=string;
            this.parsedData="";
            //this.finalTables==
        }
    }
    this.changeContainsClass = function(oneChange){
    if(this.className =='all'||this.className==""){
        console.log('null on change');
        return true;
    };
    var classId=oneChange['classes'];
        for(var i=0;i<classId.length;i++){
            if(this.className == classId[i]){
                console.log('full on change');
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