(params) => {
  	var _ = require('underscore.js');
  	let list_clusters = "aws_ecs.list_clusters";
    let list_services = "aws_ecs.list_services";
    let describe_services = "aws_ecs.describe_services";
  	let describe_tasks_definition = "aws_ecs.describe_task_definitions";

	var clusters = api.run(list_clusters)[0]['clusterArns'];

  	clusters = clusters.map(function(cluster) {
    	return cluster.split("/")[1]
    });
	
  	
  	// services indexed by cluster name
  	var indexedServices = {};
  	clusters.forEach(function(c) {
    	var resultSvcs = api.run(list_services, {
        	cluster: c
        })[0];
      	indexedServices[c] = _.map(resultSvcs, _.values)[0];
    });

  
  	// get task arns
    var tasksInUse = [];
  	_.each(indexedServices, function(val, key) {
      	var svcNames = val.map(function(v) {
        	return v.split("/")[1];
        });
		var tasks = api.run(describe_services, {
          	body: {
            	cluster: key,
              	services: svcNames
            }
        });
      	tasksInUse.push(_.pluck(tasks[0].services, "taskDefinition"));
    });
  	tasksInUse = _.flatten(tasksInUse)
  
  	  	// find containers that are in use, based on tasksInUse
  	const containersInUse = _.flatten(tasksInUse.map((tsk) => {
        let taskDef = api.run(describe_tasks_definition, 
                      {taskDefinition: tsk})[0]['taskDefinition'];
        // find task's images
      	let images = taskDef['containerDefinitions'].map((def)=>{
        	return def['image'];
        });
      	return images;
    }));
  return [containersInUse, tasksInUse];
}

/*
 * For sample code and reference material, visit
 * https://docs.transposit.com/references/js-operations
 */