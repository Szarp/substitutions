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
    generateBtn:function(){tokenValidation('generateToken')},
    checkBtn:function(){tokenValidation('checkToken')}
}

function closeMsg(elID){
	var msgArea = document.getElementById('msgArea');
	var toRemove = document.getElementById(elID);
	msgArea.removeChild(toRemove);
}

function copy(elem, msg){
	var succeed = copyToClipboard(elem);
	if(!succeed){
		alert("Copy not supported or blocked. Press Ctrl+c to copy.");
		document.getElementById(msg).innerHTML = "Błąd kopiowania";
	} else {
		document.getElementById(msg).innerHTML = "Skopiowano";
	}
}

function copyToClipboard(elem) {
	  // create hidden text element, if it doesn't already exist
    var targetId = "_hiddenCopyText_";
    var isInput = elem.tagName === "INPUT" || elem.tagName === "TEXTAREA";
    var origSelectionStart, origSelectionEnd;
    if (isInput) {
        // can just use the original source element for the selection and copy
        target = elem;
        origSelectionStart = elem.selectionStart;
        origSelectionEnd = elem.selectionEnd;
    } else {
        // must use a temporary form element for the selection and copy
        target = document.getElementById(targetId);
        if (!target) {
            var target = document.createElement("textarea");
            target.style.position = "absolute";
            target.style.left = "-9999px";
            target.style.top = "0";
            target.id = targetId;
            document.body.appendChild(target);
        }
        target.textContent = elem.textContent;
    }
    // select the content
    var currentFocus = document.activeElement;
    target.focus();
    target.setSelectionRange(0, target.value.length);
    
    // copy the selection
    var succeed;
    try {
    	  succeed = document.execCommand("copy");
    } catch(e) {
        succeed = false;
    }
    // restore original focus
    if (currentFocus && typeof currentFocus.focus === "function") {
        currentFocus.focus();
    }
    
    if (isInput) {
        // restore prior selection
        elem.setSelectionRange(origSelectionStart, origSelectionEnd);
    } else {
        // clear temporary content
        target.textContent = "";
    }
    return succeed;
}

function tokenValidation(mode){
    var url = 'postCall';
    var form = {};
    form['mode']=mode;
    if(mode=='checkToken'){
		var str = document.getElementById('tokenCheck').value;
		form['token']= parseInt(str);
    }
    sendObj(url,form,function(obj){
		if(obj>=00000 && obj<=99999){
			document.getElementById('tknField').innerHTML = obj;
			var insert = document.createElement("div");
			insert.id = "msgTOKEN";
			insert.className = "info";
			insert.innerHTML = '<div id="msgBoxData">Twój token to: <span class="tooltip"><span id="tok">' + obj + '</span><span id="copyTooltip" class="tooltiptext">Kliknij aby skopiować</span></span></div><div class="closeButton" onclick="closeMsg('+"'msgTOKEN'"+')">✖</div>';
			var msgArea = document.getElementById('msgArea');
			msgArea.appendChild(insert);
			document.getElementById("tok").addEventListener("click", function() {
				copy(document.getElementById("tok"), "copyTooltip");
			});;
		} else {
			var insert = document.createElement("div");
			insert.id = "msgTOKEN";
			if(obj != "Dziękujemy. Konto zostało połączone."){
				insert.className = "message";
			} else {
				insert.className = "info";
			}
			insert.innerHTML = '<div id="msgBoxData">' + obj + '</div><div class="closeButton" onclick="closeMsg('+"'msgTOKEN'"+')">✖</div>';
			var msgArea = document.getElementById('msgArea');
			msgArea.appendChild(insert);
		}
    })
}

