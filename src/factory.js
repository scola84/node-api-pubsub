import Channel from './channel';
import { debuglog } from 'util';

export default class PubSubFactory {
  constructor() {
    this._log = debuglog('pubsub');
    this._channels = new Map();
  }

  destroy() {
    this._log('PubSub destroy');

    this._channels.forEach((channel) => {
      channel.destroy();
    });

    this._channels.clear();
  }

  connection(value = null) {
    if (value === null) {
      return this._connection;
    }

    this._connection = value;
    return this;
  }

  create(path) {
    this._log('PubSub channel %s', path);

    if (!this._channels.has(path)) {
      this._channels
        .set(path, this._channel(path));
    }

    return this._channels.get(path);
  }

  open() {
    this._log('PubSub open');

    if (this._connection) {
      this._connection.open();
    }
  }

  _channel(path) {
    const channel = new Channel();

    channel.path(path);
    channel.client(this._connection);

    return channel;
  }
}
