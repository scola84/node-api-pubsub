import { debuglog } from 'util';
import Publisher from './publisher';

export default class Subscription {
  constructor() {
    this._log = debuglog('pubsub');

    this._channel = null;
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

  channel(value = null) {
    if (value === null) {
      return this._channel;
    }

    this._channel = value;
    return this;
  }

  mode(value = null) {
    if (value === null) {
      return this._mode;
    }

    this._mode = value;
    return this;
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

    if (publisher instanceof Publisher === false) {
      publisher = new Publisher()
        .subscription(this);

      this._publishers.set(connection, publisher);
    }

    publisher
      .request(request)
      .response(response);

    request.resume();

    this._log('Subscription subscribe path=%s #pub=%d',
      request.path(), this._publishers.size);

    return this;
  }

  unsubscribe(request) {
    const connection = request.connection();
    this._publishers.delete(connection);

    if (this._publishers.size === 0) {
      this._channel.subscription(this._path, false);
    }

    this._log('Subscription unsubscribe path=%s #pub=%d',
      request.path(), this._publishers.size);

    return this;
  }

  publish(data, connection = null) {
    this._log('Subscription publish data=%j mode=%s path=%s',
      data, this._mode, this._path);

    const cancel =
      this._mode === 'object' &&
      typeof data.path === 'string' &&
      data.path !== this._path;

    if (cancel === true) {
      return this;
    }

    this._publishers.forEach((publisher) => {
      publisher.publish(data, connection);
    });

    return this;
  }
}