function setValuesToForm(params){
    var formList=['setClass','setNotification','teacher'];
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
	 z.setTeacherName('no');
     z.displayData();
}
function displayChangesForT(oneTeacher){
	z.setTeacherName(oneTeacher.innerHTML);
	z.setClassName('no');
	z.displayData();
}
function takeValuesFromForm(){
    var form={};
    form['setClass'] = document.getElementById('setClass').value;
    form['notification'] = document.getElementById('setNotification').value;
	if(umode=='user'){ //save teacher if in teacher tab, set none when saving in user tab
		form['teacher'] = document.getElementById('teacher').value;
	} else {
		form['teacher'] = '---';
	}
    var url = 'postCall';
    form['mode'] = 'saveSettings';
    z.setClassName(form.setClass);
    z.displayData();
    sendObj(url,form,function(obj){
        console.log('saveSettings',obj);
    });
}
function getClassList(form){
    var url = 'postCall';
    form['mode']='classList';
    sendObj(url,form,function(obj){
        classList=obj;
       filtrEvents();
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

function getTeachersList(form){
	form['mode'] = 'teachersList';
	sendObj('postCall', form, function(obj){
		filtrTEvents(obj);
	});
}

function fillTeachers(obj){
	var selT = obj.formValues[2];
	sendObj('postCall', {'mode': 'allTeachers'}, function(alltList){
		var elInsert = '<option value="---">---</option>';
		for(var i = 0; i < alltList.length; i++){
			if(alltList[i] != selT){
				elInsert += '<option value="' + alltList[i] + '">' + alltList[i] + '</option>';
			} else {
				elInsert += '<option selected value="' + alltList[i] + '">' + alltList[i] + '</option>';
			}
		}
		document.getElementById("teacher").innerHTML = elInsert;
	});
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
		getTeachersList(form);
       // console.log(obj);
    });
}

function sendMessage(){
	var url = 'postCall';
	var form = {};
	form['mode']='message';
	var el = document.getElementById('messageArea');
	var infB = document.getElementById('infoBox');
	var infBData = document.getElementById('infoBoxData');
	var msg = el.value;
	if(msg.length > 5){
		form['param']=msg;
		sendObj(url,form,function(responseText){
			var insert = document.createElement("div");
				insert.id = "infoMSG";
				insert.className = "info";
				insert.innerHTML = '<div id="msgBoxData">' + responseText + '</div><div class="closeButton" onclick="closeMsg('+"'infoMSG'"+')">✖</div>';
			var msgArea = document.getElementById('msgArea');
			msgArea.appendChild(insert);
			document.getElementById('messageArea').value='';
		})
	} else {
		var insert = document.createElement("div");
			insert.id = "infoMSG";
			insert.className = "message";
			insert.innerHTML = '<div id="msgBoxData">Proszę nie wysyłaj pustych wiadomości.</div><div class="closeButton" onclick="closeMsg('+"'infoMSG'"+')">✖</div>';
		var msgArea = document.getElementById('msgArea');
		msgArea.appendChild(insert);
	}
}
function onLoadFunc(){
	var url='postCall';
	var form={};
	form['mode']='getSettings';
	sendObj(url,form,function(obj){
		settings1 = obj;
		set.saveData(settings1.event);
		set.addChangeClick();
		set.addClicks();
		z.setFields(settings1['fields']);
		z.setClassName(settings1.formValues[0]);
		z.setTeacherName(settings1.formValues[2]);
		setValuesToForm(settings1['formValues'])
		getPicture();
		requestForChanges('today');
		fillTeachers(obj);
		if(settings1.formValues[2] && settings1.formValues[2]!='---'){ //change mode to teacher if teacher selected and saved in db
			changeMode();
			console.error('!!!!!!!!!!!!!!!!!\n',settings1.formValues[2]);
		}
	});
	if('serviceWorker' in navigator){
		navigator.serviceWorker.register('/service-worker.js', {
			scope: './'
		});
	}
	document.getElementById("tokenCheck").addEventListener('keypress', function (e) {
		var key = e.which || e.keyCode;
		if (key === 13) { // 13 is enter
			tokenValidation('checkToken');
		}
	});
	document.getElementById("tBtn").addEventListener('click', changeMode);
}

var umode = 'teacher';
function changeMode(){
	if(umode == 'teacher'){
		//change mode to 'teacher'
		document.getElementById("teacher_select").style.display = "";
		document.getElementById("tBtn").classList.add('sel');
		document.getElementById("uBtn").classList.remove('sel');
		document.getElementById("uBtn").addEventListener('click', changeMode);
		document.getElementById("tBtn").removeEventListener('click', changeMode);
		document.getElementById("noClass").disabled = false;
		document.getElementById("noClass").style.display = "";
		umode = 'user';
	} else {
		//switch back to user mode
		document.getElementById("teacher_select").style.display = "none";
		document.getElementById("uBtn").classList.add('sel');
		document.getElementById("tBtn").classList.remove('sel');
		document.getElementById("tBtn").addEventListener('click', changeMode);
		document.getElementById("uBtn").removeEventListener('click', changeMode);
		document.getElementById("noClass").disabled = true;
		document.getElementById("noClass").style.display = "none";
		if(document.getElementById("setClass").value == 'no'){
			document.getElementById("setClass").value = 'all';
		}
		umode = 'teacher';
	}
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
				var insert = document.createElement("div");
					insert.id = "msgLOGIN";
					insert.className = "message";
					insert.innerHTML = '<div id="msgBoxData"><a class="msgLink" href="/login">' + resMsg + '</a></div><div class="closeButton" onclick="closeMsg('+"'msgLOGIN'"+')">✖</div>';
				var msgArea = document.getElementById('msgArea');
				msgArea.appendChild(insert);
            }
            //console.log('resText',res);
            callback(res.params);
        }
        else{console.log(http.status);}
    }
    http.send(string_obj);
}
function filtrEvents(){
	var allClasses = ["1a","1b","1c","1d","1e","1f","2a","2b","2c","2d","3a","3b","3c","3d","2ga","2gb","2gc","2gd","3ga","3gb","3gc","3gd"];
	for(var i=0; i<allClasses.length; i++){
		var el = document.getElementById(allClasses[i]);
		var new_element = el.cloneNode(true);
		el.parentNode.replaceChild(new_element, el);
	}
	for(var i=0; i<allClasses.length; i++){
		var el = document.getElementById(allClasses[i]);
		el.className = "className";
	}
	for(var i=0; i<classList.length; i++){
		var el = document.getElementById(classList[i]);
		el.className = "substitution";
        el.addEventListener('click',function(){ changeDisplayForChanges(this)},false);
	}
}
function filtrTEvents(teachersList){
	var elInsert = "Nauczyciele: ";
	for(var i = 0; i < teachersList.length; i++){
		elInsert += '<div class="substitution" id="' + teachersList[i] + '">' + teachersList[i] + '</div> ';
	}
	document.getElementById("forTeachers").innerHTML = elInsert;
	for(var i = 0; i < teachersList.length; i++){
		el = document.getElementById(teachersList[i]);
		el.addEventListener('click', function(){displayChangesForT(this)}, false);
	}
	document.getElementById("forTeachers").style.display = '';
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
	this.teacherName="";
    this.setClassName=function(className){
        this.className= className;
    }
    //this.className=null;
    //fieldsToFill.call(this);
    this.setFields = function(fields){
        this.fields=fields;
        
    }
	this.setTeacherName=function(teacherName){
		this.teacherName = teacherName;
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
			var findTeacher=this.changeContainsTeacher(this.data[j]);
            if(findParam || findTeacher){
				var oneChangeObj=this.assignParams(this.data[j]);
				this.finalTables+=this.createElement(oneChangeObj);
            }
        }
        if(this.finalTables == ""){
            string='nic';
            this.finalTables+=string;
            this.parsedData="";
        }
    }
	this.changeContainsTeacher = function(oneChange){
		if(this.teacherName == oneChange['teachers']){
			return true;
		}
		if(oneChange.changes && oneChange.changes.teachers){
			if(this.teacherName == oneChange.changes.teachers){
				return true;
			}
		}
		return false;
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
