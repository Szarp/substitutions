var settings1 = {};
//var settings2={};
var set=new traslateSettings();
var z = new translateChanges();
var clssList=[];

var patternOfDisplay = [
    'typ',
    'klasa',
    'grupa',
    'lekcja',
    'przedmiot',
    'nauczyciel',
    'sala',
    'komentarz',
    'rodzaj'
]
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


function changeDisplayForChanges(oneClass){
    console.log(oneClass.innerHTML);
     z.setClassName(oneClass.innerHTML);
     z.displayData();
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
function getClassList(form){
    var url = 'postCall';
    form['mode']='classList';
    //console.log('clsasList',form);
    
    sendObj(url,form,function(obj){
        //var json = obj;
        classList=obj;
       filtrEvents();
        //set.saveData(json);
        //console.log('obj',json);
        
    });
    
}
function getPicture(){
    var url = 'postCall';
    var form = {};
    form['mode']='picture';
    sendObj(url,form,function(obj){
        console.log('res picture:',obj)
        
        document.getElementById('personPictureVer').src=obj;
        document.getElementById('personPictureHor').src=obj;
        
        
    })
    
    
}

function requestForChanges(type){
    //console.log('hi');
    var url = 'postCall'
    var form={};
    btnClicked(type);
    form['mode']='getChanges'
    if(type =='today'){
        form['param']='today';
        
    }
    if(type == 'tommorow'){
        form['param']='tommorow';
    }
    //console.log(form);
    
    sendObj(url,form,function(obj){
        var json = obj;
        //set.saveData(json);
        //console.log(obj,json);
        z.data=json['substitution'];
        console.log('data',z.data);
        document.getElementById('forDay').innerHTML = 'Changes for '+json['date'];
        //console.log('acctal changes',json['substitution']);
        if(z.data == 'no substitutions'){
            console.log('ji',z.data);
            z.data=[{"cancelled":[true],"note":["brak zmian"],
                    classes:[z.className]}];
            console.log(z.data);
        }
        z.displayData();
        getClassList(form);
       // console.log(obj);
    });
}





function closeInfo(){
	var infB = document.getElementById('infoBox');
	infB.style.display = 'none';
}
function sendMessage(){
	var url = 'postCall';
	var form = {};
	form['mode']='message';
	var el = document.getElementById('messageArea');
	var infB = document.getElementById('infoBox');
	var infBData = document.getElementById('infoBoxData');
	form['param']=el.value;
	//console.log(el.value);
	sendObj(url,form,function(responeText){
		infB.style.display = 'table';
		infBData.innerHTML=responeText;
	})
	//el.innerHTML='hi';
	
}
function onLoadFunc(){
    //console.log('hi2');
    var url='postCall';
    var form={};
    form['mode']='getSettings';
    sendObj(url,form,function(obj){
    //    console.log(JSON.parse(obj));
        settings1 = obj;
       // console.log('hi',settings1);
        set.saveData(settings1.event);
    set.addChangeClick();
    set.addClicks();
        z.setFields(settings1['fields']);
        z.setClassName(settings1.formValues[0]);
    setValuesToForm(settings1['formValues'])
    getPicture();
        //set.saveData(settings1);
    requestForChanges('today'); 
    });
    
    //console.log(settings1);
}


/* #####################jakieś śmieci#################### */
function sendObj (url,json_obj,callback){
    var http = new XMLHttpRequest();
    //var url = "get_data";
    var string_obj = JSON.stringify(json_obj);
       // console.log(string_obj);
    http.open("POST", url, true);
    http.setRequestHeader("Content-type", "application/json");
    http.onreadystatechange = function() {//Call a function when the state changes.
        if(http.readyState == 4 && http.status == 200) {
            console.log('resText',http.responseText);
            var res=JSON.parse(http.responseText);
            console.log(res);
            if(res['err'] == true){
                //console.log(res.message)
				var resMsg = res.message;
				var msg = '<a class="msgLink" href="/login">' + resMsg + '</a>';
				var msgB = document.getElementById('msgBox');
				var msgBData = document.getElementById('msgBoxData');
				msgB.style.display = 'table';
				msgBData.innerHTML=msg;
            }
            //console.log('resText',res);
            callback(res.params);
        }
        else{console.log(http.status);}
    }
    http.send(string_obj);
}
function filtrEvents(){
	var allClasses = ["1a","1b","1c","1d","2a","2b","2c","2d","3a","3b","3c","3d","1ga","1gb","1gc","1gd","2ga","2gb","2gc","2gd","3ga","3gb","3gc","3gd"];
	for(var i=0; i<allClasses.length; i++){
		var el = document.getElementById(allClasses[i]);
		var new_element = el.cloneNode(true);
		el.parentNode.replaceChild(new_element, el);
		el.className = "className";
	}
	for(var i=0; i<classList.length; i++){
		var el = document.getElementById(classList[i]);
		el.className = "substitution";
        el.addEventListener('click',function(){ changeDisplayForChanges(this)},false);
	}
}
function closeMsg(){
	var msgB = document.getElementById('msgBox');
	msgB.style.display = 'none';
}
function closeInfo(){
	var infB = document.getElementById('infoBox');
	infB.style.display = 'none';

}
function btnClicked(type){
    console.log('hello',type);
    var idList={today:'todayBtn',tommorow:'tommorowBtn'};
    for (k in idList){
        if(k==type){
            document.getElementById(idList[k]).className='btn btnClicked';
        }
        else{ document.getElementById(idList[k]).className='btn';}
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
        var key1 =key[0];
        for(var i=0;i<key1.length;i++){
        var el = document.getElementById(key1[i]);
        //console.log(el);
        el.addEventListener('click',function(){ homePosition(key[1])},false);
        }
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
        console.log('changes for class',this.className);
        this.finalTables="";
        this.getChange();
        this.tableTest();
    }
    this.getChange = function(){
        var string="";
        for(var j=0;j<this.data.length;j++){
            console.log('dataLength',this.data.length);
            var findParam=this.changeContainsClass(this.data[j]);
            if(findParam){
            var oneChangeObj=this.assignParams(this.data[j]);
            this.finalTables+=this.createElement(oneChangeObj);
            //console.log(string);
            //+=string;
            //this.parsedData="";
            }
            //console.log(fi//);
        }
        if(this.finalTables == ""){
            //this.addToArray('brak','zastępstw',0);
            string='nic';
            //
            this.finalTables+=string;
            this.parsedData="";
            //this.finalTables==
        }
    }
    this.changeContainsClass = function(oneChange){
    if(this.className =='all'||this.className==""){
        //console.log('null on change');
        return true;
    };
    var classId=oneChange['classes'];
        for(var i=0;i<classId.length;i++){
            if(this.className == classId[i]){
                //console.log('full on change');
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
    this.newParams=function(key,value,ifchanges){
        if (ifchanges == true){
            
        }
        
    }
    this.assignParams = function(oneChange){
        this.i=0;
        var keyText="";
        //var x = exData;
        var keyValue=""
        var elInChange={};
        for (k in oneChange){
           
    //console.log('hey',k);
    //console.log('hey',this.fields);
            keyText=this.fields[k];
            if(k=='cancelled'){
                keyValue=this.getType(oneChange[k]);
                if(keyText != undefined){
                    elInChange[keyText]=keyValue;
                }
                //this.addToArray(keyText,keyValue,0);
            }
            else if(k =='changes'){
                //do nothing
            }
            else{
                keyValue=oneChange[k];
                //x[keyText] =oneChange[k];
                //console.log(keyText + ' '+keyValue);
                if(keyText != undefined){
                    elInChange[keyText]=keyValue;
                }
                //this.addToArray(keyText,keyValue,0);
            }
        }
        for(j in oneChange['changes']){
            keyText=this.fields[j];
                    //x['z'+keyText] =changesIn[l];
            
            keyValue=oneChange['changes'][j];
            elInChange[keyText]+=' -> '+keyValue;
            
        }
        
        return elInChange;
        //this.createElement(elInChange);
        //console.log('changes ',elInChange);
    }
    this.getType= function(value){
        if(value=='true'){
            //this.style='backBlue'
            return 'anulowanie';
        }
        else{
            //this.style='backRed'
            return 'zastępstwo';
        }
    }
    this.createElement=function(obj){
        if(obj=={}){return "";}
        console.log('onj',obj);
        //if(key==undefined||value==""){return '';};
        //var tabString=this.createTabs(tabs);
        //console.log('tabs',tabs);
        var allLi=""
        for(var i=0;i<patternOfDisplay.length;i++){
            
           if(obj[patternOfDisplay[i]] == undefined ||obj[patternOfDisplay[i]] == ""){    
               //do nothing
           }
            else{
                allLi+=this.createLi(patternOfDisplay[i],obj[patternOfDisplay[i]]); 
            }
        }
        var string = '<ul>'+allLi+'</ul>';
        return string;
    }
    this.createLi=function(name,text){
    return '<li><a>'+name+' </a>'+text+'</li>';   
    }
    
}
