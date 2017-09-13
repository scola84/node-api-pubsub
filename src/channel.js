import { debuglog } from 'util';
import ChannelSubscription from './channel-subscription';
import FanOut from './policy/fanout';
import RoundRobin from './policy/roundrobin';

const policies = {
  fo: FanOut,
  rr: RoundRobin
};

export default class Channel {
  constructor() {
    this._log = debuglog('pubsub');
    this._policies = {};
    this._subscriptions = new Map();
  }

  destroy() {
    this._log('Channel destroy');

    this._subscriptions.forEach((subscription) => {
      subscription.destroy();
    });

    this._subscriptions.clear();
  }

  subscribe(request, response) {
    const connection = request.connection();
    let subscription = this._subscriptions.get(connection);

    if (subscription instanceof ChannelSubscription === false) {
      subscription = new ChannelSubscription()
        .channel(this);

      this._subscriptions.set(connection, subscription);
    }

    subscription
      .request(request)
      .response(response);

    request.resume();

    this._log('Channel subscribe path=%s #sub=%d',
      request.path(),
      this._subscriptions.size);

    return this;
  }

  unsubscribe(request) {
    this._subscriptions.delete(request.connection());

    this._log('Channel unsubscribe path=%s #sub=%d',
      request.path(),
      this._subscriptions.size);

    return this;
  }

  publish(data) {
    this._log('Channel publish data=%j #sub=%d',
      data, this._subscriptions.size);

    const policy = data.policy || 'fo';

    if (typeof this._policies[policy] === 'undefined') {
      this._policies[policy] = new policies[policy]();
    }

    this._policies[policy]
      .publish(this._subscriptions, data);
  }
}
