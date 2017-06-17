import { debuglog } from 'util';
import Channel from './channel';
import Client from './client';

export default class PubSub {
  constructor() {
    this._log = debuglog('pubsub');

    this._channels = new Map();
    this._client = null;
    this._connection = null;
  }

  destroy() {
    this._log('PubSub destroy');

    this.close();

    if (this._client) {
      this._client.destroy();
    }

    this._channels.forEach((channel) => {
      channel.destroy();
    });

    this._channels.clear();
  }

  channel(path) {
    if (this._channels.has(path) === false) {
      this._channels.set(path, new Channel());
    }

    return this._channels.get(path);
  }

  client() {
    if (this._client === null) {
      this._client = new Client();
      this._client.connection(this._connection);
    }

    return this._client;
  }

  connection(value = null) {
    if (value === null) {
      return this._connection;
    }

    this._connection = value;
    return this;
  }

  close() {
    this._log('PubSub close connection=%s',
      Boolean(this._connection));

    if (this._connection !== null) {
      this._connection.close();
    }
  }

  open() {
    this._log('PubSub open connection=%s',
      Boolean(this._connection));

    if (this._connection !== null) {
      this._connection.open();
    }
  }

  publish(path, data) {
    this._log('PubSub publish path=%s data=%j', path, data);

    this
      .channel(path)
      .publish(data);
  }
}
