import AbstractSubscription from './abstract';

export default class ListSubscription extends AbstractSubscription {
  publish(data) {
    this._log('ListSubscription publish(%s)', data);
    
    this._publishers.forEach((publisher) => {
      publisher.publish(data);
    });

    return this;
  }
}
