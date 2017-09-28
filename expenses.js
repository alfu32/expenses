function PSch(a){
	var self=this;
}
function PaymentSchedule(params){
	var self=this;
	var dateStart=params.dateStart;
	var periodMonths=params.periodMonths;
	var monthlyPayment=params.monthlyPayment;
	var array=[]
	function update(){
		var y=dateStart.getFullYear(),mt=dateStart.getMonth()+1
		var d=new Date(y,mt,0)
		array = new Array(periodMonths)
			.fill(monthlyPayment)
			.map(function(p,i){
				var d=new Date(y,mt+i,0);
				return {
					year0:d.getFullYear()-dateStart.getFullYear(),
					month0:i,
					year:d.getFullYear(),
					month:d.getMonth(),
					date:d,
					value:p
				}
			})
	}
	update();
	self.index=function(indexFn){
		return array.reduce(function(ac,v,i,a){
			ac[indexFn(v)]=v;
			return ac
		},{});
	}
	self.toArray=function(){ return array; }
	self.map=function(fn){
		array=array.map(fn);
		return self;
	}
	self.add=function(schedule){
		var s0=self.index(function(v){return v.year*12+v.month});
		var s1=schedule.index(function(v){return v.year*12+v.month});
		var a1=schedule.toArray()
		var s=Math.min(array[0].year*12+array[0].month,a1[0].year*12+a1[0].month);
		var e=Math.max(array[array.length-1].year*12+array[array.length-1].month,a1[a1.length-1].year*12+a1[a1.length-1].month);
		console.log(s,e)
		return ns=new PaymentSchedule({
			dateStart:new Date(parseInt(s/12),s%12,1),
			periodMonths:e-s,
			monthlyPayment:0
		})
		.map(function(v,i,a){
			var index=v.year*12+v.month;
			v.value+=(s0[index] && s0[index].value)||0;
			v.value+=(s1[index] && s1[index].value)||0;
			return v;
		})
	}
}
function Loan(params){
	var self=this;
	var sum=params.sum;
	var interest=params.interest;
	var monthlyInterest=Math.pow(1+params.interest,1/12)-1;
	var periodYears=params.periodYears;
	var periodMonths=params.periodYears*12;
	var dateStart=params.dateStart;

	self.getMonthlyPayment=function(){
		return sum*monthlyInterest/(1 - 1/Math.pow(1+monthlyInterest,periodMonths))
	}
	self.getPaymentSchedule=function(){
		return (new PaymentSchedule({
			dateStart      : dateStart,
			periodMonths   : periodMonths,
			monthlyPayment : self.getMonthlyPayment()
		})).array()
		.map(function(v,i,a){
			v.capital=((a[i-1] && a[i-1].capital)||0)+v.value;
			if(sum>=v.capital){
				v.remainingDebt=sum-v.capital;
				v.interest=0;
			}else{
				v.remainingDebt=0;
				v.interest=v.capital-sum;
			}
			return v;
		})
	}
}