import EventEmitter from 'events';
import { debuglog } from 'util';
import Client from './client';
import Subscription from './subscription';

export default class Channel extends EventEmitter {
  constructor() {
    super();

    this._log = debuglog('pubsub');

    this._client = null;
    this._path = null;
    this._subscriptions = new Map();
  }

  destroy() {
    this._log('Channel destroy');

    if (this._client) {
      this._client.destroy();
      this._client = null;
    }

    this._subscriptions.forEach((subscription) => {
      subscription.destroy();
    });

    this._subscriptions.clear();
  }

  path(value = null) {
    if (value === null) {
      return this._path;
    }

    this._path = value;
    return this;
  }

  client(value = null) {
    if (value === null) {
      return this._client;
    }

    this._client = new Client()
      .path(this._path)
      .channel(this)
      .connection(value);

    return this;
  }

  list(path) {
    let subscription = this._subscriptions.get(path);

    if (subscription instanceof Subscription === false) {
      subscription = this.subscription(path)
        .mode('list');
    }

    return subscription;
  }

  object(path) {
    let subscription = this._subscriptions.get(path);

    if (subscription instanceof Subscription === false) {
      subscription = this.subscription(path)
        .mode('object');
    }

    return subscription;
  }

  subscription(path, action = true) {
    if (action === false) {
      this._subscriptions.delete(path);

      this._log('Channel delete subscription path=%s #sub=%d',
        path, this._subscriptions.size);

      return this;
    }

    if (this._subscriptions.has(path) === false) {
      this._subscriptions.set(path, this._subscription(path));

      this._log('Channel set subscription path=%s #sub=%d',
        path, this._subscriptions.size);
    }

    return this._subscriptions.get(path);
  }

  publish(data, connection = null) {
    this.emit('publish', data);
    this.up(data, connection);

    if (this._client) {
      this.down(data);
    }

    return this;
  }

  up(data, connection = null) {
    this._log('Channel up data=%j #sub=%s', data,
      this._subscriptions.size);

    this._subscriptions.forEach((subscription) => {
      subscription.publish(data, connection);
    });

    return this;
  }

  down(data) {
    this._log('Channel down data=%j', data);

    this._client.publish(data);
    return this;
  }

  _subscription(path) {
    const subscription = new Subscription();

    subscription.channel(this);
    subscription.path(path);

    return subscription;
  }
}
