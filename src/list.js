import AbstractSubscription from './abstract';

export default class ListSubscription extends AbstractSubscription {
  publish(data, connection) {
    this._log('ListSubscription publish %j (%s)',
      data, this._path);

    this._publishers.forEach((publisher) => {
      publisher.publish(data, connection);
    });

    return this;
  }

  unsubscribe(request) {
    super.unsubscribe(request);

    if (this._publishers.size === 0) {
      this._channel.list(this._path, false);
    }
  }
}
