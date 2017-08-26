import { debuglog } from 'util';

export default class ClientSubscription {
  constructor() {
    this._log = debuglog('pubsub');

    this._client = null;
    this._connection = null;
    this._path = null;

    this._request = null;
    this._response = null;

    this._handleClose = () => this._close();
    this._handleOpen = () => this._open();

    this._handleAbort = () => this._abort();
    this._handleData = (d) => this._data(d);
    this._handleError = () => {};
    this._handleResponse = (r) => this._res(r);
  }

  destroy() {
    this._log('ClientSubscription destroy');

    this._unbindConnection();
    this._unbindRequest();
    this._unbindResponse();
  }

  client(value = null) {
    if (value === null) {
      return this._client;
    }

    this._client = value;
    return this;
  }

  connection(value = null) {
    if (value === null) {
      return this._connection;
    }

    this._connection = value;
    this._bindConnection();

    if (this._connection.connected() === true) {
      this._open();
    }

    return this;
  }

  path(value = null) {
    if (value === null) {
      return this._path;
    }

    this._path = value;
    return this;
  }

  _bindConnection() {
    if (this._connection) {
      this._connection.setMaxListeners(this._connection.getMaxListeners() + 1);
      this._connection.on('close', this._handleClose);
      this._connection.on('open', this._handleOpen);
    }
  }

  _unbindConnection() {
    if (this._connection) {
      this._connection.setMaxListeners(this._connection.getMaxListeners() - 1);
      this._connection.removeListener('close', this._handleClose);
      this._connection.removeListener('open', this._handleOpen);
    }
  }

  _bindRequest() {
    if (this._request) {
      this._request.setMaxListeners(this._request.getMaxListeners() + 1);
      this._request.on('abort', this._handleAbort);
      this._request.on('error', this._handleError);
      this._request.on('response', this._handleResponse);
    }
  }

  _unbindRequest() {
    if (this._request) {
      this._request.setMaxListeners(this._request.getMaxListeners() - 1);
      this._request.removeListener('abort', this._handleAbort);
      this._request.removeListener('error', this._handleError);
      this._request.removeListener('response', this._handleResponse);
    }
  }

  _bindResponse() {
    if (this._response) {
      this._response.setMaxListeners(this._response.getMaxListeners() + 1);
      this._response.on('abort', this._handleAbort);
      this._response.on('data', this._handleData);
      this._response.on('error', this._handleError);
    }
  }

  _unbindResponse() {
    if (this._response) {
      this._response.setMaxListeners(this._response.getMaxListeners() - 1);
      this._response.removeListener('abort', this._handleAbort);
      this._response.removeListener('data', this._handleData);
      this._response.removeListener('error', this._handleError);
    }
  }

  _close() {
    this._log('ClientSubscription _close path=%s', this._path);
    this._abort();
  }

  _open() {
    this._log('ClientSubscription _open path=%s', this._path);

    if (this._request) {
      return;
    }

    this._request = this._connection
      .request()
      .path(this._path);

    this._bindRequest();
    this._request.write('');
  }

  _abort() {
    this._log('ClientSubscription _abort path=%s', this._path);

    if (this._request) {
      this._unbindRequest();
      this._request = null;
    }

    if (this._response) {
      this._unbindResponse();
      this._response = null;
    }
  }

  _data(data) {
    this._log('ClientSubscription _data path=%s data=%j',
      this._path, data);

    this._client.emit(data.event, data.data);
  }

  _res(value = null) {
    this._log('ClientSubscription _res path=%s', this._path);

    this._response = value;
    this._bindResponse();

    return this;
  }
}
