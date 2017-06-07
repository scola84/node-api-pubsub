export default function subscribe(pubsub) {
  return (request, response, next) => {
    const cancel =
      Number(request.header('x-more')) === 0 ||
      request.datum('list') === null &&
      request.datum('object') === null;

    if (cancel === true) {
      next();
      return;
    }

    pubsub
      .channel(request.path())
      .subscribe(request, response);

    next();
  };
}
