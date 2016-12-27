var settings1 = {};
//var settings2={};
var set=new traslateSettings();
var z = new translateChanges();
var clssList=[];


var patternOfDisplay = [
    'typ',
    'klasa',
    'grupa',
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

function filtrEvents(){
	classList.sort();
    var allElemnts='';
    var begin ='<a>';
    var end = '</a>';
    var idBegin='classFiltr_';
    for(var i=0;i<classList.length;i++){
            allElemnts+='<div id="'+idBegin+i+'">'+classList[i]+'</div>';
            allElemnts+='  ';
    }
    document.getElementById('forClasses').innerHTML='<a>Klasy:</a>' +allElemnts;
    for(var i=0;i<classList.length;i++){
        var el = document.getElementById(idBegin+i)
        el.addEventListener('click',function(){ changeDisplayForChanges(this)},false);
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
    console.log('clsasList',form);
    
    sendObj(url,form,function(obj){
        var json = JSON.parse(obj);
        classList=json;
       filtrEvents();
        //set.saveData(json);
        console.log('obj',json);
        /*
        z.data=json;
        if(obj =='"no substitutions"'){
            console.log('ji');
            z.data=[{"cancelled":[true],"note":["brak zmian"],
                    classes:[z.className]}];
            console.log(z.data);
        }
        z.displayData();
        */
        //classList(form);
       // console.log(obj);
        //document.getElementById('forDay').innerHTML = 'Changes for '+type;
    });
    
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
    document.getElementById('forDay').innerHTML = 'Changes for '+type;
    sendObj(url,form,function(obj){
        var json = JSON.parse(obj);
        //set.saveData(json);
        //console.log(obj,json);
        z.data=json;
        if(obj =='"no substitutions"'){
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
    //console.log('hi2');
    var url='postCall';
    var form={};
    form['mode']='getSettings';
    sendObj(url,form,function(obj){
    //    console.log(JSON.parse(obj));
        settings1 = JSON.parse(obj);
       // console.log('hi',settings1);
        set.saveData(settings1.event);
    set.addChangeClick();
    set.addClicks();
        z.setFields(settings1['fields']);
        z.setClassName(settings1.formValues[0]);
    setValuesToForm(settings1['formValues'])
        //set.saveData(settings1);
    //requestForChanges('today'); 
    });
    
    //console.log(settings1);
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
var elList=[{type:'cancelled'},'note',]

var field = {"fields":{"cancelled":"typ","note":"komentarz","periods":"lekcja","subjects":"przedmiot","teachers":"nauczyciel","classes":"klasa","classrooms":"sala","groupnames":"grupa","changes":"zmiany","substitution_types":"rodzaj"},"event":{"changeDisplayEvents":{"home":[["navbar_home","navbar_homeD"],"homePage"],"substitution":[["navbar_substitution","navbar_substitutionD"],"substitutionList"],"about":[["navbar_photo","navbar_photoD"],"about1"],"settings":[["navbar_settings","navbar_settingsD"],"settingsMenu"]}},"events":["homePage","substitutionList","settingsMenu","about1"],"formValues":["all","no"]}
var data = [
    {"cancelled":[true],"note":[""],"substitution_types":[""],"type":["card"],"periods":["2"],"subjects":["geografia"],"teachers":["Ogrocka"],"classes":["3gc"],"classrooms":["36"],"groupnames":[""],"periodorbreak":["01P"],"moje":[false]},
    {"cancelled":[false],"substitution_types":["płatne"],"note":[""],"changes":
     {"teachers":["Pilch"],"subjects":["język angielski 6"]},"type":["card"],"periods":["5"],"subjects":["geografia6"],"teachers":["Ogrocka"],"classes":["2a","2c","2d"],"classrooms":["36"],"groupnames":["seminargroup:4"],"periodorbreak":["04P"],"moje":[false]},{"cancelled":[true],"note":[""],"substitution_types":[""],"type":["card"],"periods":["6"],"subjects":["geografia6"],"teachers":["Ogrocka"],"classes":["3a","3b","3c","3d"],"classrooms":["36"],"groupnames":["seminargroup:3"],"periodorbreak":["05P"],"moje":[false]},{"cancelled":[true],"note":[""],"substitution_types":[""],"type":["card"],"periods":["7"],"subjects":["geografia6"],"teachers":["Ogrocka"],"classes":["3a","3b","3c","3d"],"classrooms":["36"],"groupnames":["seminargroup:3"],"periodorbreak":["06P"],"moje":[false]},
            {"cancelled":[true],"note":[""],"substitution_types":[""],"type":["card"],"periods":["7"],"subjects":["polski"],"teachers":["Wojtaś"],"classes":["2b"],"classrooms":["22"],"groupnames":[""],"periodorbreak":["06P"],"moje":[false]},{"cancelled":[false],"substitution_types":["płatne"],"note":[""],"changes":{"teachers":["Głodny Szymon"]},"type":["card"],"periods":["4"],"subjects":["wf"],"teachers":["Mazur Iza"],"classes":["3c"],"classrooms":["0gim"],"groupnames":["Chłopcy"],"periodorbreak":["03P"],"moje":[false]},{"cancelled":[false],"substitution_types":["płatne"],"note":[""],"changes":{"teachers":["Drohojowski"],"subjects":["matematyka"],"classrooms":["4"]},"type":["card"],"periods":["5"],"subjects":["historia"],"teachers":["Ogrocka"],"classes":["1a"],"classrooms":["36"],"groupnames":[""],"periodorbreak":["04P"],"moje":[false]},{"cancelled":[false],"substitution_types":["płatne"],"note":[""],"changes":{"teachers":["Głodny Szymon"]},"type":["card"],"periods":["5"],"subjects":["wf"],"teachers":["Mazur Iza"],"classes":["2a"],"classrooms":["0gim"],"groupnames":["Dziewczęta"],"periodorbreak":["04P"],"moje":[false]},{"cancelled":[false],"substitution_types":["przesunięcie do sali"],"note":[""],"changes":{"classrooms":["23"]},"type":["card"],"periods":["5"],"subjects":["matematyka"],"teachers":["Jałowiecki"],"classes":["2gb"],"classrooms":["28"],"groupnames":[""],"periodorbreak":["04P"],"moje":[false]},{"cancelled":[false],"substitution_types":["przesunięcie do sali"],"note":[""],"changes":{"classrooms":["7"]},"type":["card"],"periods":["5"],"subjects":["francuski"],"teachers":["Darmoń"],"classes":["2gc"],"classrooms":["19"],"groupnames":["1. Grupa"],"periodorbreak":["04P"],"moje":[false]},{"cancelled":[false],"substitution_types":["przesunięcie do sali"],"note":[""],"changes":{"classrooms":["32"]},"type":["card"],"periods":["5"],"subjects":["wos 6"],"teachers":["Fic"],"classes":["3a","3b","3c","3d"],"classrooms":["27"],"groupnames":["seminargroup:6"],"periodorbreak":["04P"],"moje":[false]},{"cancelled":[false],"substitution_types":["przesunięcie do sali"],"note":[""],"changes":{"classrooms":["16"]},"type":["card"],"periods":["2"],"subjects":["sih 3"],"teachers":["Glombik"],"classes":["2a","2d"],"classrooms":["36"],"groupnames":["seminargroup:3"],"periodorbreak":["01P"],"moje":[false]},{"cancelled":[false],"substitution_types":["przesunięcie do sali"],"note":[""],"changes":{"classrooms":["13"]},"type":["card"],"periods":["5"],"subjects":["chemia 4"],"teachers":["Adam"],"classes":["3a","3b","3c","3d"],"classrooms":["40"],"groupnames":["seminargroup:5"],"periodorbreak":["04P"],"moje":[false]},{"cancelled":[false],"substitution_types":["przesunięcie do sali"],"note":[""],"changes":{"classrooms":["2"]},"type":["card"],"periods":["5"],"subjects":["fizyka 1"],"teachers":["Rabsztyn"],"classes":["3a","3b","3c","3d"],"classrooms":["46"],"groupnames":["seminargroup:4"],"periodorbreak":["04P"],"moje":[false]},{"cancelled":[false],"substitution_types":["płatne"],"note":[""],"changes":{"teachers":["Wiencierz"]},"type":["card"],"periods":["6"],"subjects":["matematyka"],"teachers":["Cwołek"],"classes":["1a"],"classrooms":["40"],"groupnames":[""],"periodorbreak":["05P"],"moje":[false]},{"cancelled":[false],"substitution_types":["za I B"],"note":[""],"changes":{"teachers":["Stachyra"],"subjects":["polski"],"classrooms":["23"]},"type":["card"],"periods":["6"],"subjects":["geografia"],"teachers":["Ogrocka"],"classes":["2gd"],"classrooms":["36"],"groupnames":[""],"periodorbreak":["05P"],"moje":[false]},{"cancelled":[false],"substitution_types":["za III GA"],"note":[""],"changes":{"teachers":["Rabsztyn"],"subjects":["biofizyka 4"],"classrooms":["46"]},"type":["card"],"periods":["6"],"subjects":["biologia 4"],"teachers":["Błaszczykowska"],"classes":["3a","3b","3c","3d"],"classrooms":["13"],"groupnames":["seminargroup:3"],"periodorbreak":["05P"],"moje":[false]},{"cancelled":[true],"note":[""],"substitution_types":[""],"type":["card"],"periods":["7"],"subjects":["geografia6"],"teachers":["Ogrocka"],"classes":["2a","2c","2d"],"classrooms":["36"],"groupnames":["seminargroup:4"],"periodorbreak":["06P"],"moje":[false]},{"cancelled":[true],"note":[""],"substitution_types":[""],"type":["card"],"periods":["8"],"subjects":["geografia6"],"teachers":["Ogrocka"],"classes":["2a","2c","2d"],"classrooms":["36"],"groupnames":["seminargroup:4"],"periodorbreak":["07P"],"moje":[false]},{"cancelled":[true],"note":[""],"substitution_types":[""],"type":["card"],"periods":["8"],"subjects":["wf"],"teachers":["Mazur Iza"],"classes":["2gd"],"classrooms":["0gim"],"groupnames":["Dziewczęta"],"periodorbreak":["07P"],"moje":[false]},{"cancelled":[true],"note":[""],"substitution_types":[""],"type":["card"],"periods":["8"],"subjects":["przyroda 5"],"teachers":["Błaszczykowska"],"classes":["3a","3b","3c","3d"],"classrooms":["13"],"groupnames":["seminargroup:3"],"periodorbreak":["07P"],"moje":[false]},{"cancelled":[true],"note":[""],"substitution_types":[""],"type":["card"],"periods":["8"],"subjects":["g.wych"],"teachers":["Sazanów Lucyna"],"classes":["3gc"],"classrooms":["46"],"groupnames":[""],"periodorbreak":["07P"],"moje":[false]},{"cancelled":[false],"substitution_types":["przesunięcie do sali"],"note":[""],"changes":{"classrooms":["50"]},"type":["card"],"periods":["2"],"subjects":["angielski"],"teachers":["Kruszelnicka"],"classes":["2gc"],"classrooms":["46"],"groupnames":["2. Grupa"],"periodorbreak":["01P"],"moje":[false]},{"cancelled":[true],"note":[""],"substitution_types":[""],"type":["card"],"periods":["9"],"subjects":["wf"],"teachers":["Mazur Iza"],"classes":["2gd"],"classrooms":["0gim"],"groupnames":["Dziewczęta"],"periodorbreak":["08P"],"moje":[false]},{"cancelled":[true],"substitution_types":[""],"type":["card"],"periods":["5"],"subjects":["biologia"],"teachers":["Antonowicz"],"classes":["3ga"],"classrooms":["13"],"periodorbreak":["04P"],"moje":[false]},{"cancelled":[true],"substitution_types":[""],"type":["card"],"periods":["2"],"subjects":["historia"],"teachers":["Fic"],"classes":["3ga"],"classrooms":["27"],"periodorbreak":["01P"],"moje":[false]},{"cancelled":[true],"substitution_types":[""],"type":["card"],"periods":["4"],"subjects":["niemiecki"],"teachers":["Niezgoda"],"classes":["3ga"],"classrooms":["49"],"periodorbreak":["03P"],"moje":[false]},{"cancelled":[true],"substitution_types":[""],"type":["card"],"periods":["3"],"subjects":["polski"],"teachers":["Żmuda Paweł"],"classes":["3ga"],"classrooms":["22"],"periodorbreak":["02P"],"moje":[false]},{"cancelled":[true],"substitution_types":[""],"type":["card"],"periods":["4"],"subjects":["edukacja bezp"],"teachers":["Grabka"],"classes":["3ga"],"classrooms":["9"],"periodorbreak":["03P"],"moje":[false]},{"cancelled":[true],"substitution_types":[""],"type":["card"],"periods":["3"],"subjects":["angielski"],"teachers":["Lee"],"classes":["3gb"],"classrooms":["17"],"periodorbreak":["02P"],"moje":[false]},{"cancelled":[true],"substitution_types":[""],"type":["card"],"periods":["2"],"subjects":["angielski"],"teachers":["Lee"],"classes":["3gb"],"classrooms":["17"],"periodorbreak":["01P"],"moje":[false]},{"cancelled":[true],"substitution_types":[""],"type":["card"],"periods":["3"],"subjects":["angielski"],"teachers":["Nowak"],"classes":["3gb"],"classrooms":["16"],"periodorbreak":["02P"],"moje":[false]},{"cancelled":[true],"substitution_types":[""],"type":["card"],"periods":["4"],"subjects":["chemia"],"teachers":["Marian Aleksandra"],"classes":["3gb"],"classrooms":["42"],"periodorbreak":["03P"],"moje":[false]},{"cancelled":[false],"substitution_types":["przesunięcie do sali"],"note":[""],"changes":{"classrooms":["21"]},"type":["card"],"periods":["2"],"subjects":["francuski"],"teachers":["Darmoń"],"classes":["3c"],"classrooms":["19"],"groupnames":["2. Grupa"],"periodorbreak":["01P"],"moje":[false]},{"cancelled":[true],"substitution_types":[""],"type":["card"],"periods":["2"],"subjects":["angielski"],"teachers":["Nowak"],"classes":["3gb"],"classrooms":["16"],"periodorbreak":["01P"],"moje":[false]},{"cancelled":[true],"substitution_types":[""],"type":["card"],"periods":["5"],"subjects":["matematyka"],"teachers":["Cwołek"],"classes":["3gb"],"classrooms":["4"],"periodorbreak":["04P"],"moje":[false]},{"cancelled":[true],"substitution_types":[""],"type":["card"],"periods":["5"],"subjects":["matematyka"],"teachers":["Przystajko"],"classes":["3gc"],"classrooms":["2"],"periodorbreak":["04P"],"moje":[false]},{"cancelled":[true],"substitution_types":[""],"type":["card"],"periods":["2"],"subjects":["francuski"],"teachers":["Pordzik"],"classes":["3gc"],"classrooms":["50"],"periodorbreak":["01P"],"moje":[false]},{"cancelled":[true],"substitution_types":[""],"type":["card"],"periods":["3"],"subjects":["chemia"],"teachers":["Marian Aleksandra"],"classes":["3gc"],"classrooms":["42"],"periodorbreak":["02P"],"moje":[false]},{"cancelled":[true],"substitution_types":[""],"type":["card"],"periods":["4"],"subjects":["polski"],"teachers":["Pindur"],"classes":["3gc"],"classrooms":["21"],"periodorbreak":["03P"],"moje":[false]},{"cancelled":[true],"substitution_types":[""],"type":["card"],"periods":["5"],"subjects":["niemiecki"],"teachers":["Zajdel"],"classes":["3gd"],"classrooms":["32"],"periodorbreak":["04P"],"moje":[false]},{"cancelled":[true],"substitution_types":[""],"type":["card"],"periods":["4"],"subjects":["niemiecki"],"teachers":["Zajdel"],"classes":["3gd"],"classrooms":["32"],"periodorbreak":["03P"],"moje":[false]},{"cancelled":[true],"substitution_types":[""],"type":["card"],"periods":["2"],"subjects":["matematyka"],"teachers":["Drohojowski"],"classes":["3gd"],"classrooms":["4"],"periodorbreak":["01P"],"moje":[false]},{"cancelled":[true],"substitution_types":[""],"type":["card"],"periods":["4"],"subjects":["niemiecki"],"teachers":["Kaczmar"],"classes":["3gd"],"classrooms":["7"],"periodorbreak":["03P"],"moje":[false]},{"cancelled":[false],"substitution_types":["przesunięcie do sali"],"note":[""],"changes":{"classrooms":["22"]},"type":["card"],"periods":["3"],"subjects":["historia"],"teachers":["Fic"],"classes":["1c"],"classrooms":["27"],"groupnames":[""],"periodorbreak":["02P"],"moje":[false]},{"cancelled":[true],"substitution_types":[""],"type":["card"],"periods":["3"],"subjects":["geografia"],"teachers":["Ogrocka"],"classes":["3gd"],"classrooms":["36"],"periodorbreak":["02P"],"moje":[false]},{"cancelled":[true],"substitution_types":[""],"type":["card"],"periods":["5"],"subjects":["niemiecki"],"teachers":["Kaczmar"],"classes":["3gd"],"classrooms":["7"],"periodorbreak":["04P"],"moje":[false]},{"cancelled":[true],"substitution_types":[""],"type":["card"],"periods":["2"],"subjects":["wf"],"teachers":["Głodny Szymon"],"classes":["1b"],"classrooms":["0gim"],"periodorbreak":["01P"],"moje":[false]},{"cancelled":[true],"substitution_types":[""],"type":["card"],"periods":["1"],"subjects":["wf"],"teachers":["Mazur Iza"],"classes":["1b"],"classrooms":["0gim"],"periodorbreak":["00P"],"moje":[false]},{"cancelled":[true],"substitution_types":[""],"type":["card"],"periods":["2"],"subjects":["wf"],"teachers":["Mazur Iza"],"classes":["1b"],"classrooms":["0gim"],"periodorbreak":["01P"],"moje":[false]},{"cancelled":[true],"substitution_types":[""],"type":["card"],"periods":["5"],"subjects":["polski"],"teachers":["Stachyra"],"classes":["1b"],"classrooms":["23"],"periodorbreak":["04P"],"moje":[false]},{"cancelled":[true],"substitution_types":[""],"type":["card"],"periods":["6"],"subjects":["polski"],"teachers":["Stachyra"],"classes":["1b"],"classrooms":["23"],"periodorbreak":["05P"],"moje":[false]},{"cancelled":[false],"changes":{},"type":["card"],"periods":["8"],"subjects":["włoski"],"teachers":["Darmoń"],"classes":["1a","1b","1c","1d"],"classrooms":["19"],"periodorbreak":["07P"],"moje":[false]},{"cancelled":[true],"substitution_types":[""],"type":["card"],"periods":["4"],"subjects":["przedsiębiorczość"],"teachers":["Budzyńska"],"classes":["1b"],"classrooms":["44"],"periodorbreak":["03P"],"moje":[false]},{"cancelled":[true],"substitution_types":[""],"type":["card"],"periods":["3"],"subjects":["geografia"],"teachers":["Małańczuk Agnieszka"],"classes":["1b"],"classrooms":["4"],"periodorbreak":["02P"],"moje":[false]},{"cancelled":[false],"substitution_types":["przesunięcie do sali"],"note":[""],"changes":{"classrooms":["17"]},"type":["card"],"periods":["3"],"subjects":["francuski"],"teachers":["Darmoń"],"classes":["1gc"],"classrooms":["19"],"groupnames":["2. Grupa"],"periodorbreak":["02P"],"moje":[false]},{"cancelled":[true],"substitution_types":[""],"type":["card"],"periods":["7"],"subjects":["biologia"],"teachers":["Błaszczykowska"],"classes":["1b"],"classrooms":["13"],"periodorbreak":["06P"],"moje":[false]},{"cancelled":[true],"substitution_types":[""],"type":["card"],"periods":["8"],"subjects":["matematyka"],"teachers":["Cwołek"],"classes":["3ga"],"classrooms":["4"],"periodorbreak":["07P"],"moje":[false]},{"cancelled":[true],"substitution_types":[""],"type":["card"],"periods":["7"],"subjects":["matematyka"],"teachers":["Cwołek"],"classes":["3ga"],"classrooms":["2"],"periodorbreak":["06P"],"moje":[false]},{"cancelled":[true],"substitution_types":[""],"type":["card"],"periods":["6"],"subjects":["fizyka"],"teachers":["Rabsztyn"],"classes":["3ga"],"classrooms":["46"],"periodorbreak":["05P"],"moje":[false]},{"cancelled":[false],"substitution_types":["przesunięcie do sali"],"note":[""],"changes":{"classrooms":["42"]},"type":["card"],"periods":["3"],"subjects":["biofizyka 3"],"teachers":["Rabsztyn"],"classes":["2a","2d"],"classrooms":["46"],"groupnames":["seminargroup:5"],"periodorbreak":["02P"],"moje":[false]},{"cancelled":[false],"substitution_types":["przesunięcie do sali"],"note":[""],"changes":{"classrooms":["4"]},"type":["card"],"periods":["3"],"subjects":["chemia"],"teachers":["Adam"],"classes":["2gc"],"classrooms":["40"],"groupnames":[""],"periodorbreak":["02P"],"moje":[false]},{"cancelled":[false],"substitution_types":["płatne"],"note":[""],"changes":{"teachers":["Głodny Szymon"]},"type":["card"],"periods":["3"],"subjects":["wf"],"teachers":["Mazur Iza"],"classes":["3c"],"classrooms":["0gim"],"groupnames":["Chłopcy"],"periodorbreak":["02P"],"moje":[false]}]