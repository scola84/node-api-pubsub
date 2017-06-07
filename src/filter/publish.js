export default function publish(server) {
  const pubsub = server.pubsub();

  return (request) => {
    request.once('data', (data) => {
      pubsub
        .channel(request.path())
        .publish(data, request.connection());
    });
  };
}
