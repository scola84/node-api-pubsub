export default function subscribe(pubsub) {
  return (request, response, next) => {
    if (request.header('Connection') === 'close') {
      next();
      return;
    }

    pubsub
      .channel(request.path())
      .subscribe(request, response);

    next();
  };
}
