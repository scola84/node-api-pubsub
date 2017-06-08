export default function subscribe(pubsub) {
  return (request, response, next) => {
    if (Number(request.header('x-more')) === 0) {
      next();
      return;
    }

    pubsub
      .channel(request.path())
      .subscribe(request, response);

    next();
  };
}
