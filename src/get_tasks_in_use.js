params => {
  const _ = require("underscore.js");

  let clusters = api.run("aws_ecs.list_clusters");

  clusters = clusters.map(function(cluster) {
    return cluster.split("/")[1];
  });

  // services indexed by cluster name
  const indexedServices = {};

  clusters.forEach(function(c) {
    let resultSvcs = api.run("aws_ecs.list_services", {
      cluster: c
    });
    indexedServices[c] = resultSvcs;
  });

  // get task arns
  let tasksInUse = [];
  _.each(indexedServices, function(val, key) {
    const svcNames = val.map(function(v) {
      return v.split("/")[1];
    });
    const tasks = api.run("aws_ecs.describe_services", {
      cluster: key,
      services: svcNames
    });
    tasksInUse.push(_.pluck(tasks[0].services, "taskDefinition"));
  });
  tasksInUse = _.flatten(tasksInUse);
  return tasksInUse;
}