(params) => {
	const _ = require('underscore.js');
  	let containersInUse = [];
    let dateNow = new Date();
  	const TWO_WEEKS_BEFORE = dateNow.setDate(dateNow.getDate() - 14);
  	let imagesInUse = api.run("this.get_containers_and_tasks_in_use");
  	let imagesToKeep = _.unique(imagesInUse[0]);
	const regex = /([0-9]+)\..+\/([a-zA-Z0-9]+):(.+)/;
  
  	imagesToKeep = _.compact(_.unique(imagesToKeep.map((c) => {
  		let captureGroups = regex.exec(c);
        if (!captureGroups || captureGroups.length == 0) {
             // Not one of our images. Consider it up to date
            return "";
        } else {
          	let registryId = captureGroups[1];
          	let repositoryName = captureGroups[2];
          	let imgTag = captureGroups[3];
          	return imgTag;
        }
     })));
  	console.log("We are keeping these containers:");
    console.log(imagesToKeep);

  	let imagesToDelete = {};
  	const repos = [params.repo];
  	repos.forEach((rp) => {
      	if (!_.contains(_.keys(imagesToDelete), rp)) {
        	imagesToDelete[rp] = [];
        }
      
    	let images = api.run("aws_ecr.list_images", {repositoryName: rp})[0]['imageIds'];
      	console.log(images)
      	
      	images.forEach((img) => {
          	const imgTag = img['imageTag'];
          	if (!imgTag){
            	return
            }
          	// check if it's being used
        	if (_.contains(imagesToKeep, imgTag) || imgTag == "latest") {
            	return;
            }
          
          	// filter out images that do not match tag provided
          	if (params.tagFilter && !imgTag.startsWith(params.tagFilter)) {
              return;
            }
          
          	if (imgTag.startsWith("ci_deploy")) {
            	const sha = imgTag.split("-")[1];
              	let commitInfo = api.run("this.get_commit", 
                                         {repo: params.gitRepositoryName, 
                                          owner: params.gitRepositoryOwner,
                                          sha: sha});
            	let commitTime = new Date(commitInfo[0]['commit']['author']['date']).getTime();
          		if (commitTime < TWO_WEEKS_BEFORE) {
                	imagesToDelete[rp].push(img);
                };
              return;
            }
        });
    });
}

/*
 * For sample code and reference material, visit
 * https://api-composition.transposit.com/references/js-operations
 */