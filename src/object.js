import AbstractSubscription from './abstract';

export default class ObjectSubscription extends AbstractSubscription {
  publish(data, connection) {
    this._log('ObjectSubscription publish %j (%s)',
      data, this._path);

    if (data.path && data.path !== this._path) {
      return this;
    }

    this._publishers.forEach((publisher) => {
      publisher.publish(data, connection);
    });

    return this;
  }

  unsubscribe(request) {
    super.unsubscribe(request);

    if (this._publishers.size === 0) {
      this._channel.object(this._path, false);
    }
  }
}
