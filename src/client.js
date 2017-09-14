import { debuglog } from 'util';
import ClientSubscription from './client-subscription';

export default class Client {
  constructor() {
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
    this._log('Client subscribe path=%s has=%j', path);

    let subscription = this._subscriptions.get(path);

    if (subscription instanceof ClientSubscription === true) {
      return subscription;
    }

    subscription = new ClientSubscription()
      .path(path)
      .client(this)
      .connection(this._connection);

    this._subscriptions.set(path, subscription);
    return subscription;
  }

  publish(path, data = {}) {
    const connected = this._connection.connected();

    this._log('Client publish path=%s data=%j connected=%j',
      path, data, connected);

    if (connected === false) {
      return this;
    }

    this._connection
      .request()
      .method('POST')
      .path(path)
      .end(data);

    return this;
  }
}
