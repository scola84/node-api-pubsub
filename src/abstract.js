import Publisher from './publisher';
import { debuglog } from 'util';

export default class AbstractSubscription {
  constructor() {
    this._log = debuglog('pubsub');

    this._path = null;
    this._publishers = new Map();
  }

  destroy() {
    this._log('Subscription destroy');

    this._publishers.forEach((publisher) => {
      publisher.destroy();
    });

    this._publishers.clear();
  }

  path(value = null) {
    if (value === null) {
      return this._path;
    }

    this._path = value;
    return this;
  }

  subscribe(request, response) {
    const connection = request.connection();
    let publisher = this._publishers.get(connection);

    if (!publisher) {
      publisher = new Publisher()
        .subscription(this);

      this._publishers.set(connection, publisher);
    }

    publisher
      .request(request)
      .response(response);

    request.resume();

    this._log('Subscription subscribe %s (%s)', request.path(),
      this._publishers.size);

    return this;
  }

  unsubscribe(request) {
    const connection = request.connection();
    this._publishers.delete(connection);

    this._log('Subscription unsubscribe %s (%s)', request.path(),
      this._publishers.size);

    return this;
  }
}
