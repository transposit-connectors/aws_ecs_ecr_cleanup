(params) => {

	const tasksNotInUse = api.run("this.delete_old_tasks_dryrun", {gitRepositoryName : params.gitRepositoryName, gitRepositoryOwner : params.gitRepositoryOwner});
    tasksNotInUse.forEach((tsk) => {
        let response = api.run(deregister_task_api, 
                               {"taskDefinition": tsk})[0];
        if(response['taskDefinition']['status'] === "INACTIVE") {
            api.log("Successfully deactivated " + tsk);
        } else {
            api.log("ERROR: unable to deactivate " + tsk);
        };
      });
   	return tasksNotInUse;
}