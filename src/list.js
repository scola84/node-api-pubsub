import AbstractSubscription from './abstract';

export default class ListSubscription extends AbstractSubscription {
  publish(path, data) {
    this._log('ListSubscription publish %s %j (%s)',
      path, data, this._path);

    this._publishers.forEach((publisher) => {
      publisher.publish(data);
    });

    return this;
  }
}
