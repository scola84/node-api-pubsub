export default function subscribeObject(channel) {
  return (request, response, next) => {
    const cancel =
      Number(request.header('x-more')) === 0 ||
      request.datum('object') === null;

    if (cancel === true) {
      next();
      return;
    }

    channel
      .object(request.path())
      .subscribe(request, response);

    next();
  };
}
