(params) => {
  const _ = require("underscore.js");

  let clusters = api.run("aws_ecs.list_clusters");

  clusters = clusters.map(function(cluster) {
    return cluster.split("/")[1];
  });

  // services indexed by cluster name
  const indexedServices = {};

  clusters.forEach(function(c) {
    let resultSvcs = api.run("aws_ecs.list_services", {$body: {
      cluster: c
    }});
    indexedServices[c] = resultSvcs;
  });

  // get task arns
  let tasksInUse = [];
  _.each(indexedServices, function(val, key) {
    const svcNames = val.map(function(v) {
      return v.split("/")[1];
    });
    for(let i = 0; i < svcNames.length; i+=10) {
      // we are doing this loop because aws limits inquiring 10 services at a time
      const tasks = api.run("aws_ecs.describe_services", {$body: {
        cluster: key,
        services: svcNames.slice(i, i+10)
      }});
      tasksInUse.push(_.pluck(tasks[0].services, "taskDefinition"));      
    }
  });
  tasksInUse = _.flatten(tasksInUse);
  let result =[];
  tasksInUse.forEach((t) => {
    result.push({$body: {taskDefinition: t}})
  });
  return tasksInUse;
}

