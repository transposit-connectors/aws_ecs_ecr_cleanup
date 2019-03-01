(params) => {
  	var _ = require('underscore.js');	
  	var maxReducer = ( acc, cur ) => Math.max( acc, cur );
    let dateNow = new Date();
  	const TWO_WEEKS_BEFORE = dateNow.setDate(dateNow.getDate() - 14);
	
  	let tasksInUse = api.run("this.get_containers_and_tasks_in_use")[1];
  	let deregister_task_api = "aws_ecs.deregister_task_definition";
  
  	// filter out tasks in use
  	let allTasks = api.run("aws_ecs.list_task_definitions")

  	let tasksNotInUse = allTasks.filter(function(tsk){
    	return _.indexOf(tasksInUse, tsk) == -1;
    });
  	// filter tasks by their latest image push time
  	tasksNotInUse = tasksNotInUse.slice(0, 20)
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
            let commitInfo = api.run("this.get_commit", {sha: sha, 
                                                         repo: params.gitRepositoryName, 
                                                         owner: params.gitRepositoryOwner});
            let commitTime = new Date(commitInfo[0]['commit']['author']['date']).getTime();
          	return commitTime < TWO_WEEKS_BEFORE;
        }
    });
  	console.log(tasksNotInUse)
  	if (tasksNotInUse.length == 0) {
    	api.log("There is nothing to clean!");
    }
  return tasksNotInUse;
}

/*
 * For sample code and reference material, visit
 * https://api-composition.transposit.com/references/js-operations
 */