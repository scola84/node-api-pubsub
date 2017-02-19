import Client from './client';
import ListSubscription from './list';
import ObjectSubscription from './object';
import { debuglog } from 'util';

export default class Channel {
  constructor() {
    this._log = debuglog('pubsub');

    this._path = null;
    this._client = null;
    this._lists = new Map();
    this._objects = new Map();
  }

  destroy() {
    if (this._client) {
      this._client.destroy();
      this._client = null;
    }

    this._lists.forEach((list) => {
      list.destroy();
    });

    this._objects.forEach((object) => {
      object.destroy();
    });

    this._lists.clear();
    this._objects.clear();
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
    if (!this._lists.has(path)) {
      this._lists.set(path, new ListSubscription()
        .path(path));
    }

    return this._lists.get(path);
  }

  object(path) {
    if (!this._objects.has(path)) {
      this._objects.set(path, new ObjectSubscription()
        .path(path));
    }

    return this._objects.get(path);
  }

  publish(data) {
    if (this._client) {
      this.down(data);
    } else {
      this.up(data);
    }

    return this;
  }

  up(data) {
    this._log('Channel up(%s)', data);

    this._lists.forEach((list) => {
      list.publish(data);
    });

    this._objects.forEach((object) => {
      object.publish(data);
    });
  }

  down(data) {
    this._log('Channel down(%s)', data);
    this._client.publish(data);
  }
}