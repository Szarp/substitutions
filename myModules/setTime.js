
module.exports = function setTime(){
    //this.Today = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
    //this.day
    //this.month
    //this.year
    this.displayTime=function(){
        return this.year+'-'+this.month+'-'+this.day;
    }
    this.updateTime=function(){
        this.year = this.Today.getFullYear();
        this.month = this.Today.getMonth()+1;
        this.day = this.Today.getDate();
        if(this.month<10){this.month='0'+this.month;};
        if(this.day<10){this.day='0'+this.day;};
    }
    this.todayIs=function(){
        this.Today = new Date();
        this.updateTime();

    }
    this.tommorowIs=function(){
        this.Today = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
        this.updateTime();
    }
    this.theDayAfterTomorrowIs=function(){
        this.Today = new Date(new Date().getTime() + 2*24 * 60 * 60 * 1000);
        this.updateTime();
    }
    this.yeasterdayIs=function(){
        this.Today = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
        this.updateTime();
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
