export default function subscribeList(channel) {
  return (request, response, next) => {
    const cancel =
      Number(request.header('x-more')) === 0 ||
      request.datum('list') === null;

    if (cancel === true) {
      next();
      return;
    }

    channel
      .list(request.path())
      .subscribe(request, response);

    next();
  };
}
