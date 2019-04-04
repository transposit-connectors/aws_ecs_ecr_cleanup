(params) => {
	const imagesToDelete = api.run("this.delete_old_images_dryrun", 
                                   {repo: params.repo, 
                                    tagFilter: params.tagFilter, 
                                    gitRepositoryName: params.gitRepositoryName,
                                   	gitRepositoryOwner: params.gitRepositoryOwner})[0];
    let batchDeleteRequest = {"imageIds": [], 
                              "repositoryName": params.repo};
    imagesToDelete[params.repo].forEach((imgPair) => {
        batchDeleteRequest["imageIds"].push({"imageTag": imgPair['imageTag']});
    });
  	if (batchDeleteRequest["imageIds"].length == 0) {
    	api.log("No image to delete.");
    } else {
        let response = api.run("aws_ecr.batch_delete_image", batchDeleteRequest);
        if (!response[0]['failures']) {
            api.log("Failures : " + response[0]['failures']);
        }
      	
        api.log("Deleted: ");
        api.log(response[0]['imageIds']);
     	const textToPost = "Deleted: \n" + response[0]['imageIds'];
      	api.run("this.post_to_slack", {text: textToPost, channelName:'test-integrations'})
    }
}