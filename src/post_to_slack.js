(params) => {
  const body = {channel: params.channelName, 
   			   text: params.text,
      		   as_user: "false", 
  			   username:"transposit_bot"};
  return api.run("slack.post_chat_message", 
                 {$body: JSON.stringify(body)});
}

/*
 * For sample code and reference material, visit
 * https://api-composition.transposit.com/references/js-operations
 */