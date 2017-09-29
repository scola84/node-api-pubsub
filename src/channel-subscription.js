import ip from 'ip';
import { debuglog } from 'util';

export default class ChannelSubscription {
  constructor() {
    this._log = debuglog('pubsub');

    this._channel = null;
    this._request = null;
    this._response = null;

    this._handleAbort = () => this.destroy();
    this._handleEnd = () => this.destroy();
    this._handleError = () => this.destroy();
  }

  destroy() {
    this._log('ChannelSubscription destroy');

    this._unbindRequest();
    this._unbindResponse();

    this._request.destroy();
    this._response.destroy();

    this._channel.unsubscribe(this._request);
  }

  channel(value = null) {
    if (value === null) {
      return this._channel;
    }

    this._channel = value;
    return this;
  }

  request(value = null) {
    if (value === null) {
      return this._request;
    }

    if (value === this._request) {
      return this;
    }

    if (this._request) {
      this._unbindRequest();
      this._request.destroy();
    }

    this._request = value;
    this._bindRequest();

    return this;
  }

  response(value = null) {
    if (value === null) {
      return this._response;
    }

    if (value === this._response) {
      return this;
    }

    if (this._response) {
      this._unbindResponse();
      this._response.destroy();
    }

    this._response = value;
    this._bindResponse();

    return this;
  }

  publish(data = {}) {
    this._log('ChannelSubscription publish data=%j id=%d',
      data, this._id());

    if (data.id && data.id !== this._id()) {
      return this;
    }

    this._response
      .status(200)
      .header('x-etag', false)
      .header('x-publish', 1)
      .header('x-total', false)
      .write(data);

    this._response
      .header('x-publish', false);

    return this;
  }

  _bindRequest() {
    if (this._request) {
      this._request.setMaxListeners(this._request.getMaxListeners() + 1);
      this._request.on('abort', this._handleAbort);
      this._request.on('end', this._handleEnd);
      this._request.on('error', this._handleError);
    }
  }

  _unbindRequest() {
    if (this._request) {
      this._request.setMaxListeners(this._request.getMaxListeners() - 1);
      this._request.removeListener('abort', this._handleAbort);
      this._request.removeListener('end', this._handleEnd);
      this._request.removeListener('error', this._handleError);
    }
  }

  _bindResponse() {
    if (this._response) {
      this._response.setMaxListeners(this._response.getMaxListeners() + 1);
      this._response.on('error', this._handleError);
    }
  }

  _unbindResponse() {
    if (this._response) {
      this._response.setMaxListeners(this._response.getMaxListeners() - 1);
      this._response.removeListener('error', this._handleError);
    }
  }

  _id() {
    return ip.toLong(this._request.address().address);
  }
}
