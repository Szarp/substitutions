//some Users Module
var //facebook = require('./facebookComunication.js'),
	setTime = require('./setTime.js'),
	mongo = require('./mongoFunctions.js');



var doc ={ _id: '0000', token: 'token', settings: '', name: '' }
var time = new setTime();

var pageSettings = {
    fields:{
        cancelled:'typ',
        note:'komentarz',
        periods:'lekcja',
        subjects:'przedmiot',
        teachers:'nauczyciel',
        classes:'klasa',
        classrooms:'sala',
        groupnames:'grupa',
        changes:'zmiany',
        //brak:'brak',
        substitution_types:'rodzaj'
    },
    event:{
        changeDisplayEvents :{
            'home':[['navbar_home','navbar_homeD'],'homePage'],
            'substitution':[['navbar_substitution','navbar_substitutionD'],'substitutionList'],
            'about':[['navbar_photo','navbar_photoD'],'about1'],
            'settings':[['navbar_settings','navbar_settingsD'],'settingsMenu']
            
        }
    },
    events:['homePage','substitutionList','settingsMenu','about1'],
    formValues:['all','no']
    
}
    
    //var reqCookie=req.cookies.cookieName;
    //var userId=cookie.findIfSessionExist(reqCookie);
function postCall(userId,body,callback){

    var res='';
    //console.log('Mode: '+req.body['mode']);
    //var body=req.body;
    
        if(body.mode=='getSettings'){
            //console.log(id);
            //mongo.findById(userId,'person',function(err,doc){
              //  if (err){console.log('prolem with settings: ',userId)};
                //console.log('Settings file: ',doc);
                var params = (doc['settings']);
                if(params == ''){params={setClass:'all',notification:'no'}}
                var table=[];
                table[0]=params.setClass;
                table[1]=params.notification;
                pageSettings['formValues']=table;
                res = pageSettings; 
                setImmediate(function() {
                    callback(res);
                });
                //console.log('response Settings',res);
            //})        
        }
        else if(body.mode=='getChanges'){
                //console.log('response Changes')
            if(body['param']=='today'){
                time.todayIs();
            }
            else{
                time.tommorowIs();
            }
            console.log('requested date: ',time.displayTime());
            //mongo.findById(time.displayTime(),'substitutions',function(err,obj){
                //console.log(err,obj);
              //  if(err){console.log('err in sending substitutions')}
            console.log(obj);
               var objToSend={};
                objToSend['substitution']=obj['substitution'];
                if(obj['date'] == undefined){obj['date']='31-12-2016'}
                objToSend['date']=obj['date'];
                res = objToSend;
                setImmediate(function() {
                    callback(res);
                });
            //});
        }         
        else if(body.mode=='classList'){
                //console.log('response Changes')
            if(body['param']=='today'){
                time.todayIs();
            }
            else{
                time.tommorowIs();
            }
            //console.log('requested date: ',time.displayTime());
            //mongo.findById(time.displayTime(),'substitutions',function(err,obj){
                //console.log(err,obj);
              //  if(err){console.log('err in sending substitutions')}
                res = obj['userList'];
                setImmediate(function() {
                    callback(res);
                });
            //});
        }        
        else if(body.mode=='message'){
            /*
            mongo.save(['messages',{id:userId,message:body.param,time:new Date()}],function(){
                res = 'thanks for your message, we will read it soon';
                setImmediate(function() {
                    callback(res);
                });
            }); */
			res = "Dziękujemy za wiadomość";
			callback(res);
        }
        else if(body.mode=='saveSettings'){
            if(userId!="0000"){
                console.log('saving chnges to: '+userId);
                var form={};
                form['setClass'] = body.setClass;
                form['notification'] = body.notification;
                 mongo.modifyById(userId,'person',{settings:form},function(){
                    res = 'ok';
                    setImmediate(function() {
                        callback(res);
                    });

                 })
            }
            else{
                res = 'ok';
                setImmediate(function() {
                        callback(res);
                });
            }
        }
        else{
            res = 'err'
            setImmediate(function() {
                callback(res);
            });
        };
        //console.log('hi',res);

    
}
var obj = {"substitution":[{"cancelled":[true],"note":[""],"substitution_types":[""],"type":["card"],"periods":["2"],"subjects":["geografia"],"teachers":["Ogrocka"],"classes":["3gc"],"classrooms":["36"],"groupnames":[""],"periodorbreak":["01P"],"moje":[false]},{"cancelled":[false],"substitution_types":["płatne"],"note":[""],"changes":{"teachers":["Pilch"],"subjects":["język angielski 6"]},"type":["card"],"periods":["5"],"subjects":["geografia6"],"teachers":["Ogrocka"],"classes":["2a","2c","2d"],"classrooms":["36"],"groupnames":["seminargroup:4"],"periodorbreak":["04P"],"moje":[false]},{"cancelled":[true],"note":[""],"substitution_types":[""],"type":["card"],"periods":["6"],"subjects":["geografia6"],"teachers":["Ogrocka"],"classes":["3a","3b","3c","3d"],"classrooms":["36"],"groupnames":["seminargroup:3"],"periodorbreak":["05P"],"moje":[false]},{"cancelled":[true],"note":[""],"substitution_types":[""],"type":["card"],"periods":["7"],"subjects":["geografia6"],"teachers":["Ogrocka"],"classes":["3a","3b","3c","3d"],"classrooms":["36"],"groupnames":["seminargroup:3"],"periodorbreak":["06P"],"moje":[false]},{"cancelled":[true],"note":[""],"substitution_types":[""],"type":["card"],"periods":["7"],"subjects":["polski"],"teachers":["Wojtaś"],"classes":["2b"],"classrooms":["22"],"groupnames":[""],"periodorbreak":["06P"],"moje":[false]},{"cancelled":[false],"substitution_types":["płatne"],"note":[""],"changes":{"teachers":["Głodny Szymon"]},"type":["card"],"periods":["4"],"subjects":["wf"],"teachers":["Mazur Iza"],"classes":["3c"],"classrooms":["0gim"],"groupnames":["Chłopcy"],"periodorbreak":["03P"],"moje":[false]},{"cancelled":[false],"substitution_types":["płatne"],"note":[""],"changes":{"teachers":["Drohojowski"],"subjects":["matematyka"],"classrooms":["4"]},"type":["card"],"periods":["5"],"subjects":["historia"],"teachers":["Ogrocka"],"classes":["1a"],"classrooms":["36"],"groupnames":[""],"periodorbreak":["04P"],"moje":[false]},{"cancelled":[false],"substitution_types":["płatne"],"note":[""],"changes":{"teachers":["Głodny Szymon"]},"type":["card"],"periods":["5"],"subjects":["wf"],"teachers":["Mazur Iza"],"classes":["2a"],"classrooms":["0gim"],"groupnames":["Dziewczęta"],"periodorbreak":["04P"],"moje":[false]},{"cancelled":[false],"substitution_types":["przesunięcie do sali"],"note":[""],"changes":{"classrooms":["23"]},"type":["card"],"periods":["5"],"subjects":["matematyka"],"teachers":["Jałowiecki"],"classes":["2gb"],"classrooms":["28"],"groupnames":[""],"periodorbreak":["04P"],"moje":[false]},{"cancelled":[false],"substitution_types":["przesunięcie do sali"],"note":[""],"changes":{"classrooms":["7"]},"type":["card"],"periods":["5"],"subjects":["francuski"],"teachers":["Darmoń"],"classes":["2gc"],"classrooms":["19"],"groupnames":["1. Grupa"],"periodorbreak":["04P"],"moje":[false]},{"cancelled":[false],"substitution_types":["przesunięcie do sali"],"note":[""],"changes":{"classrooms":["32"]},"type":["card"],"periods":["5"],"subjects":["wos 6"],"teachers":["Fic"],"classes":["3a","3b","3c","3d"],"classrooms":["27"],"groupnames":["seminargroup:6"],"periodorbreak":["04P"],"moje":[false]},{"cancelled":[false],"substitution_types":["przesunięcie do sali"],"note":[""],"changes":{"classrooms":["16"]},"type":["card"],"periods":["2"],"subjects":["sih 3"],"teachers":["Glombik"],"classes":["2a","2d"],"classrooms":["36"],"groupnames":["seminargroup:3"],"periodorbreak":["01P"],"moje":[false]},{"cancelled":[false],"substitution_types":["przesunięcie do sali"],"note":[""],"changes":{"classrooms":["13"]},"type":["card"],"periods":["5"],"subjects":["chemia 4"],"teachers":["Adam"],"classes":["3a","3b","3c","3d"],"classrooms":["40"],"groupnames":["seminargroup:5"],"periodorbreak":["04P"],"moje":[false]},{"cancelled":[false],"substitution_types":["przesunięcie do sali"],"note":[""],"changes":{"classrooms":["2"]},"type":["card"],"periods":["5"],"subjects":["fizyka 1"],"teachers":["Rabsztyn"],"classes":["3a","3b","3c","3d"],"classrooms":["46"],"groupnames":["seminargroup:4"],"periodorbreak":["04P"],"moje":[false]},{"cancelled":[false],"substitution_types":["płatne"],"note":[""],"changes":{"teachers":["Wiencierz"]},"type":["card"],"periods":["6"],"subjects":["matematyka"],"teachers":["Cwołek"],"classes":["1a"],"classrooms":["40"],"groupnames":[""],"periodorbreak":["05P"],"moje":[false]},{"cancelled":[false],"substitution_types":["za I B"],"note":[""],"changes":{"teachers":["Stachyra"],"subjects":["polski"],"classrooms":["23"]},"type":["card"],"periods":["6"],"subjects":["geografia"],"teachers":["Ogrocka"],"classes":["2gd"],"classrooms":["36"],"groupnames":[""],"periodorbreak":["05P"],"moje":[false]},{"cancelled":[false],"substitution_types":["za III GA"],"note":[""],"changes":{"teachers":["Rabsztyn"],"subjects":["biofizyka 4"],"classrooms":["46"]},"type":["card"],"periods":["6"],"subjects":["biologia 4"],"teachers":["Błaszczykowska"],"classes":["3a","3b","3c","3d"],"classrooms":["13"],"groupnames":["seminargroup:3"],"periodorbreak":["05P"],"moje":[false]},{"cancelled":[true],"note":[""],"substitution_types":[""],"type":["card"],"periods":["7"],"subjects":["geografia6"],"teachers":["Ogrocka"],"classes":["2a","2c","2d"],"classrooms":["36"],"groupnames":["seminargroup:4"],"periodorbreak":["06P"],"moje":[false]},{"cancelled":[true],"note":[""],"substitution_types":[""],"type":["card"],"periods":["8"],"subjects":["geografia6"],"teachers":["Ogrocka"],"classes":["2a","2c","2d"],"classrooms":["36"],"groupnames":["seminargroup:4"],"periodorbreak":["07P"],"moje":[false]},{"cancelled":[true],"note":[""],"substitution_types":[""],"type":["card"],"periods":["8"],"subjects":["wf"],"teachers":["Mazur Iza"],"classes":["2gd"],"classrooms":["0gim"],"groupnames":["Dziewczęta"],"periodorbreak":["07P"],"moje":[false]},{"cancelled":[true],"note":[""],"substitution_types":[""],"type":["card"],"periods":["8"],"subjects":["przyroda 5"],"teachers":["Błaszczykowska"],"classes":["3a","3b","3c","3d"],"classrooms":["13"],"groupnames":["seminargroup:3"],"periodorbreak":["07P"],"moje":[false]},{"cancelled":[true],"note":[""],"substitution_types":[""],"type":["card"],"periods":["8"],"subjects":["g.wych"],"teachers":["Sazanów Lucyna"],"classes":["3gc"],"classrooms":["46"],"groupnames":[""],"periodorbreak":["07P"],"moje":[false]},{"cancelled":[false],"substitution_types":["przesunięcie do sali"],"note":[""],"changes":{"classrooms":["50"]},"type":["card"],"periods":["2"],"subjects":["angielski"],"teachers":["Kruszelnicka"],"classes":["2gc"],"classrooms":["46"],"groupnames":["2. Grupa"],"periodorbreak":["01P"],"moje":[false]},{"cancelled":[true],"note":[""],"substitution_types":[""],"type":["card"],"periods":["9"],"subjects":["wf"],"teachers":["Mazur Iza"],"classes":["2gd"],"classrooms":["0gim"],"groupnames":["Dziewczęta"],"periodorbreak":["08P"],"moje":[false]},{"cancelled":[true],"substitution_types":[""],"type":["card"],"periods":["5"],"subjects":["biologia"],"teachers":["Antonowicz"],"classes":["3ga"],"classrooms":["13"],"periodorbreak":["04P"],"moje":[false]},{"cancelled":[true],"substitution_types":[""],"type":["card"],"periods":["2"],"subjects":["historia"],"teachers":["Fic"],"classes":["3ga"],"classrooms":["27"],"periodorbreak":["01P"],"moje":[false]},{"cancelled":[true],"substitution_types":[""],"type":["card"],"periods":["4"],"subjects":["niemiecki"],"teachers":["Niezgoda"],"classes":["3ga"],"classrooms":["49"],"periodorbreak":["03P"],"moje":[false]},{"cancelled":[true],"substitution_types":[""],"type":["card"],"periods":["3"],"subjects":["polski"],"teachers":["Żmuda Paweł"],"classes":["3ga"],"classrooms":["22"],"periodorbreak":["02P"],"moje":[false]},{"cancelled":[true],"substitution_types":[""],"type":["card"],"periods":["4"],"subjects":["edukacja bezp"],"teachers":["Grabka"],"classes":["3ga"],"classrooms":["9"],"periodorbreak":["03P"],"moje":[false]},{"cancelled":[true],"substitution_types":[""],"type":["card"],"periods":["3"],"subjects":["angielski"],"teachers":["Lee"],"classes":["3gb"],"classrooms":["17"],"periodorbreak":["02P"],"moje":[false]},{"cancelled":[true],"substitution_types":[""],"type":["card"],"periods":["2"],"subjects":["angielski"],"teachers":["Lee"],"classes":["3gb"],"classrooms":["17"],"periodorbreak":["01P"],"moje":[false]},{"cancelled":[true],"substitution_types":[""],"type":["card"],"periods":["3"],"subjects":["angielski"],"teachers":["Nowak"],"classes":["3gb"],"classrooms":["16"],"periodorbreak":["02P"],"moje":[false]},{"cancelled":[true],"substitution_types":[""],"type":["card"],"periods":["4"],"subjects":["chemia"],"teachers":["Marian Aleksandra"],"classes":["3gb"],"classrooms":["42"],"periodorbreak":["03P"],"moje":[false]},{"cancelled":[false],"substitution_types":["przesunięcie do sali"],"note":[""],"changes":{"classrooms":["21"]},"type":["card"],"periods":["2"],"subjects":["francuski"],"teachers":["Darmoń"],"classes":["3c"],"classrooms":["19"],"groupnames":["2. Grupa"],"periodorbreak":["01P"],"moje":[false]},{"cancelled":[true],"substitution_types":[""],"type":["card"],"periods":["2"],"subjects":["angielski"],"teachers":["Nowak"],"classes":["3gb"],"classrooms":["16"],"periodorbreak":["01P"],"moje":[false]},{"cancelled":[true],"substitution_types":[""],"type":["card"],"periods":["5"],"subjects":["matematyka"],"teachers":["Cwołek"],"classes":["3gb"],"classrooms":["4"],"periodorbreak":["04P"],"moje":[false]},{"cancelled":[true],"substitution_types":[""],"type":["card"],"periods":["5"],"subjects":["matematyka"],"teachers":["Przystajko"],"classes":["3gc"],"classrooms":["2"],"periodorbreak":["04P"],"moje":[false]},{"cancelled":[true],"substitution_types":[""],"type":["card"],"periods":["2"],"subjects":["francuski"],"teachers":["Pordzik"],"classes":["3gc"],"classrooms":["50"],"periodorbreak":["01P"],"moje":[false]},{"cancelled":[true],"substitution_types":[""],"type":["card"],"periods":["3"],"subjects":["chemia"],"teachers":["Marian Aleksandra"],"classes":["3gc"],"classrooms":["42"],"periodorbreak":["02P"],"moje":[false]},{"cancelled":[true],"substitution_types":[""],"type":["card"],"periods":["4"],"subjects":["polski"],"teachers":["Pindur"],"classes":["3gc"],"classrooms":["21"],"periodorbreak":["03P"],"moje":[false]},{"cancelled":[true],"substitution_types":[""],"type":["card"],"periods":["5"],"subjects":["niemiecki"],"teachers":["Zajdel"],"classes":["3gd"],"classrooms":["32"],"periodorbreak":["04P"],"moje":[false]},{"cancelled":[true],"substitution_types":[""],"type":["card"],"periods":["4"],"subjects":["niemiecki"],"teachers":["Zajdel"],"classes":["3gd"],"classrooms":["32"],"periodorbreak":["03P"],"moje":[false]},{"cancelled":[true],"substitution_types":[""],"type":["card"],"periods":["2"],"subjects":["matematyka"],"teachers":["Drohojowski"],"classes":["3gd"],"classrooms":["4"],"periodorbreak":["01P"],"moje":[false]},{"cancelled":[true],"substitution_types":[""],"type":["card"],"periods":["4"],"subjects":["niemiecki"],"teachers":["Kaczmar"],"classes":["3gd"],"classrooms":["7"],"periodorbreak":["03P"],"moje":[false]},{"cancelled":[false],"substitution_types":["przesunięcie do sali"],"note":[""],"changes":{"classrooms":["22"]},"type":["card"],"periods":["3"],"subjects":["historia"],"teachers":["Fic"],"classes":["1c"],"classrooms":["27"],"groupnames":[""],"periodorbreak":["02P"],"moje":[false]},{"cancelled":[true],"substitution_types":[""],"type":["card"],"periods":["3"],"subjects":["geografia"],"teachers":["Ogrocka"],"classes":["3gd"],"classrooms":["36"],"periodorbreak":["02P"],"moje":[false]},{"cancelled":[true],"substitution_types":[""],"type":["card"],"periods":["5"],"subjects":["niemiecki"],"teachers":["Kaczmar"],"classes":["3gd"],"classrooms":["7"],"periodorbreak":["04P"],"moje":[false]},{"cancelled":[true],"substitution_types":[""],"type":["card"],"periods":["2"],"subjects":["wf"],"teachers":["Głodny Szymon"],"classes":["1b"],"classrooms":["0gim"],"periodorbreak":["01P"],"moje":[false]},{"cancelled":[true],"substitution_types":[""],"type":["card"],"periods":["1"],"subjects":["wf"],"teachers":["Mazur Iza"],"classes":["1b"],"classrooms":["0gim"],"periodorbreak":["00P"],"moje":[false]},{"cancelled":[true],"substitution_types":[""],"type":["card"],"periods":["2"],"subjects":["wf"],"teachers":["Mazur Iza"],"classes":["1b"],"classrooms":["0gim"],"periodorbreak":["01P"],"moje":[false]},{"cancelled":[true],"substitution_types":[""],"type":["card"],"periods":["5"],"subjects":["polski"],"teachers":["Stachyra"],"classes":["1b"],"classrooms":["23"],"periodorbreak":["04P"],"moje":[false]},{"cancelled":[true],"substitution_types":[""],"type":["card"],"periods":["6"],"subjects":["polski"],"teachers":["Stachyra"],"classes":["1b"],"classrooms":["23"],"periodorbreak":["05P"],"moje":[false]},{"cancelled":[false],"changes":{},"type":["card"],"periods":["8"],"subjects":["włoski"],"teachers":["Darmoń"],"classes":["1a","1b","1c","1d"],"classrooms":["19"],"periodorbreak":["07P"],"moje":[false]},{"cancelled":[true],"substitution_types":[""],"type":["card"],"periods":["4"],"subjects":["przedsiębiorczość"],"teachers":["Budzyńska"],"classes":["1b"],"classrooms":["44"],"periodorbreak":["03P"],"moje":[false]},{"cancelled":[true],"substitution_types":[""],"type":["card"],"periods":["3"],"subjects":["geografia"],"teachers":["Małańczuk Agnieszka"],"classes":["1b"],"classrooms":["4"],"periodorbreak":["02P"],"moje":[false]},{"cancelled":[false],"substitution_types":["przesunięcie do sali"],"note":[""],"changes":{"classrooms":["17"]},"type":["card"],"periods":["3"],"subjects":["francuski"],"teachers":["Darmoń"],"classes":["1gc"],"classrooms":["19"],"groupnames":["2. Grupa"],"periodorbreak":["02P"],"moje":[false]},{"cancelled":[true],"substitution_types":[""],"type":["card"],"periods":["7"],"subjects":["biologia"],"teachers":["Błaszczykowska"],"classes":["1b"],"classrooms":["13"],"periodorbreak":["06P"],"moje":[false]},{"cancelled":[true],"substitution_types":[""],"type":["card"],"periods":["8"],"subjects":["matematyka"],"teachers":["Cwołek"],"classes":["3ga"],"classrooms":["4"],"periodorbreak":["07P"],"moje":[false]},{"cancelled":[true],"substitution_types":[""],"type":["card"],"periods":["7"],"subjects":["matematyka"],"teachers":["Cwołek"],"classes":["3ga"],"classrooms":["2"],"periodorbreak":["06P"],"moje":[false]},{"cancelled":[true],"substitution_types":[""],"type":["card"],"periods":["6"],"subjects":["fizyka"],"teachers":["Rabsztyn"],"classes":["3ga"],"classrooms":["46"],"periodorbreak":["05P"],"moje":[false]},{"cancelled":[false],"substitution_types":["przesunięcie do sali"],"note":[""],"changes":{"classrooms":["42"]},"type":["card"],"periods":["3"],"subjects":["biofizyka 3"],"teachers":["Rabsztyn"],"classes":["2a","2d"],"classrooms":["46"],"groupnames":["seminargroup:5"],"periodorbreak":["02P"],"moje":[false]},{"cancelled":[false],"substitution_types":["przesunięcie do sali"],"note":[""],"changes":{"classrooms":["4"]},"type":["card"],"periods":["3"],"subjects":["chemia"],"teachers":["Adam"],"classes":["2gc"],"classrooms":["40"],"groupnames":[""],"periodorbreak":["02P"],"moje":[false]},{"cancelled":[false],"substitution_types":["płatne"],"note":[""],"changes":{"teachers":["Głodny Szymon"]},"type":["card"],"periods":["3"],"subjects":["wf"],"teachers":["Mazur Iza"],"classes":["3c"],"classrooms":["0gim"],"groupnames":["Chłopcy"],"periodorbreak":["02P"],"moje":[false]}],"userList":["3gc","2a","2c","2d","3a","3b","3c","3d","2b","1a","2gb","2gc","2gd","3ga","3gb","3gd","1c","1b","1d","1gc"]}

exports.postCall = postCall;
//exports.redirect = redirect;