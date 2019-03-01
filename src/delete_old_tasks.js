(params) => {


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