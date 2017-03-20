export default function subscribeObject(channel) {
  return (request, response, next) => {
    if (!request.header('x-more')) {
      next();
      return;
    }

    if (!request.datum('object')) {
      next();
      return;
    }

    channel
      .object(request.path())
      .subscribe(request, response);

    next();
  };
}
