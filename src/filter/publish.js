export default function filterPublish(pubsub) {
  return (request, response) => {
    request.once('data', (data) => {
      pubsub
        .channel(request.path())
        .publish(data);
    });

    response
      .status(200)
      .end();
  };
}
