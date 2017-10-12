
		angular.module("xpenses",["nvd3","ng-drag-drop","ng-key"])
		.filter("toFixed",function(){
			return function(input, digits){
				if(input && input.toFixed)
					return input.toFixed(digits||2);
				else return 0;
			}
		})
		.factory("loans",function(){
			return {
				monthlyPayment:_monthlyPayment
			}
			function _monthlyPayment(parms){
				var monthlyInterest=Math.pow(1+parms.interest/100,1/12)-1;
				return parms.sum*monthlyInterest/(1 - 1/Math.pow(1+monthlyInterest,parms.months))
			}
		})
		.controller("mainController",function MainController($scope,$timeout,$http,loans){
			var _main=this;
			var TOTAL={key:"TOTAL",values:[],def:{name:"TOTAL"},area: true};
			$scope.k={
				PAYMENT_TYPE:'PAYMENT,LOAN',
				RATE_TYPE:'FIX,VARIABLE',
				REIMBURSEMENT_TYPE:'FLAT,LINEAR'
			}
			$scope.appData={
				ver:"1.0.0",
				name:"expenses"
			}
			$scope.options = {
				chart: {
					type: 'lineChart',
					height: 450,
					margin : {
							top: 20,
							right: 20,
							bottom: 60,
							left: 65
					},
					padding : {
							top: 20,
							right: 20,
							bottom: 20,
							left: 20
					},
					x: function(d){ return (d&&d[0])||0; },
					y: function(d){ return (d&&d[1])||0; },
					average: function(d) { return d.mean; },

					color: d3.scale.category10().range(),
					duration: 300,
					useInteractiveGuideline: true,
					clipVoronoi: false,

					xAxis: {
							axisLabel: 'X Axis',
							tickFormat: function(d) {
									return d3.time.format('%m/%y')(new Date(d))
							},
							showMaxMin: false,
							staggerLabels: true
					},

					yAxis: {
							axisLabel: 'Y Axis',
							tickFormat: function(d){
									return d3.format('.2f')(d);
							},
							axisLabelDistance: 20
					}/*,
			    "zoom": {
			      "enabled": true,
			      "scaleExtent": [
			        1,
			        10
			      ],
			      "useFixedDomain": true,
			      "useNiceScale": false,
			      "horizontalOff": false,
			      "verticalOff": true,
			      "unzoomEventType": "dblclick.zoom"
			    }*/
				}
			};
			$scope.model={NEW:normalizeModel({})}
			$scope.normalizeModel=normalizeModel;
			$scope.data = [TOTAL];
			_main.cycle=function(s,d,n,values){
				d=normalizeModel(d);
				var v=values.split(",");
				d[n]=v[(v.indexOf(d[n])+1)%v.length];
				$scope.changed(s,d);
			}

			_main.keyPress=function($type,$stream){
				console.log("$key",$stream);
				switch($stream){
					case "ctrl-shift-S":
						var mod=Object.keys($scope.model).reduce(function(ac,k){
							if(k=="NEW")return ac;
							var e=angular.extend({},$scope.model[k])
							delete e.$$hashKey;
							ac[e.name]=e;
							return ac;
						},{});
						var pl=JSON.stringify($scope.model,null,2)
						var blob = new Blob([pl], {type: "text/plain;charset=utf-8"});
						saveAs(blob,"projection-model.json");
					break;
					case "ctrl-shift-S":

					break;
				}
			}
			_main.dropFiles=function($event,$files){
				//console.log("dropFiles",$event,$files);
				var x=JSON.parse($files[0].content);
				console.log(x);
				$scope.model=Object.keys(x).reduce(function(ac,k){
					v=x[k]
					v.startDate=new Date(v.startDate)
					v.endDate=new Date(v.endDate);
					ac[v.name]=v;
					return ac;
				},{});
				$scope.model.NEW=normalizeModel({});
				throttle(function(){
					update();
					$apply();
				},500);
			}
			function normalizeModel(_def){
				var def=_def||{};
				def["startDate"]              =  def["startDate"]              ||  new Date();
				def["endDate"]                =  def["endDate"]                ||  def.startDate;
				def["monthlyPayment"]         =  def["monthlyPayment"]         ||  0;
				def["interest"]               =  def["interest"]               ||  0;
				def["type"]                   =  def["type"]                   ||  "PAYMENT";
				def["paymentPlan"]            =  def["paymentPlan"]            ||  "FLAT";
				def["paymentPlanVariation"]   =  def["paymentPlanVariation"]   ||  0;
				def["interestVariationPlan"]  =  def["interestVariationPlan"]  ||  "FIX";
				def["interestVariationFirst"] =  def["interestVariationFirst"] ||  5;
				def["interestVariationNext"]  =  def["interestVariationNext"]  ||  5;
				def["interestVariationCap"]   =  def["interestVariationCap"]   ||  parseInt(def.interest*2);
				def.defaultName               =  def.startDate.toString().substr(4,3)+"-"+def.startDate.getFullYear()+" "+def.endDate.toString().substr(4,3)+"-"+def.endDate.getFullYear()
				

				var sm=def.startDate.getFullYear()*12+def.startDate.getMonth();
				var em=def.endDate.getFullYear()*12+def.endDate.getMonth();
				def.months=em-sm;
				switch(def.type){
					case "PAYMENT":
						def.sum=(em-sm)*def.monthlyPayment;
						def.total=(em-sm)*def.monthlyPayment;
					break;
					case "LOAN":
						def.monthlyPayment=loans.monthlyPayment({months:em-sm,sum:def.sum,interest:def.interest})
						def.total=(em-sm)*def.monthlyPayment;
					break;
				}
				switch(def.paymentPlan){
					case "FLAT":
						def.variation=0
					break;
					case "LINEAR":
						def.variation=def.monthlyPayment*( (def.paymentPlanVariation)/100)
					break;
				}
					var cs = new Date(def.startDate)
					,ce = new Date(def.endDate);
					var startValue=def.monthlyPayment-def.variation
					var endValue=def.monthlyPayment+def.variation;
					// def.interestVariationFirst
					// def.interestVariationNext
					// def.interestVariationCap
				switch(def.interestVariationPlan){
					case "FIX":
						def.schedule=[
							[cs,startValue],
							[ce,endValue]
						]
						def.getValue=function(date){
							if(date.getTime()<cs.getTime() || date.getTime()>ce.getTime() || def.ignore )return 0;
							else return startValue+(startValue-endValue)/(ce.getTime()-cs.getTime()+0.001)*(cs.getTime()-date.getTime())
						}
					break;
					case "VARIABLE":
						var ms=new Date(cs)
						ms.setYear(ms.getFullYear()+def.interestVariationFirst);
						var mm=ms.getFullYear()*12+ms.getMonth()
						var maxValue=loans.monthlyPayment({
							months:em-mm,
							sum:def.sum*Math.pow(1+def.interest/100,def.interestVariationFirst)-(def.interestVariationFirst*12)*def.monthlyPayment,
							interest:def.interestVariationCap
						})
							def.schedule=[
								[cs,startValue],
								[ms,startValue],
								[ms,maxValue],
								[ce,maxValue]
							]
							def.total=(mm-sm)*startValue;
							def.total+=(em-mm)*maxValue;
							def.getValue=function(date){
								return [
									[cs,ms,startValue],
									[ms,ce,maxValue]
								].reduce(function(ac,v,i,a){
									//console.log(def.name+":"+date,v,(v[0].getTime()<=date.getTime() && date.getTime()<=v[1].getTime() ))
									if(v[0].getTime()<=date.getTime() && date.getTime()<=v[1].getTime() && !def.ignore )ac=v[2];
									return ac;
								},0);
							}
					break;
				}
				def.hash=def.name+sm+em;
				//console.log(def);
				return def;
			}
			function getTotalValue(date){
				var sum=Object.keys($scope.model)
					.reduce(function(ac,k){
						if(k=="TOTAL")return ac;
						var def=$scope.model[k];
						ac+=def.getValue(date);
						return ac;
					},0);
					return sum;
			}
			function update(){
				var span=getSpanTotal();
				var ts = new Date(span.startDate),
				te = new Date(span.endDate);

				TOTAL.values=[
					[ new Date(span.startDate),0,1],
					[ new Date(span.endDate),0,-1]
				];
				var tt={};
				tt[ts.getTime()]=0;
				tt[te.getTime()]=0;

	 			$scope.data = [TOTAL];
				Object.keys($scope.model)
				.forEach(function(k){
					var def=normalizeModel($scope.model[k]);
					$scope.model[k]=def;
					var cs=def.schedule[0][0]
					var ce=def.schedule[def.schedule.length-1][0]
					var schedule=[
							[ts,0],
							[cs,0]
						].concat(def.schedule).concat([
							[ce,0],
							[te,0]
						]);
					def.schedule.forEach(function(v){
						tt[v[0].getTime()]=true;
					})
					tt[cs.getTime()]=true;
					tt[ce.getTime()]=true;

					$scope.data.push({
						key:def.name || def.defaultName,
						values:schedule
					})

				});

				TOTAL.values=Object.keys(tt)
				.sort()
				.reduce(function(a,v,i,ar){
					var d=new Date(parseInt(v)),d1=new Date(parseInt(v)-1),d2=new Date(parseInt(v)+1)
					a.push([ d , getTotalValue( d1 ) ])
					a.push([ d , getTotalValue( d2 ) ])
					return a;
				},[])
				console.log(TOTAL.values)
				$apply();
			}
			$scope.addPayment=function(){
				var x=$scope.model.NEW;
				$scope.model[x.name]=angular.extend({},x);
				delete $scope.model.NEW;
				update()
				$scope.model.NEW=normalizeModel({});
				$apply();
			}
			function updateSeries(def){
				var x=def;
				$scope.model[def.name]=angular.extend({},def);
			}
			function getSpanTotal(){
				var x=Object.keys($scope.model)
				.reduce(function(ac,k){
					var def=$scope.model[k];
					if(def.name=="TOTAL")return ac;
					ac.startDate=Math.min(ac.startDate,def.startDate);
					ac.endDate=Math.max(ac.endDate,def.endDate);
					return ac;

				},{startDate:Infinity,endDate:-Infinity});
				return x;
			}
			$scope.changed=function(name,def){
				$scope.model[name]=angular.extend({},def);
				//console.log(name,def);
				throttle(function(){
					update();
					$apply();
				},500);
				//
			}
			$scope.deleteLine=function(name){
				delete $scope.model[name];
				throttle(function(){
					update();
					$apply();
				},500);
				//
			}
			var st=0;
			function throttle(fn,t){
				clearTimeout(st);
				st=setTimeout(fn,t)
			}
			function $apply(){
				$timeout(function(){$scope.$apply();})
			}
		})