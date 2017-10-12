fs=require("fs");
path=require("path");

JOB={
	JS:{
		TARGET_PATH:"build",
		TARGET:"build/script.js",
		SOURCES:[
			"bower_components/d3/d3.js",
			"bower_components/nvd3/build/nv.d3.js",
			"bower_components/file-saver/FileSaver.js",
			"bower_components/angular/angular.js",
			"bower_components/angular-nvd3/dist/angular-nvd3.js",
			"ng-drag-drop.js",
			"ng-key.js",
			"main.js"
		],
		OPERATION:"forEach",
		FUNCTION:function(filename){
			console.log(this);
			fs.appendFileSync(this.TARGET,"\n\n/*====["+filename+"]=========================================*/\n");
			fs.appendFileSync(this.TARGET,fs.readFileSync(filename));
			fs.appendFileSync(this.TARGET,"\n\n")
		}
	},
	CSS:{
		TARGET_PATH:"build",
		TARGET:"build/style.css",
		SOURCES:[
			"bower_components/nvd3/build/nv.d3.css",
			"style.css"
		],
		OPERATION:"forEach",
		FUNCTION:function(filename){
			console.log(this);
			fs.appendFileSync(this.TARGET,"\n\n/*====["+filename+"]=========================================*/\n");
			fs.appendFileSync(this.TARGET,fs.readFileSync(filename))
			fs.appendFileSync(this.TARGET,"\n\n")
		}
	},
	HTML:{
		TARGET_PATH:"build",
		TARGET:"build/index.html",
		SOURCES:[
			"head.html",
			"tail.html"
		],
		OPERATION:"forEach",
		FUNCTION:function(filename){
			console.log(this);
			//var tag=filename.split(".")[0];
			//fs.appendFileSync(this.TARGET,"<"+tag+">")
			fs.appendFileSync(this.TARGET,"\n\n<!-- ====["+filename+"]========================================= -->\n");
			fs.appendFileSync(this.TARGET,fs.readFileSync(filename))
			fs.appendFileSync(this.TARGET,"\n\n")
			//fs.appendFileSync(this.TARGET,"</"+tag+">")
		}
	}
};


Object.keys(JOB)
.forEach(function(jobName){
	var job=JOB[jobName];
	job.TARGET=path.resolve(job.TARGET,"");
	console.log(job);
	try{fs.mkdirSync(path.dirname(job.TARGET));}catch(err){}
	fs.writeFileSync(job.TARGET,"");
	job.SOURCES[job.OPERATION](job.FUNCTION.bind(job))
})

