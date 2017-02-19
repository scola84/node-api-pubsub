import { debuglog } from 'util';

export default class Publisher {
  constructor() {
    this._log = debuglog('pubsub');

    this._subscription = null;
    this._request = null;
    this._response = null;

    this._handleAbort = () => this.destroy();
    this._handleEnd = () => this.destroy();
    this._handleError = () => this.destroy();
  }

  destroy() {
    this._log('Publisher destroy');

    this._unbindRequest();
    this._unbindResponse();

    this._subscription.unsubscribe(this._request);
    this._subscription = null;

    this._request.destroy();
    this._request = null;

    this._response.destroy();
    this._response = null;
  }

  subscription(value = null) {
    if (value === null) {
      return this._subscription;
    }

    this._subscription = value;
    return this;
  }

  request(value = null) {
    if (value === null) {
      return this._request;
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

    if (this._response) {
      this._unbindResponse();
      this._response.destroy();
    }

    this._response = value;
    this._bindResponse();

    return this;
  }

  publish(data) {
    this._log('Publisher publish %j', data);

    this._response
      .status(200)
      .header('x-change', 1)
      .header('x-etag', false)
      .header('x-total', false)
      .write(data);

    return this;
  }

  _bindRequest() {
    this._request.on('abort', this._handleAbort);
    this._request.on('end', this._handleEnd);
    this._request.on('error', this._handleError);
  }

  _unbindRequest() {
    this._request.removeListener('abort', this._handleAbort);
    this._request.removeListener('end', this._handleEnd);
    this._request.removeListener('error', this._handleError);
  }

  _bindResponse() {
    this._response.on('error', this._handleError);
  }

  _unbindResponse() {
    this._response.removeListener('error', this._handleError);
  }
}
