export default class FanOut {
  publish(subscriptions, data) {
    subscriptions.forEach((subscription) => {
      subscription.publish(data);
    });
  }
}
