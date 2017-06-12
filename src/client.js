import EventEmitter from 'events';
import { debuglog } from 'util';
import ClientSubscription from './client-subscription';

export default class Client extends EventEmitter {
  constructor() {
    super();

    this._log = debuglog('pubsub');

    this._connection = null;
    this._subscriptions = new Map();
  }

  destroy() {
    this._log('Client destroy');

    this._subscriptions.forEach((subscription) => {
      subscription.destroy();
    });

    this._subscriptions.clear();
  }

  connection(value = null) {
    if (value === null) {
      return this._connection;
    }

    this._connection = value;
    return this;
  }

  subscribe(path) {
    this._log('Client subscribe path=%s', path);

    const subscription = new ClientSubscription()
      .path(path)
      .client(this)
      .connection(this._connection);

    this._subscriptions.set(path, subscription);
    return this;
  }

  publish(path, data = {}) {
    this._log('Client publish path=%s data=%j', path, data);

    this._connection
      .request()
      .method('POST')
      .path(path)
      .end(data);

    return this;
  }
}
