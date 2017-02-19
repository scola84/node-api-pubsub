import AbstractSubscription from './abstract';

export default class ObjectSubscription extends AbstractSubscription {
  publish(data) {
    this._log('ObjectSubscription publish(%s)', data);
    
    if (data.path !== this._path) {
      return this;
    }

    this._publishers.forEach((publisher) => {
      publisher.publish(data);
    });

    return this;
  }
}
