
# AWS ECR cleanup task

We run our services on AWS ECS and store our container images in AWS ECR. When either ECS tasks or ECR repositories gets full, our build and deployment suffer. This app finds all container images and ECS tasks not being used and safely purge them. It also checks with github to verify the date of creation for a specific container image, since we use commit SHA to link commits and deployment. These AWS connectors have paginated operations, which means you don’t need to deal with API pagination at all!

  

## Test against your own infrastructure
After entering the correct AWS credentials, you can run `delete_old_images_dryrun` operation to see what images would be deleted from your ECR, with the following parameters:

- `repo`: the name of the ECR repo you want to purge.

- `tagFilter`: optional. Enter the desired filter pattern for images. Only images match this pattern would be purged.

- `gitRepositoryName`: github repository name

- `gitRepositoryOwner`: github repository owner

  

`delete_old_tasks_dryrun` works in a similar way, with the following parameters:

- `gitRepositoryName`: github repository name

- `gitRepositoryOwner`: github repository owner

  

When you are happy with the dry run results, you could go ahead and run `delete_old_images` and `delete_old_tasks` against your infrastructure.

  
  

## What else can you do?
We understand that you may not use github, or that you may not name your images by commit SHA, but you can fork and customize this app according to your specific needs. Some ideas:

- Instead of purging the container images, forwarding them to S3 for long term storage.

- Schedule a task to clean up your ECR every day.

- Add an operation to audit your purge results every day, and generate a spreadsheet using Airtable connector



