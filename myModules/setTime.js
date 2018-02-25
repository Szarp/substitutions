module.exports = setTime;

function setTime(){
    var self=this;
    this.Today;
    this.day;
    this.month;
    this.year;
    this.weekday;
    this.month; 
    this.displayTime=function(){
        return self.year+'-'+self.month+'-'+self.day;
    }
    this.reverseTime=function(){
        return self.day+'-'+self.month+'-'+self.year;
    }
    this.displayWeekDay = function(){
        //var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
        var days = ['Nd','Pon','Wt','Śr','Czw','Pt','Sob'];
        return days[self.Today.getDay()];
        
    }
    this.updateTime=function(){
        self.year = self.Today.getFullYear();
        self.month = self.Today.getMonth()+1;
        self.day = self.Today.getDate();
        if(self.month<10){self.month='0'+self.month;};
        if(self.day<10){self.day='0'+self.day;};
    }
    this.todayIs=function(){
        self.Today = new Date();
        self.updateTime();

    }
    this.tommorowIs=function(){
        self.Today = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
        self.updateTime();
    }
    this.theDayAfterTomorrowIs=function(){
        self.Today = new Date(new Date().getTime() + 2*24 * 60 * 60 * 1000);
        self.updateTime();
    }
    this.yeasterdayIs=function(){
        self.Today = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
        self.updateTime();
    }
    this.nextSchoolDay = function(){
        var day = new Date().getDay;
        var howManyDays = 1;
        if(day == 5) //Friday
            howManyDays = 3;
        else if (day == 6) //Saturday
            howManyDays = 2;
        self.Today = new Date(new Date().getTime() + howManyDays*24 * 60 * 60 * 1000);
        self.updateTime();
    }
    /*
    this.setTime=function(year,month,day){
        this.Today=new Date();
        this.Today.setFullYear(year);
        this.Today.setDate(day);
        this.Today.setMonth(month);
        this.updateTime();
        
    }
    */
    
}
