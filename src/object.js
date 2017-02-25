import AbstractSubscription from './abstract';

export default class ObjectSubscription extends AbstractSubscription {
  publish(path, data) {
    this._log('ObjectSubscription publish %s %j (%s)',
      path, data, this._path);

    if (path !== this._path) {
      return this;
    }

    this._publishers.forEach((publisher) => {
      publisher.publish(data);
    });

    return this;
  }
}
