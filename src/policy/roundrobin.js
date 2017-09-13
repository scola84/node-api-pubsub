export default class RoundRobin {
  constructor() {
    this._pointer = 0;
  }

  publish(subscriptions, data) {
    const values = Array.from(subscriptions.values());

    if (typeof values[this._pointer] === 'undefined') {
      this._pointer = 0;
    }

    if (typeof values[this._pointer] !== 'undefined') {
      values[this._pointer].publish(data);
    }

    this._pointer += 1;
  }
}
