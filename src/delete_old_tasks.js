(params) => {
  	var _ = require('underscore.js');	
  	var maxReducer = ( acc, cur ) => Math.max( acc, cur );
    let dateNow = new Date();
  	const TWO_WEEKS_BEFORE = dateNow.setDate(dateNow.getDate() - 14);
	
  	let tasksInUseForEnv;
  	let deregister_task_api = "aws_ecs.deregister_task_definitions";
  	switch(params.env) {
      case "demo":
        let demoResult = api.run("this.get_containers_and_tasks_in_use", {env: "demo"});
        tasksInUseForEnv = demoResult[1];
        deregister_task_api = "aws_ecs.deregister_task_definitions";
        break;
      case "staging":
        let stagingResult = api.run("this.get_containers_and_tasks_in_use", {env: "staging"});
        tasksInUseForEnv = stagingResult[1];
        deregister_task_api = "staging_aws_ecs.deregister_task_definitions";
       	break;
      case "prod":
        let prodResult = api.run("this.get_containers_and_tasks_in_use", {env: "prod"});
        tasksInUseForEnv = prodResult[1];
        deregister_task_api = "prod_aws_ecs.deregister_task_definitions";
        break;	
    }
  
  	// filter out tasks in use
  	let allTasks = api.run("aws_ecs.paginated_list_task_definitions");
  	let tasksNotInUse = allTasks.filter(function(tsk){
    	return _.indexOf(tasksInUseForEnv, tsk) == -1;
    });
  
  	//api.log(tasksNotInUse)
  
  	// filter tasks by their latest image push time
  	//let end = Math.max(params.to, tasksNotInUse.length);
   	tasksNotInUse = tasksNotInUse.slice(params.from,params.to);

    tasksNotInUse = tasksNotInUse.filter(function(tsk) {
      	let img = tsk.split("/")[1];
		//const regex = /([0-9]+)\..+\/([a-zA-Z0-9]+):(.+)/;
      	const regex = /([a-z]+)\-ci_deploy\-([a-zA-Z0-9]+):(.+)/
        let captureGroups = regex.exec(img);
        if (!captureGroups || captureGroups.length == 0) {
             // Not one of our images. Consider it up to date
            return false;
        } else {
           // we want to make sure the *latest pushed* image associated with a task is more than 2 weeks old
            let service = captureGroups[1];
            let sha = captureGroups[2];
            let revision = captureGroups[3];
            let commitInfo = api.run("this.get_commit", {sha: sha});
            let commitTime = new Date(commitInfo[0]['commit']['author']['date']).getTime();
          	return commitTime < TWO_WEEKS_BEFORE;
        }
    });
  	if (tasksNotInUse.length == 0) {
    	api.log("There is nothing to clean!");
    }

    tasksNotInUse.forEach((tsk) => {
      let response = api.run(deregister_task_api, 
                             {body: {"taskDefinition": tsk}})[0];
      if(response['taskDefinition']['status'] === "INACTIVE") {
          api.log("Successfully deactivated " + tsk);
      } else {
          api.log("ERROR: unable to deactivate " + tsk);
      };
	});
  
   	return tasksNotInUse;
}