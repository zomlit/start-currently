/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
"use strict";

var $protobuf = require("protobufjs/minimal");

// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

$root.spotify = (function() {

    /**
     * Namespace spotify.
     * @exports spotify
     * @namespace
     */
    var spotify = {};

    spotify.canvas = (function() {

        /**
         * Namespace canvas.
         * @memberof spotify
         * @namespace
         */
        var canvas = {};

        canvas.CanvasRequest = (function() {

            /**
             * Properties of a CanvasRequest.
             * @memberof spotify.canvas
             * @interface ICanvasRequest
             * @property {Array.<spotify.canvas.CanvasRequest.ITrack>|null} [tracks] CanvasRequest tracks
             */

            /**
             * Constructs a new CanvasRequest.
             * @memberof spotify.canvas
             * @classdesc Represents a CanvasRequest.
             * @implements ICanvasRequest
             * @constructor
             * @param {spotify.canvas.ICanvasRequest=} [properties] Properties to set
             */
            function CanvasRequest(properties) {
                this.tracks = [];
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * CanvasRequest tracks.
             * @member {Array.<spotify.canvas.CanvasRequest.ITrack>} tracks
             * @memberof spotify.canvas.CanvasRequest
             * @instance
             */
            CanvasRequest.prototype.tracks = $util.emptyArray;

            /**
             * Creates a new CanvasRequest instance using the specified properties.
             * @function create
             * @memberof spotify.canvas.CanvasRequest
             * @static
             * @param {spotify.canvas.ICanvasRequest=} [properties] Properties to set
             * @returns {spotify.canvas.CanvasRequest} CanvasRequest instance
             */
            CanvasRequest.create = function create(properties) {
                return new CanvasRequest(properties);
            };

            /**
             * Encodes the specified CanvasRequest message. Does not implicitly {@link spotify.canvas.CanvasRequest.verify|verify} messages.
             * @function encode
             * @memberof spotify.canvas.CanvasRequest
             * @static
             * @param {spotify.canvas.ICanvasRequest} message CanvasRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            CanvasRequest.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.tracks != null && message.tracks.length)
                    for (var i = 0; i < message.tracks.length; ++i)
                        $root.spotify.canvas.CanvasRequest.Track.encode(message.tracks[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified CanvasRequest message, length delimited. Does not implicitly {@link spotify.canvas.CanvasRequest.verify|verify} messages.
             * @function encodeDelimited
             * @memberof spotify.canvas.CanvasRequest
             * @static
             * @param {spotify.canvas.ICanvasRequest} message CanvasRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            CanvasRequest.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a CanvasRequest message from the specified reader or buffer.
             * @function decode
             * @memberof spotify.canvas.CanvasRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {spotify.canvas.CanvasRequest} CanvasRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            CanvasRequest.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.spotify.canvas.CanvasRequest();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1: {
                            if (!(message.tracks && message.tracks.length))
                                message.tracks = [];
                            message.tracks.push($root.spotify.canvas.CanvasRequest.Track.decode(reader, reader.uint32()));
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a CanvasRequest message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof spotify.canvas.CanvasRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {spotify.canvas.CanvasRequest} CanvasRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            CanvasRequest.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a CanvasRequest message.
             * @function verify
             * @memberof spotify.canvas.CanvasRequest
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            CanvasRequest.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.tracks != null && message.hasOwnProperty("tracks")) {
                    if (!Array.isArray(message.tracks))
                        return "tracks: array expected";
                    for (var i = 0; i < message.tracks.length; ++i) {
                        var error = $root.spotify.canvas.CanvasRequest.Track.verify(message.tracks[i]);
                        if (error)
                            return "tracks." + error;
                    }
                }
                return null;
            };

            /**
             * Creates a CanvasRequest message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof spotify.canvas.CanvasRequest
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {spotify.canvas.CanvasRequest} CanvasRequest
             */
            CanvasRequest.fromObject = function fromObject(object) {
                if (object instanceof $root.spotify.canvas.CanvasRequest)
                    return object;
                var message = new $root.spotify.canvas.CanvasRequest();
                if (object.tracks) {
                    if (!Array.isArray(object.tracks))
                        throw TypeError(".spotify.canvas.CanvasRequest.tracks: array expected");
                    message.tracks = [];
                    for (var i = 0; i < object.tracks.length; ++i) {
                        if (typeof object.tracks[i] !== "object")
                            throw TypeError(".spotify.canvas.CanvasRequest.tracks: object expected");
                        message.tracks[i] = $root.spotify.canvas.CanvasRequest.Track.fromObject(object.tracks[i]);
                    }
                }
                return message;
            };

            /**
             * Creates a plain object from a CanvasRequest message. Also converts values to other types if specified.
             * @function toObject
             * @memberof spotify.canvas.CanvasRequest
             * @static
             * @param {spotify.canvas.CanvasRequest} message CanvasRequest
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            CanvasRequest.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.arrays || options.defaults)
                    object.tracks = [];
                if (message.tracks && message.tracks.length) {
                    object.tracks = [];
                    for (var j = 0; j < message.tracks.length; ++j)
                        object.tracks[j] = $root.spotify.canvas.CanvasRequest.Track.toObject(message.tracks[j], options);
                }
                return object;
            };

            /**
             * Converts this CanvasRequest to JSON.
             * @function toJSON
             * @memberof spotify.canvas.CanvasRequest
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            CanvasRequest.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for CanvasRequest
             * @function getTypeUrl
             * @memberof spotify.canvas.CanvasRequest
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            CanvasRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/spotify.canvas.CanvasRequest";
            };

            CanvasRequest.Track = (function() {

                /**
                 * Properties of a Track.
                 * @memberof spotify.canvas.CanvasRequest
                 * @interface ITrack
                 * @property {string|null} [trackUri] Track trackUri
                 */

                /**
                 * Constructs a new Track.
                 * @memberof spotify.canvas.CanvasRequest
                 * @classdesc Represents a Track.
                 * @implements ITrack
                 * @constructor
                 * @param {spotify.canvas.CanvasRequest.ITrack=} [properties] Properties to set
                 */
                function Track(properties) {
                    if (properties)
                        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * Track trackUri.
                 * @member {string} trackUri
                 * @memberof spotify.canvas.CanvasRequest.Track
                 * @instance
                 */
                Track.prototype.trackUri = "";

                /**
                 * Creates a new Track instance using the specified properties.
                 * @function create
                 * @memberof spotify.canvas.CanvasRequest.Track
                 * @static
                 * @param {spotify.canvas.CanvasRequest.ITrack=} [properties] Properties to set
                 * @returns {spotify.canvas.CanvasRequest.Track} Track instance
                 */
                Track.create = function create(properties) {
                    return new Track(properties);
                };

                /**
                 * Encodes the specified Track message. Does not implicitly {@link spotify.canvas.CanvasRequest.Track.verify|verify} messages.
                 * @function encode
                 * @memberof spotify.canvas.CanvasRequest.Track
                 * @static
                 * @param {spotify.canvas.CanvasRequest.ITrack} message Track message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Track.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.trackUri != null && Object.hasOwnProperty.call(message, "trackUri"))
                        writer.uint32(/* id 1, wireType 2 =*/10).string(message.trackUri);
                    return writer;
                };

                /**
                 * Encodes the specified Track message, length delimited. Does not implicitly {@link spotify.canvas.CanvasRequest.Track.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof spotify.canvas.CanvasRequest.Track
                 * @static
                 * @param {spotify.canvas.CanvasRequest.ITrack} message Track message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Track.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a Track message from the specified reader or buffer.
                 * @function decode
                 * @memberof spotify.canvas.CanvasRequest.Track
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {spotify.canvas.CanvasRequest.Track} Track
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Track.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.spotify.canvas.CanvasRequest.Track();
                    while (reader.pos < end) {
                        var tag = reader.uint32();
                        switch (tag >>> 3) {
                        case 1: {
                                message.trackUri = reader.string();
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a Track message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof spotify.canvas.CanvasRequest.Track
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {spotify.canvas.CanvasRequest.Track} Track
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Track.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a Track message.
                 * @function verify
                 * @memberof spotify.canvas.CanvasRequest.Track
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                Track.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.trackUri != null && message.hasOwnProperty("trackUri"))
                        if (!$util.isString(message.trackUri))
                            return "trackUri: string expected";
                    return null;
                };

                /**
                 * Creates a Track message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof spotify.canvas.CanvasRequest.Track
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {spotify.canvas.CanvasRequest.Track} Track
                 */
                Track.fromObject = function fromObject(object) {
                    if (object instanceof $root.spotify.canvas.CanvasRequest.Track)
                        return object;
                    var message = new $root.spotify.canvas.CanvasRequest.Track();
                    if (object.trackUri != null)
                        message.trackUri = String(object.trackUri);
                    return message;
                };

                /**
                 * Creates a plain object from a Track message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof spotify.canvas.CanvasRequest.Track
                 * @static
                 * @param {spotify.canvas.CanvasRequest.Track} message Track
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                Track.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    var object = {};
                    if (options.defaults)
                        object.trackUri = "";
                    if (message.trackUri != null && message.hasOwnProperty("trackUri"))
                        object.trackUri = message.trackUri;
                    return object;
                };

                /**
                 * Converts this Track to JSON.
                 * @function toJSON
                 * @memberof spotify.canvas.CanvasRequest.Track
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                Track.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for Track
                 * @function getTypeUrl
                 * @memberof spotify.canvas.CanvasRequest.Track
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                Track.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/spotify.canvas.CanvasRequest.Track";
                };

                return Track;
            })();

            return CanvasRequest;
        })();

        canvas.CanvasResponse = (function() {

            /**
             * Properties of a CanvasResponse.
             * @memberof spotify.canvas
             * @interface ICanvasResponse
             * @property {Array.<spotify.canvas.CanvasResponse.ICanvas>|null} [canvases] CanvasResponse canvases
             */

            /**
             * Constructs a new CanvasResponse.
             * @memberof spotify.canvas
             * @classdesc Represents a CanvasResponse.
             * @implements ICanvasResponse
             * @constructor
             * @param {spotify.canvas.ICanvasResponse=} [properties] Properties to set
             */
            function CanvasResponse(properties) {
                this.canvases = [];
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * CanvasResponse canvases.
             * @member {Array.<spotify.canvas.CanvasResponse.ICanvas>} canvases
             * @memberof spotify.canvas.CanvasResponse
             * @instance
             */
            CanvasResponse.prototype.canvases = $util.emptyArray;

            /**
             * Creates a new CanvasResponse instance using the specified properties.
             * @function create
             * @memberof spotify.canvas.CanvasResponse
             * @static
             * @param {spotify.canvas.ICanvasResponse=} [properties] Properties to set
             * @returns {spotify.canvas.CanvasResponse} CanvasResponse instance
             */
            CanvasResponse.create = function create(properties) {
                return new CanvasResponse(properties);
            };

            /**
             * Encodes the specified CanvasResponse message. Does not implicitly {@link spotify.canvas.CanvasResponse.verify|verify} messages.
             * @function encode
             * @memberof spotify.canvas.CanvasResponse
             * @static
             * @param {spotify.canvas.ICanvasResponse} message CanvasResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            CanvasResponse.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.canvases != null && message.canvases.length)
                    for (var i = 0; i < message.canvases.length; ++i)
                        $root.spotify.canvas.CanvasResponse.Canvas.encode(message.canvases[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified CanvasResponse message, length delimited. Does not implicitly {@link spotify.canvas.CanvasResponse.verify|verify} messages.
             * @function encodeDelimited
             * @memberof spotify.canvas.CanvasResponse
             * @static
             * @param {spotify.canvas.ICanvasResponse} message CanvasResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            CanvasResponse.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a CanvasResponse message from the specified reader or buffer.
             * @function decode
             * @memberof spotify.canvas.CanvasResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {spotify.canvas.CanvasResponse} CanvasResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            CanvasResponse.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.spotify.canvas.CanvasResponse();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1: {
                            if (!(message.canvases && message.canvases.length))
                                message.canvases = [];
                            message.canvases.push($root.spotify.canvas.CanvasResponse.Canvas.decode(reader, reader.uint32()));
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a CanvasResponse message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof spotify.canvas.CanvasResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {spotify.canvas.CanvasResponse} CanvasResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            CanvasResponse.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a CanvasResponse message.
             * @function verify
             * @memberof spotify.canvas.CanvasResponse
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            CanvasResponse.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.canvases != null && message.hasOwnProperty("canvases")) {
                    if (!Array.isArray(message.canvases))
                        return "canvases: array expected";
                    for (var i = 0; i < message.canvases.length; ++i) {
                        var error = $root.spotify.canvas.CanvasResponse.Canvas.verify(message.canvases[i]);
                        if (error)
                            return "canvases." + error;
                    }
                }
                return null;
            };

            /**
             * Creates a CanvasResponse message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof spotify.canvas.CanvasResponse
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {spotify.canvas.CanvasResponse} CanvasResponse
             */
            CanvasResponse.fromObject = function fromObject(object) {
                if (object instanceof $root.spotify.canvas.CanvasResponse)
                    return object;
                var message = new $root.spotify.canvas.CanvasResponse();
                if (object.canvases) {
                    if (!Array.isArray(object.canvases))
                        throw TypeError(".spotify.canvas.CanvasResponse.canvases: array expected");
                    message.canvases = [];
                    for (var i = 0; i < object.canvases.length; ++i) {
                        if (typeof object.canvases[i] !== "object")
                            throw TypeError(".spotify.canvas.CanvasResponse.canvases: object expected");
                        message.canvases[i] = $root.spotify.canvas.CanvasResponse.Canvas.fromObject(object.canvases[i]);
                    }
                }
                return message;
            };

            /**
             * Creates a plain object from a CanvasResponse message. Also converts values to other types if specified.
             * @function toObject
             * @memberof spotify.canvas.CanvasResponse
             * @static
             * @param {spotify.canvas.CanvasResponse} message CanvasResponse
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            CanvasResponse.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.arrays || options.defaults)
                    object.canvases = [];
                if (message.canvases && message.canvases.length) {
                    object.canvases = [];
                    for (var j = 0; j < message.canvases.length; ++j)
                        object.canvases[j] = $root.spotify.canvas.CanvasResponse.Canvas.toObject(message.canvases[j], options);
                }
                return object;
            };

            /**
             * Converts this CanvasResponse to JSON.
             * @function toJSON
             * @memberof spotify.canvas.CanvasResponse
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            CanvasResponse.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for CanvasResponse
             * @function getTypeUrl
             * @memberof spotify.canvas.CanvasResponse
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            CanvasResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/spotify.canvas.CanvasResponse";
            };

            CanvasResponse.Canvas = (function() {

                /**
                 * Properties of a Canvas.
                 * @memberof spotify.canvas.CanvasResponse
                 * @interface ICanvas
                 * @property {string|null} [id] Canvas id
                 * @property {string|null} [canvasUrl] Canvas canvasUrl
                 * @property {string|null} [trackUri] Canvas trackUri
                 * @property {spotify.canvas.CanvasResponse.Canvas.IArtist|null} [artist] Canvas artist
                 * @property {string|null} [otherId] Canvas otherId
                 * @property {string|null} [canvasUri] Canvas canvasUri
                 */

                /**
                 * Constructs a new Canvas.
                 * @memberof spotify.canvas.CanvasResponse
                 * @classdesc Represents a Canvas.
                 * @implements ICanvas
                 * @constructor
                 * @param {spotify.canvas.CanvasResponse.ICanvas=} [properties] Properties to set
                 */
                function Canvas(properties) {
                    if (properties)
                        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * Canvas id.
                 * @member {string} id
                 * @memberof spotify.canvas.CanvasResponse.Canvas
                 * @instance
                 */
                Canvas.prototype.id = "";

                /**
                 * Canvas canvasUrl.
                 * @member {string} canvasUrl
                 * @memberof spotify.canvas.CanvasResponse.Canvas
                 * @instance
                 */
                Canvas.prototype.canvasUrl = "";

                /**
                 * Canvas trackUri.
                 * @member {string} trackUri
                 * @memberof spotify.canvas.CanvasResponse.Canvas
                 * @instance
                 */
                Canvas.prototype.trackUri = "";

                /**
                 * Canvas artist.
                 * @member {spotify.canvas.CanvasResponse.Canvas.IArtist|null|undefined} artist
                 * @memberof spotify.canvas.CanvasResponse.Canvas
                 * @instance
                 */
                Canvas.prototype.artist = null;

                /**
                 * Canvas otherId.
                 * @member {string} otherId
                 * @memberof spotify.canvas.CanvasResponse.Canvas
                 * @instance
                 */
                Canvas.prototype.otherId = "";

                /**
                 * Canvas canvasUri.
                 * @member {string} canvasUri
                 * @memberof spotify.canvas.CanvasResponse.Canvas
                 * @instance
                 */
                Canvas.prototype.canvasUri = "";

                /**
                 * Creates a new Canvas instance using the specified properties.
                 * @function create
                 * @memberof spotify.canvas.CanvasResponse.Canvas
                 * @static
                 * @param {spotify.canvas.CanvasResponse.ICanvas=} [properties] Properties to set
                 * @returns {spotify.canvas.CanvasResponse.Canvas} Canvas instance
                 */
                Canvas.create = function create(properties) {
                    return new Canvas(properties);
                };

                /**
                 * Encodes the specified Canvas message. Does not implicitly {@link spotify.canvas.CanvasResponse.Canvas.verify|verify} messages.
                 * @function encode
                 * @memberof spotify.canvas.CanvasResponse.Canvas
                 * @static
                 * @param {spotify.canvas.CanvasResponse.ICanvas} message Canvas message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Canvas.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                        writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
                    if (message.canvasUrl != null && Object.hasOwnProperty.call(message, "canvasUrl"))
                        writer.uint32(/* id 2, wireType 2 =*/18).string(message.canvasUrl);
                    if (message.trackUri != null && Object.hasOwnProperty.call(message, "trackUri"))
                        writer.uint32(/* id 5, wireType 2 =*/42).string(message.trackUri);
                    if (message.artist != null && Object.hasOwnProperty.call(message, "artist"))
                        $root.spotify.canvas.CanvasResponse.Canvas.Artist.encode(message.artist, writer.uint32(/* id 6, wireType 2 =*/50).fork()).ldelim();
                    if (message.otherId != null && Object.hasOwnProperty.call(message, "otherId"))
                        writer.uint32(/* id 9, wireType 2 =*/74).string(message.otherId);
                    if (message.canvasUri != null && Object.hasOwnProperty.call(message, "canvasUri"))
                        writer.uint32(/* id 11, wireType 2 =*/90).string(message.canvasUri);
                    return writer;
                };

                /**
                 * Encodes the specified Canvas message, length delimited. Does not implicitly {@link spotify.canvas.CanvasResponse.Canvas.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof spotify.canvas.CanvasResponse.Canvas
                 * @static
                 * @param {spotify.canvas.CanvasResponse.ICanvas} message Canvas message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Canvas.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a Canvas message from the specified reader or buffer.
                 * @function decode
                 * @memberof spotify.canvas.CanvasResponse.Canvas
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {spotify.canvas.CanvasResponse.Canvas} Canvas
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Canvas.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.spotify.canvas.CanvasResponse.Canvas();
                    while (reader.pos < end) {
                        var tag = reader.uint32();
                        switch (tag >>> 3) {
                        case 1: {
                                message.id = reader.string();
                                break;
                            }
                        case 2: {
                                message.canvasUrl = reader.string();
                                break;
                            }
                        case 5: {
                                message.trackUri = reader.string();
                                break;
                            }
                        case 6: {
                                message.artist = $root.spotify.canvas.CanvasResponse.Canvas.Artist.decode(reader, reader.uint32());
                                break;
                            }
                        case 9: {
                                message.otherId = reader.string();
                                break;
                            }
                        case 11: {
                                message.canvasUri = reader.string();
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a Canvas message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof spotify.canvas.CanvasResponse.Canvas
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {spotify.canvas.CanvasResponse.Canvas} Canvas
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Canvas.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a Canvas message.
                 * @function verify
                 * @memberof spotify.canvas.CanvasResponse.Canvas
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                Canvas.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.id != null && message.hasOwnProperty("id"))
                        if (!$util.isString(message.id))
                            return "id: string expected";
                    if (message.canvasUrl != null && message.hasOwnProperty("canvasUrl"))
                        if (!$util.isString(message.canvasUrl))
                            return "canvasUrl: string expected";
                    if (message.trackUri != null && message.hasOwnProperty("trackUri"))
                        if (!$util.isString(message.trackUri))
                            return "trackUri: string expected";
                    if (message.artist != null && message.hasOwnProperty("artist")) {
                        var error = $root.spotify.canvas.CanvasResponse.Canvas.Artist.verify(message.artist);
                        if (error)
                            return "artist." + error;
                    }
                    if (message.otherId != null && message.hasOwnProperty("otherId"))
                        if (!$util.isString(message.otherId))
                            return "otherId: string expected";
                    if (message.canvasUri != null && message.hasOwnProperty("canvasUri"))
                        if (!$util.isString(message.canvasUri))
                            return "canvasUri: string expected";
                    return null;
                };

                /**
                 * Creates a Canvas message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof spotify.canvas.CanvasResponse.Canvas
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {spotify.canvas.CanvasResponse.Canvas} Canvas
                 */
                Canvas.fromObject = function fromObject(object) {
                    if (object instanceof $root.spotify.canvas.CanvasResponse.Canvas)
                        return object;
                    var message = new $root.spotify.canvas.CanvasResponse.Canvas();
                    if (object.id != null)
                        message.id = String(object.id);
                    if (object.canvasUrl != null)
                        message.canvasUrl = String(object.canvasUrl);
                    if (object.trackUri != null)
                        message.trackUri = String(object.trackUri);
                    if (object.artist != null) {
                        if (typeof object.artist !== "object")
                            throw TypeError(".spotify.canvas.CanvasResponse.Canvas.artist: object expected");
                        message.artist = $root.spotify.canvas.CanvasResponse.Canvas.Artist.fromObject(object.artist);
                    }
                    if (object.otherId != null)
                        message.otherId = String(object.otherId);
                    if (object.canvasUri != null)
                        message.canvasUri = String(object.canvasUri);
                    return message;
                };

                /**
                 * Creates a plain object from a Canvas message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof spotify.canvas.CanvasResponse.Canvas
                 * @static
                 * @param {spotify.canvas.CanvasResponse.Canvas} message Canvas
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                Canvas.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    var object = {};
                    if (options.defaults) {
                        object.id = "";
                        object.canvasUrl = "";
                        object.trackUri = "";
                        object.artist = null;
                        object.otherId = "";
                        object.canvasUri = "";
                    }
                    if (message.id != null && message.hasOwnProperty("id"))
                        object.id = message.id;
                    if (message.canvasUrl != null && message.hasOwnProperty("canvasUrl"))
                        object.canvasUrl = message.canvasUrl;
                    if (message.trackUri != null && message.hasOwnProperty("trackUri"))
                        object.trackUri = message.trackUri;
                    if (message.artist != null && message.hasOwnProperty("artist"))
                        object.artist = $root.spotify.canvas.CanvasResponse.Canvas.Artist.toObject(message.artist, options);
                    if (message.otherId != null && message.hasOwnProperty("otherId"))
                        object.otherId = message.otherId;
                    if (message.canvasUri != null && message.hasOwnProperty("canvasUri"))
                        object.canvasUri = message.canvasUri;
                    return object;
                };

                /**
                 * Converts this Canvas to JSON.
                 * @function toJSON
                 * @memberof spotify.canvas.CanvasResponse.Canvas
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                Canvas.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for Canvas
                 * @function getTypeUrl
                 * @memberof spotify.canvas.CanvasResponse.Canvas
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                Canvas.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/spotify.canvas.CanvasResponse.Canvas";
                };

                Canvas.Artist = (function() {

                    /**
                     * Properties of an Artist.
                     * @memberof spotify.canvas.CanvasResponse.Canvas
                     * @interface IArtist
                     * @property {string|null} [artistUri] Artist artistUri
                     * @property {string|null} [artistName] Artist artistName
                     * @property {string|null} [artistImgUrl] Artist artistImgUrl
                     */

                    /**
                     * Constructs a new Artist.
                     * @memberof spotify.canvas.CanvasResponse.Canvas
                     * @classdesc Represents an Artist.
                     * @implements IArtist
                     * @constructor
                     * @param {spotify.canvas.CanvasResponse.Canvas.IArtist=} [properties] Properties to set
                     */
                    function Artist(properties) {
                        if (properties)
                            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null)
                                    this[keys[i]] = properties[keys[i]];
                    }

                    /**
                     * Artist artistUri.
                     * @member {string} artistUri
                     * @memberof spotify.canvas.CanvasResponse.Canvas.Artist
                     * @instance
                     */
                    Artist.prototype.artistUri = "";

                    /**
                     * Artist artistName.
                     * @member {string} artistName
                     * @memberof spotify.canvas.CanvasResponse.Canvas.Artist
                     * @instance
                     */
                    Artist.prototype.artistName = "";

                    /**
                     * Artist artistImgUrl.
                     * @member {string} artistImgUrl
                     * @memberof spotify.canvas.CanvasResponse.Canvas.Artist
                     * @instance
                     */
                    Artist.prototype.artistImgUrl = "";

                    /**
                     * Creates a new Artist instance using the specified properties.
                     * @function create
                     * @memberof spotify.canvas.CanvasResponse.Canvas.Artist
                     * @static
                     * @param {spotify.canvas.CanvasResponse.Canvas.IArtist=} [properties] Properties to set
                     * @returns {spotify.canvas.CanvasResponse.Canvas.Artist} Artist instance
                     */
                    Artist.create = function create(properties) {
                        return new Artist(properties);
                    };

                    /**
                     * Encodes the specified Artist message. Does not implicitly {@link spotify.canvas.CanvasResponse.Canvas.Artist.verify|verify} messages.
                     * @function encode
                     * @memberof spotify.canvas.CanvasResponse.Canvas.Artist
                     * @static
                     * @param {spotify.canvas.CanvasResponse.Canvas.IArtist} message Artist message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    Artist.encode = function encode(message, writer) {
                        if (!writer)
                            writer = $Writer.create();
                        if (message.artistUri != null && Object.hasOwnProperty.call(message, "artistUri"))
                            writer.uint32(/* id 1, wireType 2 =*/10).string(message.artistUri);
                        if (message.artistName != null && Object.hasOwnProperty.call(message, "artistName"))
                            writer.uint32(/* id 2, wireType 2 =*/18).string(message.artistName);
                        if (message.artistImgUrl != null && Object.hasOwnProperty.call(message, "artistImgUrl"))
                            writer.uint32(/* id 3, wireType 2 =*/26).string(message.artistImgUrl);
                        return writer;
                    };

                    /**
                     * Encodes the specified Artist message, length delimited. Does not implicitly {@link spotify.canvas.CanvasResponse.Canvas.Artist.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof spotify.canvas.CanvasResponse.Canvas.Artist
                     * @static
                     * @param {spotify.canvas.CanvasResponse.Canvas.IArtist} message Artist message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    Artist.encodeDelimited = function encodeDelimited(message, writer) {
                        return this.encode(message, writer).ldelim();
                    };

                    /**
                     * Decodes an Artist message from the specified reader or buffer.
                     * @function decode
                     * @memberof spotify.canvas.CanvasResponse.Canvas.Artist
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {spotify.canvas.CanvasResponse.Canvas.Artist} Artist
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    Artist.decode = function decode(reader, length) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.spotify.canvas.CanvasResponse.Canvas.Artist();
                        while (reader.pos < end) {
                            var tag = reader.uint32();
                            switch (tag >>> 3) {
                            case 1: {
                                    message.artistUri = reader.string();
                                    break;
                                }
                            case 2: {
                                    message.artistName = reader.string();
                                    break;
                                }
                            case 3: {
                                    message.artistImgUrl = reader.string();
                                    break;
                                }
                            default:
                                reader.skipType(tag & 7);
                                break;
                            }
                        }
                        return message;
                    };

                    /**
                     * Decodes an Artist message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof spotify.canvas.CanvasResponse.Canvas.Artist
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {spotify.canvas.CanvasResponse.Canvas.Artist} Artist
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    Artist.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies an Artist message.
                     * @function verify
                     * @memberof spotify.canvas.CanvasResponse.Canvas.Artist
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    Artist.verify = function verify(message) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        if (message.artistUri != null && message.hasOwnProperty("artistUri"))
                            if (!$util.isString(message.artistUri))
                                return "artistUri: string expected";
                        if (message.artistName != null && message.hasOwnProperty("artistName"))
                            if (!$util.isString(message.artistName))
                                return "artistName: string expected";
                        if (message.artistImgUrl != null && message.hasOwnProperty("artistImgUrl"))
                            if (!$util.isString(message.artistImgUrl))
                                return "artistImgUrl: string expected";
                        return null;
                    };

                    /**
                     * Creates an Artist message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof spotify.canvas.CanvasResponse.Canvas.Artist
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {spotify.canvas.CanvasResponse.Canvas.Artist} Artist
                     */
                    Artist.fromObject = function fromObject(object) {
                        if (object instanceof $root.spotify.canvas.CanvasResponse.Canvas.Artist)
                            return object;
                        var message = new $root.spotify.canvas.CanvasResponse.Canvas.Artist();
                        if (object.artistUri != null)
                            message.artistUri = String(object.artistUri);
                        if (object.artistName != null)
                            message.artistName = String(object.artistName);
                        if (object.artistImgUrl != null)
                            message.artistImgUrl = String(object.artistImgUrl);
                        return message;
                    };

                    /**
                     * Creates a plain object from an Artist message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof spotify.canvas.CanvasResponse.Canvas.Artist
                     * @static
                     * @param {spotify.canvas.CanvasResponse.Canvas.Artist} message Artist
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    Artist.toObject = function toObject(message, options) {
                        if (!options)
                            options = {};
                        var object = {};
                        if (options.defaults) {
                            object.artistUri = "";
                            object.artistName = "";
                            object.artistImgUrl = "";
                        }
                        if (message.artistUri != null && message.hasOwnProperty("artistUri"))
                            object.artistUri = message.artistUri;
                        if (message.artistName != null && message.hasOwnProperty("artistName"))
                            object.artistName = message.artistName;
                        if (message.artistImgUrl != null && message.hasOwnProperty("artistImgUrl"))
                            object.artistImgUrl = message.artistImgUrl;
                        return object;
                    };

                    /**
                     * Converts this Artist to JSON.
                     * @function toJSON
                     * @memberof spotify.canvas.CanvasResponse.Canvas.Artist
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    Artist.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    /**
                     * Gets the default type url for Artist
                     * @function getTypeUrl
                     * @memberof spotify.canvas.CanvasResponse.Canvas.Artist
                     * @static
                     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns {string} The default type url
                     */
                    Artist.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                        if (typeUrlPrefix === undefined) {
                            typeUrlPrefix = "type.googleapis.com";
                        }
                        return typeUrlPrefix + "/spotify.canvas.CanvasResponse.Canvas.Artist";
                    };

                    return Artist;
                })();

                return Canvas;
            })();

            return CanvasResponse;
        })();

        return canvas;
    })();

    return spotify;
})();

module.exports = $root;
