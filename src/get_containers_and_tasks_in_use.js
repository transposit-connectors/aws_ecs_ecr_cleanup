(params) => {
  	const _ = require('underscore.js');
  	const list_clusters = "aws_ecs.list_clusters";
    const list_services = "aws_ecs.list_services";
    const describe_services = "aws_ecs.describe_services";
  	const describe_tasks_definition = "aws_ecs.describe_task_definition";
	const tasksInUse = api.run("this.get_tasks_in_use");
  
  	  	// find containers that are in use, based on tasksInUse
  	const containersInUse = (api.run("this.get_images_in_use")).map((img) => {return img['image']});

  return [containersInUse, tasksInUse];
}

/*
 * For sample code and reference material, visit
 * https://docs.transposit.com/references/js-operations
 */