
# AWS ECS/ECR cleanup task

At Transposit, we run services on AWS ECS and store our container images in AWS ECR. When either ECS tasks or ECR repositories gets full, our build and deployment suffer. This app finds container images and ECS tasks not being used, and safely purges them. It also checks with GitHub to verify the date of creation for a specific container image, since we use a commit SHA to link commits and deployment.

These AWS connectors have paginated operations, which means you don’t need to deal with API pagination at all!

## Test against your own infrastructure

After authorizing with your AWS credentials, you can run the `delete_old_images_dryrun` operation to see what images would be deleted from your ECR, with the following parameters:

  - `repo`: The name of the ECR repo you want to purge.
  - `tagFilter`: (optional) The desired filter pattern for images. Only images matching this pattern will be purged.
  - `gitRepositoryName`: GitHub repository name.
  - `gitRepositoryOwner`: GitHub repository owner.

The operation `delete_old_tasks_dryrun` works in a similar way, with the following parameters:

  - `gitRepositoryName`: GitHub repository name.
  - `gitRepositoryOwner`: GitHub repository owner.

When you are happy with the dry run results, you can go ahead and run `delete_old_images` and `delete_old_tasks` against your infrastructure.

## What else can you do?

Though you may not use GitHub or name your images by commit SHA, you can still fork and customize this app according to your specific needs. Some ideas:

  - Instead of purging the container images, forwarding them to S3 for long term storage.
  - Schedule a task to clean up your ECR every day.
  - Add an operation to audit your purge results every day, and generate a spreadsheet using Airtable connector



