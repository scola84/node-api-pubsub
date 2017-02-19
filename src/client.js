import { debuglog } from 'util';

export default class Client {
  constructor() {
    this._log = debuglog('pubsub');

    this._channel = null;
    this._connection = null;
    this._path = null;

    this._subRequest = null;
    this._subResponse = null;

    this._handleClose = () => this._close();
    this._handleOpen = () => this._open();

    this._handleAbort = () => this._abort();
    this._handleData = (d) => this._data(d);
    this._handleError = () => {};
    this._handleResponse = (r) => this._response(r);
  }

  destroy() {
    this._log('Client destroy()');

    this._unbindConnection();
    this._connection = null;

    this._unbindRequest();
    this._subRequest = null;

    this._unbindResponse();
    this._subResponse = null;
  }

  channel(value = null) {
    if (value === null) {
      return this._channel;
    }

    this._channel = value;
    return this;
  }

  connection(value = null) {
    if (value === null) {
      return this._connection;
    }

    this._connection = value;
    this._bindConnection();

    return this;
  }

  path(value = null) {
    if (value === null) {
      return this._path;
    }

    this._path = value;
    return this;
  }

  publish(data) {
    this._log('Client publish(%s)', data);

    const pubRequest = this._connection
      .request()
      .path(this._path)
      .method('POST');

    pubRequest.end(data);
  }

  _bindConnection() {
    if (this._connection) {
      this._connection.on('close', this._handleClose);
      this._connection.on('open', this._handleOpen);
    }
  }

  _unbindConnection() {
    if (this._connection) {
      this._connection.removeListener('close', this._handleClose);
      this._connection.removeListener('open', this._handleOpen);
    }
  }

  _bindRequest() {
    if (this._subRequest) {
      this._subRequest.on('abort', this._handleAbort);
      this._subRequest.on('error', this._handleError);
      this._subRequest.on('response', this._handleResponse);
    }
  }

  _unbindRequest() {
    if (this._subRequest) {
      this._subRequest.removeListener('abort', this._handleAbort);
      this._subRequest.removeListener('error', this._handleError);
      this._subRequest.removeListener('response', this._handleResponse);
    }
  }

  _bindResponse() {
    if (this._subResponse) {
      this._subResponse.on('abort', this._handleAbort);
      this._subResponse.on('data', this._handleData);
      this._subResponse.on('error', this._handleError);
    }
  }

  _unbindResponse() {
    if (this._subResponse) {
      this._subResponse.removeListener('abort', this._handleAbort);
      this._subResponse.removeListener('data', this._handleData);
      this._subResponse.removeListener('error', this._handleError);
    }
  }

  _close() {
    this._log('Client _close()');
    this._abort();
  }

  _open() {
    this._log('Client _open()');

    if (this._subRequest) {
      return;
    }

    this._subRequest = this._connection
      .request()
      .path(this._path);

    this._bindRequest();
    this._subRequest.write('');
  }

  _abort() {
    this._log('Client _abort()');

    if (this._subRequest) {
      this._unbindRequest();
      this._subRequest = null;
    }

    if (this._subResponse) {
      this._unbindResponse();
      this._subResponse = null;
    }
  }

  _data(data) {
    this._log('Client _data(%s)', data);
    this._channel.up(data);
  }

  _response(value = null) {
    if (value === null) {
      return this._subResponse;
    }

    this._subResponse = value;
    this._bindResponse();

    return this;
  }
}