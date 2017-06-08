export default function filterPublish(pubsub) {
  return (request) => {
    request.once('data', (data) => {
      pubsub
        .channel(request.path())
        .publish(data);
    });
  };
}
