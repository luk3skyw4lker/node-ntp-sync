export interface NTPPacket {
  /**
   * 2-bit integer warning of an impending leap second to be inserted or deleted
   * in the last minute of the current month.
   * 
   * Values:
   * - 0: no warning
   * - 1: last minute of the day has 61 seconds
   * - 2: last minute of the day has 59 seconds
   * - 3: unknown (clock unsynchronized)
   */
  leapIndicator: number;
  /**
   * 3-bit integer representing the NTP version number.
   */
  version: number;
  /**
   * 3-bit integer representing the mode
   * 
   * Values:
   * - 0: reserved
   * - 1: symmetric active
   * - 2: symmetric passive
   * - 3: client
   * - 4: server
   * - 5: broadcast
   * - 6: NTP control message
   * - 7: reserved for private use
   */
  mode: number;
  /**
   * 8-bit integer representing the stratum level of the local clock
   * 
   * Values:
   * - 0: unspecified or invalid
   * - 1: primary server (e.g., equipped with a GPS receiver)
   * - 2-15: secondary server (via NTP)
   * - 16: unsynchronized
   * - 17-255: reserved
   */
  stratum: number;
  /**
   * 8-bit signed integer representing the maximum interval between successive
   * messages, in log2 seconds. Suggested default limits for minimum and
   * maximum poll intervals are 6 and 10, respectively.
   */
  pollInterval: number;
  /**
   * 8-bit signed integer representing the precision of the system clock, in
   * log2 seconds. For instance, a value of -18 corresponds to a precision of
   * about one microsecond. The precision can be determined when the service
   * first starts up as the minimum time of several iterations to read the
   * system clock.
   */
  precision: number;
  /**
   * 32-bit code identifying the particular server or reference clock. The
   * interpretation depends on the value in the stratum field. For packet
   * stratum 0 (unspecified or invalid), this is a four-character ASCII string,
   * called the "kiss code", used for debugging and monitoring purposes. For
   * stratum 1 (reference clock), this is a four-octet, left-justified,
   * zero-padded ASCII string assigned to the reference clock. The authoritative
   * list of Reference Identifiers is maintained by IANA; however, any string
   * beginning with the ASCII character "X" is reserved for unregistered
   * experimentation and development. Above stratum 1 (secondary servers and
   * clients): this is the reference identifier of the server and can be used to
   * detect timing loops. If using the IPv4 address family, the identifier is
   * the four-octet IPv4 address. If using the IPv6 address family, it is the
   * first four octets of the MD5 hash of the IPv6 address. Note that, when
   * using the IPv6 address family on an NTPv4 server with a NTPv3 client, the
   * Reference Identifier field appears to be a random value and a timing loop
   * might not be detected.
   */
  referenceIdentifier: Buffer;
  /**
   * Time when the system clock was last set or corrected, in seconds since the
   * NTP epoch (January 1, 1900).
   */
  referenceTimestamp: number;
  /**
   * Time at the client when the request departed for the server, in seconds
   * since the NTP epoch (January 1, 1900).
   */
  originateTimestamp: number;
  /**
   * Time at the server when the request arrived from the client, in seconds
   * since the NTP epoch (January 1, 1900).
   */
  receiveTimestamp: number;
  /**
   * Time at the server when the response left for the client, in seconds since
   * the NTP epoch (January 1, 1900).
   */
  transmitTimestamp: number;
  /**
   * Total round-trip delay to the reference clock, in seconds.
   */
  rootDelay: Buffer;
  /**
   * Total dispersion to the reference clock, in seconds.
   */
  rootDispersion: Buffer;
  /**
   * Time at the client when the reply arrived from the server, in seconds.
   */
  destinationTimestamp: number;
  /**
   * Same as `receiveTimestamp`, but as a Date object.
   */
  time: Date;
  /**
   * Round-trip delay between the client and server, in seconds.
   */
  d: number;
  /**
   * Offset between the client and server clocks, in seconds.
   */
  t: number;
}

export interface NTPOptions {
  /**
   * Time that the client will wait for an NTP response from the server.
   * @default 3000
   */
  timeout: number;
}

declare class Client {
  constructor(server?: string, port?: number, options?: NTPOptions);
  syncTime(): Promise<NTPPacket>;
}

export interface ServerOptions {
  onInvalidPacket?: (message: string, error: any) => any;
}

declare class Server {
  constructor(options?: ServerOptions);
  handle(handler: Function): void;
  listen(port?: number, callback?: Function): Server;
}
