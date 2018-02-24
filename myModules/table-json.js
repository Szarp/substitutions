var readline=require('readline'),
    fs = require('fs'),
    HtmlTableToJson = require('html-table-to-json');
const testFolder = '/Users/bartek/gitrepo/bin/CE/ftp/';
var iconv = require('iconv-lite');
// Method 2 - no encoding provided, decoding buffer, faster
var input = fs.readFileSync(testFolder+"Zeszyt2.html");
var output = iconv.decode(input, "ISO-8859-2").replace(/(\r\n|\n|\r)/gm,"");
//console.log(output.);
//fs.writeFileSync('conv2.html', output);
var beg=output.indexOf("<TABLE ");
var end=output.indexOf("</TABLE>");
//console.log("end index",output.indexOf("</TABLE>"))
function readFile(path){
    var self=this;
    this.path=path
    this.date;
    this.file=function(path){
        return fs.readFileSync(path);
    }
    this.convert=function(readFile){
        //delate new lines charakters
        return iconv.decode(readFile, "ISO-8859-2").replace(/(\r\n|\n|\r)/gm,"");
    }
    this.findTableElem=function(file){
        var beg=file.indexOf("<TABLE ");
        var end=file.indexOf("</TABLE>");
        return file.slice(beg,end+8);
    }
    this.convertTable=function(tableString){
        
    }
    this.splitByEmptyLine=function(jsonTable){
        var newTab=[];
        var begin=1;
        //console.log(tab[0]);
        for(k in tab){
            self.date=tab[k]["1"];
            if(tab[k]["1"]===""){
                newTab[newTab.length]=tab.slice(begin,k);
                begin=k;
                begin++;
                //console.log("ok");
            }
        }
        return(newTab);
    }
    this.makeReadable=function(tab){
        var objList=[];
        var changes=[];
        var teacher=tab[0]["1"];
        var pat=tab[1]
        for(k in tab){
            if(k==0 || k==1){}
                //teacher=tab[k]["1"];
            else{
                var obj={}
                for(l in tab[k]){
                    //console.log(pat[l]);
                    obj[pat[l]]=tab[k][l];
                }
                tab[k]=obj;
                //console.log(obj);
                tab[k]["teacher"]=teacher;
            }
        }
        return tab.slice(2);
    }
}
function CEChanges(){
    this.file
    
    
}



output=output.slice(beg,end+8);
//get information time from file
//const fs = require('fs'); 
const jsonTables = new HtmlTableToJson(output);
var tab = jsonTables['results'][0];
var x= splitTable(tab);

x=x.map(function(el){
    return prepare(el);
});
console.log(x);
//console.log("new table",splitTable(tab));

/*tablica nie jest podzielona na poszczegolne zastepstawa ale jest wstawiona pusta linia między nie
w tym celu szukam komorki {"1":"","2":"","3":"","4":""} a następnie grupuję
przykład znajuduje się poniżej
*/
function splitTable(tab){
    var newTab=[];
    var begin=1;
    console.log(tab[0]);
    for(k in tab){
        //console.log(tab[k]);
        if(tab[k]["1"]===""){
            newTab[newTab.length]=tab.slice(begin,k);
            begin=k;
            begin++;
            //console.log("ok");
        }
    }
    return(newTab);
    
}
var x=[{'1': 'Joanna Ustupska-Kubeczek'},
    { '1': 'lekcja', '2': 'opis', '3': 'zastępca', '4': 'uwagi' },
    { '1': '5',
      '2': '2 GB(1) - 22',
      '3': 'K. Stępniak',
      '4': 'złączenie grup' },
    { '1': '6',
      '2': '2 GB(1) - 22',
      '3': 'K. Stępniak',
      '4': 'złączenie grup' },
    { '1': '7',
      '2': 'J angielski 2La 2Ls - 22',
      '3': 'K. Stępniak',
      '4': 'złączenie grup' },
    { '1': '8',
      '2': 'J angielski 2La 2Ls - 22',
      '3': 'K. Stępniak',
      '4': 'złączenie grup' }]
