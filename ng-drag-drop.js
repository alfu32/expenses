angular.module("ng-drag-drop",[])
.directive("ngDrag",DragDirective)
.directive("ngDrop",DropDirective)
.directive("ngDropFile",DropFileDirective)

DragDirective.$inject="$parse,$rootScope".split(",")
DropDirective.$inject="$parse,$rootScope".split(",")
DropFileDirective.$inject="$parse".split(",")


function DragDirective($parse,$rootScope){
	return {
		restrict:"A",
		compile:function(te,ta){
			return function (scope,element,attr){
				element.attr("draggable",true)
				var fn=$parse(attr.ngDrag,null,true)
				element.on("dragstart",function(event){
					fn(scope,{ $data:event.dataTransfer,$event:event });
					getDataTransfer(event).then(function(data){
						$rootScope.$broadcast("$drag",{ $channel:fn(scope),$data:event.dataTransfer,$event:event } )
					})
					
				})
			}
		}
	}
}
function DropDirective($parse,$rootScope){
	return {
		restrict:"A",
		compile:function(te,ta){
			return function (scope,element,attr){
				element.attr("droppable",true)
				// console.log(fn)
				element.on("drag dragmove dragover dragout dragenter dragleave",function(event){
					event.preventDefault();
					console.log(event.type);
				})
				element.on("drop",function(event){
					var fn=$parse(attr.ngDropTarget,null,true)
					//var ev=scope.$eval(attr.ngDropTarget,null,true)
					//console.log("fn",fn,ev)
					event.preventDefault();
					getDataTransfer(event)
					.then(function(data){
						//console.log("dropped",data);
						$rootScope.$broadcast("$drop",{ $channel:fn(scope),$data:data,$event:event } );
					})
				})
				scope.$on("$drag",function($ev,$data){
					if($data.$channel==fn(scope))$rootScope.$broadcast("$drop",$data )
				})
			}
		}
	}
}
function DropFileDirective($parse){
	return {
		restrict:"A",
		compile:function(te,ta){
			return function (scope,element,attr){
				element.attr("droppable",true)
				// console.log(fn)
				element.on("drag dragmove dragover dragout dragenter dragleave",function(event){
					event.preventDefault();
					console.log(event.type);
				})
				element.on("drop",function(event){
					var fn=$parse(attr.ngDropFile,null,true)
					//var ev=scope.$eval(attr.ngDropFile,null,true)
					//console.log("fn",fn,ev)
					event.preventDefault();
					getDataTransfer(event)
					.then(function(data){
						//console.log("dropped",data);
						fn(scope,{ $data:data,$event:event })
						//$rootScope.$broadcast("$drop",{ $channel:fn(scope),$data:data,$event:event } );
					})
				})
			}
		}
	}
}

function getDataTransfer(event){
	var psa;
	var ps = Promise.all(
		psa = Array.prototype.slice.call(event.dataTransfer.items)
		.filter(function(item){return item.kind!=="file"})
		.map(function(item){
			//console.log("item",JSON.stringify(item))
			return new Promise(function(resolve,reject){
				item.getAsString(function(str){
					//console.log("item",JSON.stringify(item),str)
					resolve(str);
				})
			}) 
		}).
		concat(
			Array.prototype.slice.call(event.dataTransfer.files)
			.map(function(file){
				//console.log("file",file)
				return new Promise(function(resolve,reject){
					t=new FileReader();
					var _file={name:file.name,size:file.size,$file:file}
					t.onload=function(x){
						//console.log("file",_file,x.target.result)
						_file.content=x.target.result;
						resolve(_file)
					}
					t.readAsText(file);
				}) 
			})
		)
	)
	//console.log(ps,psa);
	return ps;
}