import * as $protobuf from "protobufjs";
import Long = require("long");
/** Namespace spotify. */
export namespace spotify {

    /** Namespace canvas. */
    namespace canvas {

        /** Properties of a CanvasRequest. */
        interface ICanvasRequest {

            /** CanvasRequest tracks */
            tracks?: (spotify.canvas.CanvasRequest.ITrack[]|null);
        }

        /** Represents a CanvasRequest. */
        class CanvasRequest implements ICanvasRequest {

            /**
             * Constructs a new CanvasRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: spotify.canvas.ICanvasRequest);

            /** CanvasRequest tracks. */
            public tracks: spotify.canvas.CanvasRequest.ITrack[];

            /**
             * Creates a new CanvasRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns CanvasRequest instance
             */
            public static create(properties?: spotify.canvas.ICanvasRequest): spotify.canvas.CanvasRequest;

            /**
             * Encodes the specified CanvasRequest message. Does not implicitly {@link spotify.canvas.CanvasRequest.verify|verify} messages.
             * @param message CanvasRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: spotify.canvas.ICanvasRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified CanvasRequest message, length delimited. Does not implicitly {@link spotify.canvas.CanvasRequest.verify|verify} messages.
             * @param message CanvasRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: spotify.canvas.ICanvasRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a CanvasRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns CanvasRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): spotify.canvas.CanvasRequest;

            /**
             * Decodes a CanvasRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns CanvasRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): spotify.canvas.CanvasRequest;

            /**
             * Verifies a CanvasRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a CanvasRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns CanvasRequest
             */
            public static fromObject(object: { [k: string]: any }): spotify.canvas.CanvasRequest;

            /**
             * Creates a plain object from a CanvasRequest message. Also converts values to other types if specified.
             * @param message CanvasRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: spotify.canvas.CanvasRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this CanvasRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for CanvasRequest
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        namespace CanvasRequest {

            /** Properties of a Track. */
            interface ITrack {

                /** Track trackUri */
                trackUri?: (string|null);
            }

            /** Represents a Track. */
            class Track implements ITrack {

                /**
                 * Constructs a new Track.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: spotify.canvas.CanvasRequest.ITrack);

                /** Track trackUri. */
                public trackUri: string;

                /**
                 * Creates a new Track instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns Track instance
                 */
                public static create(properties?: spotify.canvas.CanvasRequest.ITrack): spotify.canvas.CanvasRequest.Track;

                /**
                 * Encodes the specified Track message. Does not implicitly {@link spotify.canvas.CanvasRequest.Track.verify|verify} messages.
                 * @param message Track message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: spotify.canvas.CanvasRequest.ITrack, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified Track message, length delimited. Does not implicitly {@link spotify.canvas.CanvasRequest.Track.verify|verify} messages.
                 * @param message Track message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: spotify.canvas.CanvasRequest.ITrack, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a Track message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns Track
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): spotify.canvas.CanvasRequest.Track;

                /**
                 * Decodes a Track message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns Track
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): spotify.canvas.CanvasRequest.Track;

                /**
                 * Verifies a Track message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a Track message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns Track
                 */
                public static fromObject(object: { [k: string]: any }): spotify.canvas.CanvasRequest.Track;

                /**
                 * Creates a plain object from a Track message. Also converts values to other types if specified.
                 * @param message Track
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: spotify.canvas.CanvasRequest.Track, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this Track to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for Track
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }
        }

        /** Properties of a CanvasResponse. */
        interface ICanvasResponse {

            /** CanvasResponse canvases */
            canvases?: (spotify.canvas.CanvasResponse.ICanvas[]|null);
        }

        /** Represents a CanvasResponse. */
        class CanvasResponse implements ICanvasResponse {

            /**
             * Constructs a new CanvasResponse.
             * @param [properties] Properties to set
             */
            constructor(properties?: spotify.canvas.ICanvasResponse);

            /** CanvasResponse canvases. */
            public canvases: spotify.canvas.CanvasResponse.ICanvas[];

            /**
             * Creates a new CanvasResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns CanvasResponse instance
             */
            public static create(properties?: spotify.canvas.ICanvasResponse): spotify.canvas.CanvasResponse;

            /**
             * Encodes the specified CanvasResponse message. Does not implicitly {@link spotify.canvas.CanvasResponse.verify|verify} messages.
             * @param message CanvasResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: spotify.canvas.ICanvasResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified CanvasResponse message, length delimited. Does not implicitly {@link spotify.canvas.CanvasResponse.verify|verify} messages.
             * @param message CanvasResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: spotify.canvas.ICanvasResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a CanvasResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns CanvasResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): spotify.canvas.CanvasResponse;

            /**
             * Decodes a CanvasResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns CanvasResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): spotify.canvas.CanvasResponse;

            /**
             * Verifies a CanvasResponse message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a CanvasResponse message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns CanvasResponse
             */
            public static fromObject(object: { [k: string]: any }): spotify.canvas.CanvasResponse;

