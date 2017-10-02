angular.module("ng-key",[])
.directive("ngKey",NgKeyDirective)

NgKeyDirective.$inject="$parse,$rootScope".split(",");

function NgKeyDirective($parse,$rootScope){
	return {
		restrict:"A",
		compile:function(te,ta){
			return function (scope,element,attr){
				var fn=$parse(attr.ngKey,null,true)
				element.attr( "tabindex",1)
				var outline;
				element.on("focus blur",function(event){
					event.preventDefault();
					event.stopPropagation();
				})
				element.on("mouseover",function(event){
					outline=element[0].style.outline;
					element[0].style.outline=0;
					element.addClass("focus")
					element[0].focus();
				})
				element.on("mouseout",function(event){
					element[0].style.outline=outline;
					element.removeClass("focus")
					element[0].blur();
				})
				element.on("keydown",function keyup(event){
					var eventStr=eventStream(event);
					//debug(eventStr)
					fn(scope,{$type:event.type,$stream:eventStr})
					//console.log(eventStr,fn,fn(scope,{$type:event.type,$stream:eventStr}));

					//$rootScope.$broadcast("$key",{$type:event.type,$stream:eventStr,element:element});
				})
			}
		}
	}
}

function eventStream(event){
	var code=[(event.buttons==0x4)*1,(event.buttons==0x2)*1,(event.buttons==0x1)*1,(event.shiftKey)*1,(event.ctrlKey)*1,(event.altKey)*1,event.type.replace(/mouse/gi,"")];
	code=[];
	if(event.ctrlKey)  code.push("ctrl");
	if(event.shiftKey) code.push("shift");
	if(event.altKey)   code.push("alt");	
	if(event.type=="mouseup"||
		event.type=="mousemove"||
		event.type=="mousedown"||
		event.type=="drop"||
		event.type=="drag"||
		event.type=="dragmove"||
		event.type=="dragover"||
		event.type=="dragout"||
		event.type=="dragenter"||
		event.type=="dragleave")code=code.concat([
		//event.button,
		((event.type!="mouseup" && event.buttons==0x1) || (event.type=="mouseup" && event.button==0))?"L":
		((event.type!="mouseup" && event.buttons==0x4) || (event.type=="mouseup" && event.button==1))?"M":
		((event.type!="mouseup" && event.buttons==0x2) || (event.type=="mouseup" && event.button==2))?"R":"N",
		event.type.replace(/mouse/gi,"")
	]);
	if(event.key)code.push(event.key);
	return code.join("-");
}