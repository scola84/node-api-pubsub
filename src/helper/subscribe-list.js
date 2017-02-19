export default function subscribeList(channel) {
  return (request, response, next) => {
    if (!request.header('x-more')) {
      next();
      return;
    }

    channel
      .list(request.path())
      .subscribe(request, response);

    next();
  };
}