function prepare(tab){
    var objList=[];
    var changes=[];
    var teacher=tab[0]["1"];
    var pat=tab[1]
    for(k in tab){
        if(k==0 || k==1){}
            //teacher=tab[k]["1"];
        else{
            var obj={}
            for(l in tab[k]){
                //console.log(pat[l]);
                obj[pat[l]]=tab[k][l];
                
            }
            tab[k]=obj;
            //console.log(obj);
            tab[k]["teacher"]=teacher;
            
            
        }
    //console.log(tab[k]);
        
        
    }
    return tab.slice(2);
}
prepare(x);


fs.stat(testFolder+"Zeszyt2.html",function(e,s){
    //console.log("e",e);
    //console.log("s",s);
    
})
fs.readFile(testFolder+"Zeszyt2.html",'latin1',function(e,r){
    //console.log("e",e);
      //console.log("s",r);
})
//console.log(fs.readFileSync(testFolder+"Zeszyt2.html","latin1").normalize('NFD'))
var dict = {"á":"a", "á":"a", "ç":"c"}

//console.log(fs.readFileSync(testFolder+"Zeszyt2.html","latin1"))
//delate all \n from file
var removeEnter=function(destination,callback){
    var tab=''
    var index1=0;
    var file = readline.createInterface({
        input: fs.createReadStream(testFolder+destination)
    });
    file.on('line',function(line){
        tab+=line;
    })
    file.on('close', function (line) {
            //console.log(tab);
            setImmediate(function() {
                callback(tab);
            });
    });
}
//string to convert  table to json
const html='<TABLE BORDER=0 BORDERCOLOR=black CELLSPACING=0 CELLPADDING=2 style="border-collapse: collapse"><TR><TD class=st0  COLSPAN=4 ALIGN=LEFT><NOBR>Zastępstwa w dniu 19.01.2018 piątek</NOBR></TD></TR><TR><TD NOWRAP class=st1  COLSPAN=4 ALIGN=LEFT>Agnieszka Bobrowska</TD></TR><TR><TD NOWRAP class=st4  ALIGN=LEFT>lekcja</TD><TD NOWRAP class=st5  ALIGN=LEFT>opis</TD><TD NOWRAP class=st5  ALIGN=LEFT>zastępca</TD><TD NOWRAP class=st6  ALIGN=LEFT>uwagi   </TD></TR><TR><TD NOWRAP class=st7  ALIGN=LEFT>4</TD><TD NOWRAP class=st8  ALIGN=LEFT>3 Tb(2) - 118</TD><TD NOWRAP class=st8  ALIGN=LEFT>D. Stankowski</TD><TD NOWRAP class=st9  ALIGN=LEFT>złączenie grup</TD></TR><TR><TD NOWRAP class=st10  ALIGN=LEFT>5</TD><TD NOWRAP class=st11  ALIGN=LEFT>3 Tb(2) - 118</TD><TD NOWRAP class=st11  ALIGN=LEFT>D. Stankowski</TD><TD NOWRAP class=st12  ALIGN=LEFT>złączenie grup</TD></TR><TR><TD NOWRAP class=st10  ALIGN=LEFT>7</TD><TD NOWRAP class=st11  ALIGN=LEFT>4 Ta - Uczniowie zwolnieni do domu</TD><TD NOWRAP class=st11  ALIGN=LEFT>&nbsp;</TD><TD NOWRAP class=st12  ALIGN=LEFT>&nbsp;</TD></TR><TR><TD NOWRAP class=st4  ALIGN=LEFT>8</TD><TD NOWRAP class=st13  ALIGN=LEFT>4 Ta - Uczniowie zwolnieni do domu</TD><TD NOWRAP class=st13  ALIGN=LEFT>&nbsp;</TD><TD NOWRAP class=st14  ALIGN=LEFT>&nbsp;</TD></TR><TR><TD NOWRAP class=st15  ALIGN=LEFT>&nbsp;</TD><TD NOWRAP class=st15  ALIGN=LEFT>&nbsp;</TD><TD NOWRAP class=st15  ALIGN=LEFT>&nbsp;</TD><TD NOWRAP class=st15  ALIGN=LEFT>&nbsp;</TD></TR><TR><TD NOWRAP class=st1  COLSPAN=4 ALIGN=LEFT>Renata Korus</TD></TR><TR><TD NOWRAP class=st4  ALIGN=LEFT>lekcja</TD><TD NOWRAP class=st5  ALIGN=LEFT>opis</TD><TD NOWRAP class=st5  ALIGN=LEFT>zastępca</TD><TD NOWRAP class=st6  ALIGN=LEFT>uwagi   </TD></TR><TR><TD NOWRAP class=st7  ALIGN=LEFT>5</TD><TD NOWRAP class=st8  ALIGN=LEFT>3 La - 3</TD><TD NOWRAP class=st8  ALIGN=LEFT>J. Leszczyńska</TD><TD NOWRAP class=st9  ALIGN=LEFT>&nbsp;</TD></TR><TR><TD NOWRAP class=st10  ALIGN=LEFT>6</TD><TD NOWRAP class=st11  ALIGN=LEFT>3 La - 3</TD><TD NOWRAP class=st11  ALIGN=LEFT>J. Leszczyńska</TD><TD NOWRAP class=st12  ALIGN=LEFT>&nbsp;</TD></TR><TR><TD NOWRAP class=st4  ALIGN=LEFT>7</TD><TD NOWRAP class=st13  ALIGN=LEFT>3 Ta - 3</TD><TD NOWRAP class=st13  ALIGN=LEFT>J. Leszczyńska</TD><TD NOWRAP class=st14  ALIGN=LEFT>&nbsp;</TD></TR><TR><TD NOWRAP class=st15  ALIGN=LEFT>&nbsp;</TD><TD NOWRAP class=st15  ALIGN=LEFT>&nbsp;</TD><TD NOWRAP class=st15  ALIGN=LEFT>&nbsp;</TD><TD NOWRAP class=st15  ALIGN=LEFT>&nbsp;</TD></TR><TR><TD NOWRAP class=st1  COLSPAN=4 ALIGN=LEFT>Bogusława Korzus</TD></TR><TR><TD NOWRAP class=st4  ALIGN=LEFT>lekcja</TD><TD NOWRAP class=st5  ALIGN=LEFT>opis</TD><TD NOWRAP class=st5  ALIGN=LEFT>zastępca</TD><TD NOWRAP class=st6  ALIGN=LEFT>uwagi   </TD></TR><TR><TD NOWRAP class=st7  ALIGN=LEFT>6</TD><TD NOWRAP class=st8  ALIGN=LEFT>3 GB - 314</TD><TD NOWRAP class=st8  ALIGN=LEFT>M. Świetlik</TD><TD NOWRAP class=st9  ALIGN=LEFT>&nbsp;</TD></TR><TR><TD NOWRAP class=st10  ALIGN=LEFT>7</TD><TD NOWRAP class=st11  ALIGN=LEFT>3 GA - Uczniowie zwolnieni do domu</TD><TD NOWRAP class=st11  ALIGN=LEFT>&nbsp;</TD><TD NOWRAP class=st12  ALIGN=LEFT>&nbsp;</TD></TR><TR><TD NOWRAP class=st4  ALIGN=LEFT>8</TD><TD NOWRAP class=st13  ALIGN=LEFT>3 GA - Uczniowie zwolnieni do domu</TD><TD NOWRAP class=st13  ALIGN=LEFT>&nbsp;</TD><TD NOWRAP class=st14  ALIGN=LEFT>&nbsp;</TD></TR><TR><TD NOWRAP class=st15  ALIGN=LEFT>&nbsp;</TD><TD NOWRAP class=st15  ALIGN=LEFT>&nbsp;</TD><TD NOWRAP class=st15  ALIGN=LEFT>&nbsp;</TD><TD NOWRAP class=st15  ALIGN=LEFT>&nbsp;</TD></TR><TR><TD NOWRAP class=st1  COLSPAN=4 ALIGN=LEFT>Agnieszka Małańczuk</TD></TR><TR><TD NOWRAP class=st4  ALIGN=LEFT>lekcja</TD><TD NOWRAP class=st5  ALIGN=LEFT>opis</TD><TD NOWRAP class=st5  ALIGN=LEFT>zastępca</TD><TD NOWRAP class=st6  ALIGN=LEFT>uwagi   </TD></TR><TR><TD NOWRAP class=st7  ALIGN=LEFT>3</TD><TD NOWRAP class=st8  ALIGN=LEFT>2 GA - 311</TD><TD NOWRAP class=st8  ALIGN=LEFT>J. Małnowicz</TD><TD NOWRAP class=st9  ALIGN=LEFT>&nbsp;</TD></TR><TR><TD NOWRAP class=st10  ALIGN=LEFT>4</TD><TD NOWRAP class=st11  ALIGN=LEFT>3 GA - 311</TD><TD NOWRAP class=st11  ALIGN=LEFT>K. Stępniak</TD><TD NOWRAP class=st12  ALIGN=LEFT>&nbsp;</TD></TR><TR><TD NOWRAP class=st10  ALIGN=LEFT>5</TD><TD NOWRAP class=st11  ALIGN=LEFT>2 Li - Uczniowie zwolnieni do domu</TD><TD NOWRAP class=st11  ALIGN=LEFT>&nbsp;</TD><TD NOWRAP class=st12  ALIGN=LEFT>&nbsp;</TD></TR><TR><TD NOWRAP class=st4  ALIGN=LEFT>6</TD><TD NOWRAP class=st13  ALIGN=LEFT>2 Li - Uczniowie zwolnieni do domu</TD><TD NOWRAP class=st13  ALIGN=LEFT>&nbsp;</TD><TD NOWRAP class=st14  ALIGN=LEFT>&nbsp;</TD></TR><TR><TD NOWRAP class=st15  ALIGN=LEFT>&nbsp;</TD><TD NOWRAP class=st15  ALIGN=LEFT>&nbsp;</TD><TD NOWRAP class=st15  ALIGN=LEFT>&nbsp;</TD><TD NOWRAP class=st15  ALIGN=LEFT>&nbsp;</TD></TR><TR><TD NOWRAP class=st1  COLSPAN=4 ALIGN=LEFT>Magdalena Popczyk</TD></TR><TR><TD NOWRAP class=st4  ALIGN=LEFT>lekcja</TD><TD NOWRAP class=st5  ALIGN=LEFT>opis</TD><TD NOWRAP class=st5  ALIGN=LEFT>zastępca</TD><TD NOWRAP class=st6  ALIGN=LEFT>uwagi   </TD></TR><TR><TD NOWRAP class=st7  ALIGN=LEFT>1</TD><TD NOWRAP class=st8  ALIGN=LEFT>2 GB - Uczniowie przychodzą później</TD><TD NOWRAP class=st8  ALIGN=LEFT>&nbsp;</TD><TD NOWRAP class=st9  ALIGN=LEFT>&nbsp;</TD></TR><TR><TD NOWRAP class=st10  ALIGN=LEFT>2</TD><TD NOWRAP class=st11  ALIGN=LEFT>1 Ls - Uczniowie przychodzą później</TD><TD NOWRAP class=st11  ALIGN=LEFT>&nbsp;</TD><TD NOWRAP class=st12  ALIGN=LEFT>&nbsp;</TD></TR><TR><TD NOWRAP class=st10  ALIGN=LEFT>4</TD><TD NOWRAP class=st11  ALIGN=LEFT>1 Ta - 21</TD><TD NOWRAP class=st11  ALIGN=LEFT>K. Kurczyna</TD><TD NOWRAP class=st12  ALIGN=LEFT>&nbsp;</TD></TR><TR><TD NOWRAP class=st10  ALIGN=LEFT>5</TD><TD NOWRAP class=st11  ALIGN=LEFT>3 GA - 21</TD><TD NOWRAP class=st11  ALIGN=LEFT>W. Przybyła</TD><TD NOWRAP class=st12  ALIGN=LEFT>&nbsp;</TD></TR><TR><TD NOWRAP class=st10  ALIGN=LEFT>6</TD><TD NOWRAP class=st11  ALIGN=LEFT>3 GA - Uczniowie zwolnieni do domu</TD><TD NOWRAP class=st11  ALIGN=LEFT>&nbsp;</TD><TD NOWRAP class=st12  ALIGN=LEFT>&nbsp;</TD></TR><TR><TD NOWRAP class=st4  ALIGN=LEFT>7</TD><TD NOWRAP class=st13  ALIGN=LEFT>3 GB - 21</TD><TD NOWRAP class=st13  ALIGN=LEFT>M. Świetlik</TD><TD NOWRAP class=st14  ALIGN=LEFT>&nbsp;</TD></TR><TR><TD NOWRAP class=st15  ALIGN=LEFT>&nbsp;</TD><TD NOWRAP class=st15  ALIGN=LEFT>&nbsp;</TD><TD NOWRAP class=st15  ALIGN=LEFT>&nbsp;</TD><TD NOWRAP class=st15  ALIGN=LEFT>&nbsp;</TD></TR><TR><TD NOWRAP class=st1  COLSPAN=4 ALIGN=LEFT>Joanna Ustupska-Kubeczek</TD></TR><TR><TD NOWRAP class=st4  ALIGN=LEFT>lekcja</TD><TD NOWRAP class=st5  ALIGN=LEFT>opis</TD><TD NOWRAP class=st5  ALIGN=LEFT>zastępca</TD><TD NOWRAP class=st6  ALIGN=LEFT>uwagi   </TD></TR><TR><TD NOWRAP class=st7  ALIGN=LEFT>5</TD><TD NOWRAP class=st8  ALIGN=LEFT>2 GB(1) - 22</TD><TD NOWRAP class=st8  ALIGN=LEFT>K. Stępniak</TD><TD NOWRAP class=st9  ALIGN=LEFT>złączenie grup</TD></TR><TR><TD NOWRAP class=st10  ALIGN=LEFT>6</TD><TD NOWRAP class=st11  ALIGN=LEFT>2 GB(1) - 22</TD><TD NOWRAP class=st11  ALIGN=LEFT>K. Stępniak</TD><TD NOWRAP class=st12  ALIGN=LEFT>złączenie grup</TD></TR><TR><TD NOWRAP class=st10  ALIGN=LEFT>7</TD><TD NOWRAP class=st11  ALIGN=LEFT>J angielski 2La 2Ls - 22</TD><TD NOWRAP class=st11  ALIGN=LEFT>K. Stępniak</TD><TD NOWRAP class=st12  ALIGN=LEFT>złączenie grup</TD></TR><TR><TD NOWRAP class=st4  ALIGN=LEFT>8</TD><TD NOWRAP class=st13  ALIGN=LEFT>J angielski 2La 2Ls - 22</TD><TD NOWRAP class=st13  ALIGN=LEFT>K. Stępniak</TD><TD NOWRAP class=st14  ALIGN=LEFT>złączenie grup</TD></TR><TR><TD NOWRAP class=st15  ALIGN=LEFT>&nbsp;</TD><TD NOWRAP class=st15  ALIGN=LEFT>&nbsp;</TD><TD NOWRAP class=st15  ALIGN=LEFT>&nbsp;</TD><TD NOWRAP class=st15  ALIGN=LEFT>&nbsp;</TD></TR><TR><TD NOWRAP class=st1  COLSPAN=4 ALIGN=LEFT>Małgorzata Załęska-Michniak</TD></TR><TR><TD NOWRAP class=st4  ALIGN=LEFT>lekcja</TD><TD NOWRAP class=st5  ALIGN=LEFT>opis</TD><TD NOWRAP class=st5  ALIGN=LEFT>zastępca</TD><TD NOWRAP class=st6  ALIGN=LEFT>uwagi   </TD></TR><TR><TD NOWRAP class=st7  ALIGN=LEFT>2</TD><TD NOWRAP class=st8  ALIGN=LEFT>2 Lb(1) - Uczniowie przychodzą później</TD><TD NOWRAP class=st8  ALIGN=LEFT>&nbsp;</TD><TD NOWRAP class=st9  ALIGN=LEFT>&nbsp;</TD></TR><TR><TD NOWRAP class=st10  ALIGN=LEFT>3</TD><TD NOWRAP class=st11  ALIGN=LEFT>2 Lb(1) - Uczniowie przychodzą później</TD><TD NOWRAP class=st11  ALIGN=LEFT>&nbsp;</TD><TD NOWRAP class=st12  ALIGN=LEFT>&nbsp;</TD></TR><TR><TD NOWRAP class=st10  ALIGN=LEFT>4</TD><TD NOWRAP class=st11  ALIGN=LEFT>1 Tb(1) - 3</TD><TD NOWRAP class=st11  ALIGN=LEFT>E. Skrodzka</TD><TD NOWRAP class=st12  ALIGN=LEFT>złączenie grup</TD></TR><TR><TD NOWRAP class=st10  ALIGN=LEFT>5</TD><TD NOWRAP class=st11  ALIGN=LEFT>1 Lb(1) - 305</TD><TD NOWRAP class=st11  ALIGN=LEFT>E. Skrodzka</TD><TD NOWRAP class=st12  ALIGN=LEFT>złączenie grup</TD></TR><TR><TD NOWRAP class=st4  ALIGN=LEFT>6</TD><TD NOWRAP class=st13  ALIGN=LEFT>1 Lb(1) - 305</TD><TD NOWRAP class=st13  ALIGN=LEFT>E. Skrodzka</TD><TD NOWRAP class=st14  ALIGN=LEFT>złączenie grup</TD></TR><TR><TD NOWRAP class=st15  ALIGN=LEFT>&nbsp;</TD><TD NOWRAP class=st15  ALIGN=LEFT>&nbsp;</TD><TD NOWRAP class=st15  ALIGN=LEFT>&nbsp;</TD><TD NOWRAP class=st15  ALIGN=LEFT>&nbsp;</TD></TR><TR><TD NOWRAP class=st1  COLSPAN=4 ALIGN=LEFT>Joanna Żurek-Gałka</TD></TR><TR><TD NOWRAP class=st4  ALIGN=LEFT>lekcja</TD><TD NOWRAP class=st5  ALIGN=LEFT>opis</TD><TD NOWRAP class=st5  ALIGN=LEFT>zastępca</TD><TD NOWRAP class=st6  ALIGN=LEFT>uwagi   </TD></TR><TR><TD NOWRAP class=st7  ALIGN=LEFT>1</TD><TD NOWRAP class=st8  ALIGN=LEFT>2 La - Uczniowie przychodzą później</TD><TD NOWRAP class=st8  ALIGN=LEFT>&nbsp;</TD><TD NOWRAP class=st9  ALIGN=LEFT>&nbsp;</TD></TR><TR><TD NOWRAP class=st10  ALIGN=LEFT>2</TD><TD NOWRAP class=st11  ALIGN=LEFT>3 GA - Uczniowie przychodzą później</TD><TD NOWRAP class=st11  ALIGN=LEFT>&nbsp;</TD><TD NOWRAP class=st12  ALIGN=LEFT>&nbsp;</TD></TR><TR><TD NOWRAP class=st10  ALIGN=LEFT>4</TD><TD NOWRAP class=st11  ALIGN=LEFT>2 Ta - 403</TD><TD NOWRAP class=st11  ALIGN=LEFT>J. Pytlik</TD><TD NOWRAP class=st12  ALIGN=LEFT>&nbsp;</TD></TR><TR><TD NOWRAP class=st10  ALIGN=LEFT>5</TD><TD NOWRAP class=st11  ALIGN=LEFT>3 GB - 403</TD><TD NOWRAP class=st11  ALIGN=LEFT>E. Dworska</TD><TD NOWRAP class=st12  ALIGN=LEFT>złączenie grup</TD></TR><TR><TD NOWRAP class=st10  ALIGN=LEFT>6</TD><TD NOWRAP class=st11  ALIGN=LEFT>2 GA - Uczniowie zwolnieni do domu</TD><TD NOWRAP class=st11  ALIGN=LEFT>&nbsp;</TD><TD NOWRAP class=st12  ALIGN=LEFT>&nbsp;</TD></TR><TR><TD NOWRAP class=st4  ALIGN=LEFT>7</TD><TD NOWRAP class=st13  ALIGN=LEFT>1 Lb - Uczniowie zwolnieni do domu</TD><TD NOWRAP class=st13  ALIGN=LEFT>&nbsp;</TD><TD NOWRAP class=st14  ALIGN=LEFT>&nbsp;</TD></TR></TABLE>'