            /**
             * Creates a plain object from a CanvasResponse message. Also converts values to other types if specified.
             * @param message CanvasResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: spotify.canvas.CanvasResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this CanvasResponse to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for CanvasResponse
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        namespace CanvasResponse {

            /** Properties of a Canvas. */
            interface ICanvas {

                /** Canvas id */
                id?: (string|null);

                /** Canvas canvasUrl */
                canvasUrl?: (string|null);

                /** Canvas trackUri */
                trackUri?: (string|null);

                /** Canvas artist */
                artist?: (spotify.canvas.CanvasResponse.Canvas.IArtist|null);

                /** Canvas otherId */
                otherId?: (string|null);

                /** Canvas canvasUri */
                canvasUri?: (string|null);
            }

            /** Represents a Canvas. */
            class Canvas implements ICanvas {

                /**
                 * Constructs a new Canvas.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: spotify.canvas.CanvasResponse.ICanvas);

                /** Canvas id. */
                public id: string;

                /** Canvas canvasUrl. */
                public canvasUrl: string;

                /** Canvas trackUri. */
                public trackUri: string;

                /** Canvas artist. */
                public artist?: (spotify.canvas.CanvasResponse.Canvas.IArtist|null);

                /** Canvas otherId. */
                public otherId: string;

                /** Canvas canvasUri. */
                public canvasUri: string;

                /**
                 * Creates a new Canvas instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns Canvas instance
                 */
                public static create(properties?: spotify.canvas.CanvasResponse.ICanvas): spotify.canvas.CanvasResponse.Canvas;

                /**
                 * Encodes the specified Canvas message. Does not implicitly {@link spotify.canvas.CanvasResponse.Canvas.verify|verify} messages.
                 * @param message Canvas message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: spotify.canvas.CanvasResponse.ICanvas, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified Canvas message, length delimited. Does not implicitly {@link spotify.canvas.CanvasResponse.Canvas.verify|verify} messages.
                 * @param message Canvas message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: spotify.canvas.CanvasResponse.ICanvas, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a Canvas message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns Canvas
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): spotify.canvas.CanvasResponse.Canvas;

                /**
                 * Decodes a Canvas message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns Canvas
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): spotify.canvas.CanvasResponse.Canvas;

                /**
                 * Verifies a Canvas message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a Canvas message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns Canvas
                 */
                public static fromObject(object: { [k: string]: any }): spotify.canvas.CanvasResponse.Canvas;

                /**
                 * Creates a plain object from a Canvas message. Also converts values to other types if specified.
                 * @param message Canvas
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: spotify.canvas.CanvasResponse.Canvas, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this Canvas to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for Canvas
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            namespace Canvas {

                /** Properties of an Artist. */
                interface IArtist {

                    /** Artist artistUri */
                    artistUri?: (string|null);

                    /** Artist artistName */
                    artistName?: (string|null);

                    /** Artist artistImgUrl */
                    artistImgUrl?: (string|null);
                }

                /** Represents an Artist. */
                class Artist implements IArtist {

                    /**
                     * Constructs a new Artist.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: spotify.canvas.CanvasResponse.Canvas.IArtist);

                    /** Artist artistUri. */
                    public artistUri: string;

                    /** Artist artistName. */
                    public artistName: string;

                    /** Artist artistImgUrl. */
                    public artistImgUrl: string;

                    /**
                     * Creates a new Artist instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns Artist instance
                     */
                    public static create(properties?: spotify.canvas.CanvasResponse.Canvas.IArtist): spotify.canvas.CanvasResponse.Canvas.Artist;

                    /**
                     * Encodes the specified Artist message. Does not implicitly {@link spotify.canvas.CanvasResponse.Canvas.Artist.verify|verify} messages.
                     * @param message Artist message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: spotify.canvas.CanvasResponse.Canvas.IArtist, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified Artist message, length delimited. Does not implicitly {@link spotify.canvas.CanvasResponse.Canvas.Artist.verify|verify} messages.
                     * @param message Artist message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: spotify.canvas.CanvasResponse.Canvas.IArtist, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes an Artist message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns Artist
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): spotify.canvas.CanvasResponse.Canvas.Artist;

                    /**
                     * Decodes an Artist message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns Artist
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): spotify.canvas.CanvasResponse.Canvas.Artist;

                    /**
                     * Verifies an Artist message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates an Artist message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns Artist
                     */
                    public static fromObject(object: { [k: string]: any }): spotify.canvas.CanvasResponse.Canvas.Artist;

                    /**
                     * Creates a plain object from an Artist message. Also converts values to other types if specified.
                     * @param message Artist
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: spotify.canvas.CanvasResponse.Canvas.Artist, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this Artist to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for Artist
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }
            }
        }
    }
}