//co zwraca htmlToJson
/*
[{"1":"Zastępstwa w dniu 19.01.2018 piątek"},{"1":"Agnieszka Bobrowska"},{"1":"lekcja","2":"opis","3":"zastępca","4":"uwagi"},{"1":"4 ","2":"3 Tb(2) - 118","3":"D. Stankowski","4":"złączenie grup"},{"1":"5","2":"3 Tb(2) - 118","3":"D. Stankowski","4":"złączenie grup"},{"1":"7","2":"4 Ta - Uczniowie zwolnieni do domu","3":"","4":""},{"1":"8","2":"4 Ta - Uczniowie zwolnieni do domu","3":"","4":""},{"1":"","2":"","3":"","4":""},{"1":"Renata Korus"},{"1":"lekcja","2":"opis","3":"zastępca","4":"uwagi"},{"1":"5","2":"3 La - 3","3":"J. Leszczyńska","4":""},{"1":"6","2":"3 La - 3","3":"J. Leszczyńska","4":""},{"1":"7","2":"3 Ta - 3","3":"J. Leszczyńska","4":""},{"1":"","2":"","3":"","4":""},{"1":"Bogusława Korzus"},{"1":"lekcja","2":"opis","3":"zastępca","4":"uwagi"},{"1":"6","2":"3 GB - 314","3":"M. Świetlik","4":""},{"1":"7","2":"3 GA - Uczniowie zwolnieni do domu","3":"","4":""},{"1":"8","2":"3 GA - Uczniowie zwolnieni do domu","3":"","4":""},{"1":"","2":"","3":"","4":""},{"1":"Agnieszka Małańczuk"},{"1":"lekcja","2":"opis","3":"zastępca","4":"uwagi"},{"1":"3","2":"2 GA - 311","3":"J. Małnowicz","4":""},{"1":"4","2":"3 GA - 311","3":"K. Stępniak","4":""},{"1":"5","2":"2 Li - Uczniowie zwolnieni do domu","3":"","4":""},{"1":"6","2":"2 Li - Uczniowie zwolnieni do domu","3":"","4":""},{"1":"","2":"","3":"","4":""},{"1":"Magdalena Popczyk"},{"1":"lekcja","2":"opis","3":"zastępca","4":"uwagi"},{"1":"1","2":"2 GB - Uczniowie przychodzą później","3":"","4":""},{"1":"2","2":"1 Ls - Uczniowie przychodzą później","3":"","4":""},{"1":"4","2":"1 Ta - 21","3":"K. Kurczyna","4":""},{"1":"5","2":"3 GA - 21","3":"W. Przybyła","4":""},{"1":"6","2":"3 GA - Uczniowie zwolnieni do domu","3":"","4":""},{"1":"7","2":"3 GB - 21","3":"M. Świetlik","4":""},{"1":"","2":"","3":"","4":""},{"1":"Joanna Ustupska-Kubeczek"},{"1":"lekcja","2":"opis","3":"zastępca","4":"uwagi"},{"1":"5","2":"2 GB(1) - 22","3":"K. Stępniak","4":"złączenie grup"},{"1":"6","2":"2 GB(1) - 22","3":"K. Stępniak","4":"złączenie grup"},{"1":"7","2":"J angielski 2La 2Ls - 22","3":"K. Stępniak","4":"złączenie grup"},{"1":"8","2":"J angielski 2La 2Ls - 22","3":"K. Stępniak","4":"złączenie grup"},{"1":"","2":"","3":"","4":""},{"1":"Małgorzata Załęska-Michniak"},{"1":"lekcja","2":"opis","3":"zastępca","4":"uwagi"},{"1":"2","2":"2 Lb(1) - Uczniowie przychodzą później","3":"","4":""},{"1":"3","2":"2 Lb(1) - Uczniowie przychodzą później","3":"","4":""},{"1":"4","2":"1 Tb(1) - 3","3":"E. Skrodzka","4":"złączenie grup"},{"1":"5","2":"1 Lb(1) - 305","3":"E. Skrodzka","4":"złączenie grup"},{"1":"6","2":"1 Lb(1) - 305","3":"E. Skrodzka","4":"złączenie grup"},{"1":"","2":"","3":"","4":""},{"1":"Joanna Żurek-Gałka"},{"1":"lekcja","2":"opis","3":"zastępca","4":"uwagi"},{"1":"1","2":"2 La - Uczniowie przychodzą później","3":"","4":""},{"1":"2","2":"3 GA - Uczniowie przychodzą później","3":"","4":""},{"1":"4","2":"2 Ta - 403","3":"J. Pytlik","4":""},{"1":"5","2":"3 GB - 403","3":"E. Dworska","4":"złączenie grup"},{"1":"6","2":"2 GA - Uczniowie zwolnieni do domu","3":"","4":""},{"1":"7","2":"1 Lb - Uczniowie zwolnieni do domu","3":"","4":""}]
*/
