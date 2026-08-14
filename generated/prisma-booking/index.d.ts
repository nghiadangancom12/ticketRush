
/**
 * Client
**/

import * as runtime from './runtime/client.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model seats
 * Bảng seats đã denormalize: snapshot zone_name, zone_price, event_id
 * để booking_db tự đủ dữ liệu, không cần JOIN xuyên sang catalog_db.
 */
export type seats = $Result.DefaultSelection<Prisma.$seatsPayload>
/**
 * Model orders
 * Bảng orders đã denormalize: snapshot event_title, category_name, user_email
 * để giao dịch tài chính giữ nguyên tính bất biến và phục vụ analytics.
 */
export type orders = $Result.DefaultSelection<Prisma.$ordersPayload>
/**
 * Model tickets
 * 
 */
export type tickets = $Result.DefaultSelection<Prisma.$ticketsPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const seat_status_enum: {
  AVAILABLE: 'AVAILABLE',
  LOCKED: 'LOCKED',
  SOLD: 'SOLD'
};

export type seat_status_enum = (typeof seat_status_enum)[keyof typeof seat_status_enum]


export const order_status_enum: {
  PENDING: 'PENDING',
  PAID: 'PAID',
  CANCELLED: 'CANCELLED'
};

export type order_status_enum = (typeof order_status_enum)[keyof typeof order_status_enum]


export const ticket_status_enum: {
  UNUSED: 'UNUSED',
  CHECKED_IN: 'CHECKED_IN',
  REVOKED: 'REVOKED'
};

export type ticket_status_enum = (typeof ticket_status_enum)[keyof typeof ticket_status_enum]

}

export type seat_status_enum = $Enums.seat_status_enum

export const seat_status_enum: typeof $Enums.seat_status_enum

export type order_status_enum = $Enums.order_status_enum

export const order_status_enum: typeof $Enums.order_status_enum

export type ticket_status_enum = $Enums.ticket_status_enum

export const ticket_status_enum: typeof $Enums.ticket_status_enum

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient({
 *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
 * })
 * // Fetch zero or more Seats
 * const seats = await prisma.seats.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://pris.ly/d/client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient({
   *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
   * })
   * // Fetch zero or more Seats
   * const seats = await prisma.seats.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://pris.ly/d/client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/orm/prisma-client/queries/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>

  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.seats`: Exposes CRUD operations for the **seats** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Seats
    * const seats = await prisma.seats.findMany()
    * ```
    */
  get seats(): Prisma.seatsDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.orders`: Exposes CRUD operations for the **orders** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Orders
    * const orders = await prisma.orders.findMany()
    * ```
    */
  get orders(): Prisma.ordersDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.tickets`: Exposes CRUD operations for the **tickets** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Tickets
    * const tickets = await prisma.tickets.findMany()
    * ```
    */
  get tickets(): Prisma.ticketsDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 7.8.0
   * Query Engine version: 3c6e192761c0362d496ed980de936e2f3cebcd3a
   */
  export type PrismaVersion = {
    client: string
    engine: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    seats: 'seats',
    orders: 'orders',
    tickets: 'tickets'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]



  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "seats" | "orders" | "tickets"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      seats: {
        payload: Prisma.$seatsPayload<ExtArgs>
        fields: Prisma.seatsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.seatsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$seatsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.seatsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$seatsPayload>
          }
          findFirst: {
            args: Prisma.seatsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$seatsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.seatsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$seatsPayload>
          }
          findMany: {
            args: Prisma.seatsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$seatsPayload>[]
          }
          create: {
            args: Prisma.seatsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$seatsPayload>
          }
          createMany: {
            args: Prisma.seatsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.seatsCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$seatsPayload>[]
          }
          delete: {
            args: Prisma.seatsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$seatsPayload>
          }
          update: {
            args: Prisma.seatsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$seatsPayload>
          }
          deleteMany: {
            args: Prisma.seatsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.seatsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.seatsUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$seatsPayload>[]
          }
          upsert: {
            args: Prisma.seatsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$seatsPayload>
          }
          aggregate: {
            args: Prisma.SeatsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSeats>
          }
          groupBy: {
            args: Prisma.seatsGroupByArgs<ExtArgs>
            result: $Utils.Optional<SeatsGroupByOutputType>[]
          }
          count: {
            args: Prisma.seatsCountArgs<ExtArgs>
            result: $Utils.Optional<SeatsCountAggregateOutputType> | number
          }
        }
      }
      orders: {
        payload: Prisma.$ordersPayload<ExtArgs>
        fields: Prisma.ordersFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ordersFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ordersPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ordersFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ordersPayload>
          }
          findFirst: {
            args: Prisma.ordersFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ordersPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ordersFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ordersPayload>
          }
          findMany: {
            args: Prisma.ordersFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ordersPayload>[]
          }
          create: {
            args: Prisma.ordersCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ordersPayload>
          }
          createMany: {
            args: Prisma.ordersCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ordersCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ordersPayload>[]
          }
          delete: {
            args: Prisma.ordersDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ordersPayload>
          }
          update: {
            args: Prisma.ordersUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ordersPayload>
          }
          deleteMany: {
            args: Prisma.ordersDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ordersUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ordersUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ordersPayload>[]
          }
          upsert: {
            args: Prisma.ordersUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ordersPayload>
          }
          aggregate: {
            args: Prisma.OrdersAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOrders>
          }
          groupBy: {
            args: Prisma.ordersGroupByArgs<ExtArgs>
            result: $Utils.Optional<OrdersGroupByOutputType>[]
          }
          count: {
            args: Prisma.ordersCountArgs<ExtArgs>
            result: $Utils.Optional<OrdersCountAggregateOutputType> | number
          }
        }
      }
      tickets: {
        payload: Prisma.$ticketsPayload<ExtArgs>
        fields: Prisma.ticketsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ticketsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ticketsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ticketsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ticketsPayload>
          }
          findFirst: {
            args: Prisma.ticketsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ticketsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ticketsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ticketsPayload>
          }
          findMany: {
            args: Prisma.ticketsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ticketsPayload>[]
          }
          create: {
            args: Prisma.ticketsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ticketsPayload>
          }
          createMany: {
            args: Prisma.ticketsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ticketsCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ticketsPayload>[]
          }
          delete: {
            args: Prisma.ticketsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ticketsPayload>
          }
          update: {
            args: Prisma.ticketsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ticketsPayload>
          }
          deleteMany: {
            args: Prisma.ticketsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ticketsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ticketsUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ticketsPayload>[]
          }
          upsert: {
            args: Prisma.ticketsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ticketsPayload>
          }
          aggregate: {
            args: Prisma.TicketsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTickets>
          }
          groupBy: {
            args: Prisma.ticketsGroupByArgs<ExtArgs>
            result: $Utils.Optional<TicketsGroupByOutputType>[]
          }
          count: {
            args: Prisma.ticketsCountArgs<ExtArgs>
            result: $Utils.Optional<TicketsCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://pris.ly/d/logging).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory
    /**
     * Prisma Accelerate URL allowing the client to connect through Accelerate instead of a direct database.
     */
    accelerateUrl?: string
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
    /**
     * SQL commenter plugins that add metadata to SQL queries as comments.
     * Comments follow the sqlcommenter format: https://google.github.io/sqlcommenter/
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   adapter,
     *   comments: [
     *     traceContext(),
     *     queryInsights(),
     *   ],
     * })
     * ```
     */
    comments?: runtime.SqlCommenterPlugin[]
  }
  export type GlobalOmitConfig = {
    seats?: seatsOmit
    orders?: ordersOmit
    tickets?: ticketsOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type OrdersCountOutputType
   */

  export type OrdersCountOutputType = {
    tickets: number
  }

  export type OrdersCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tickets?: boolean | OrdersCountOutputTypeCountTicketsArgs
  }

  // Custom InputTypes
  /**
   * OrdersCountOutputType without action
   */
  export type OrdersCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrdersCountOutputType
     */
    select?: OrdersCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * OrdersCountOutputType without action
   */
  export type OrdersCountOutputTypeCountTicketsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ticketsWhereInput
  }


  /**
   * Models
   */

  /**
   * Model seats
   */

  export type AggregateSeats = {
    _count: SeatsCountAggregateOutputType | null
    _avg: SeatsAvgAggregateOutputType | null
    _sum: SeatsSumAggregateOutputType | null
    _min: SeatsMinAggregateOutputType | null
    _max: SeatsMaxAggregateOutputType | null
  }

  export type SeatsAvgAggregateOutputType = {
    zone_price: Decimal | null
    seat_number: number | null
  }

  export type SeatsSumAggregateOutputType = {
    zone_price: Decimal | null
    seat_number: number | null
  }

  export type SeatsMinAggregateOutputType = {
    id: string | null
    zone_id: string | null
    zone_name: string | null
    zone_price: Decimal | null
    event_id: string | null
    row_label: string | null
    seat_number: number | null
    status: $Enums.seat_status_enum | null
    locked_by: string | null
    locked_at: Date | null
  }

  export type SeatsMaxAggregateOutputType = {
    id: string | null
    zone_id: string | null
    zone_name: string | null
    zone_price: Decimal | null
    event_id: string | null
    row_label: string | null
    seat_number: number | null
    status: $Enums.seat_status_enum | null
    locked_by: string | null
    locked_at: Date | null
  }

  export type SeatsCountAggregateOutputType = {
    id: number
    zone_id: number
    zone_name: number
    zone_price: number
    event_id: number
    row_label: number
    seat_number: number
    status: number
    locked_by: number
    locked_at: number
    _all: number
  }


  export type SeatsAvgAggregateInputType = {
    zone_price?: true
    seat_number?: true
  }

  export type SeatsSumAggregateInputType = {
    zone_price?: true
    seat_number?: true
  }

  export type SeatsMinAggregateInputType = {
    id?: true
    zone_id?: true
    zone_name?: true
    zone_price?: true
    event_id?: true
    row_label?: true
    seat_number?: true
    status?: true
    locked_by?: true
    locked_at?: true
  }

  export type SeatsMaxAggregateInputType = {
    id?: true
    zone_id?: true
    zone_name?: true
    zone_price?: true
    event_id?: true
    row_label?: true
    seat_number?: true
    status?: true
    locked_by?: true
    locked_at?: true
  }

  export type SeatsCountAggregateInputType = {
    id?: true
    zone_id?: true
    zone_name?: true
    zone_price?: true
    event_id?: true
    row_label?: true
    seat_number?: true
    status?: true
    locked_by?: true
    locked_at?: true
    _all?: true
  }

  export type SeatsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which seats to aggregate.
     */
    where?: seatsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of seats to fetch.
     */
    orderBy?: seatsOrderByWithRelationInput | seatsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: seatsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` seats from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` seats.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned seats
    **/
    _count?: true | SeatsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: SeatsAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: SeatsSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SeatsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SeatsMaxAggregateInputType
  }

  export type GetSeatsAggregateType<T extends SeatsAggregateArgs> = {
        [P in keyof T & keyof AggregateSeats]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSeats[P]>
      : GetScalarType<T[P], AggregateSeats[P]>
  }




  export type seatsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: seatsWhereInput
    orderBy?: seatsOrderByWithAggregationInput | seatsOrderByWithAggregationInput[]
    by: SeatsScalarFieldEnum[] | SeatsScalarFieldEnum
    having?: seatsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SeatsCountAggregateInputType | true
    _avg?: SeatsAvgAggregateInputType
    _sum?: SeatsSumAggregateInputType
    _min?: SeatsMinAggregateInputType
    _max?: SeatsMaxAggregateInputType
  }

  export type SeatsGroupByOutputType = {
    id: string
    zone_id: string
    zone_name: string
    zone_price: Decimal
    event_id: string
    row_label: string
    seat_number: number
    status: $Enums.seat_status_enum | null
    locked_by: string | null
    locked_at: Date | null
    _count: SeatsCountAggregateOutputType | null
    _avg: SeatsAvgAggregateOutputType | null
    _sum: SeatsSumAggregateOutputType | null
    _min: SeatsMinAggregateOutputType | null
    _max: SeatsMaxAggregateOutputType | null
  }

  type GetSeatsGroupByPayload<T extends seatsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SeatsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SeatsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SeatsGroupByOutputType[P]>
            : GetScalarType<T[P], SeatsGroupByOutputType[P]>
        }
      >
    >


  export type seatsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    zone_id?: boolean
    zone_name?: boolean
    zone_price?: boolean
    event_id?: boolean
    row_label?: boolean
    seat_number?: boolean
    status?: boolean
    locked_by?: boolean
    locked_at?: boolean
    tickets?: boolean | seats$ticketsArgs<ExtArgs>
  }, ExtArgs["result"]["seats"]>

  export type seatsSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    zone_id?: boolean
    zone_name?: boolean
    zone_price?: boolean
    event_id?: boolean
    row_label?: boolean
    seat_number?: boolean
    status?: boolean
    locked_by?: boolean
    locked_at?: boolean
  }, ExtArgs["result"]["seats"]>

  export type seatsSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    zone_id?: boolean
    zone_name?: boolean
    zone_price?: boolean
    event_id?: boolean
    row_label?: boolean
    seat_number?: boolean
    status?: boolean
    locked_by?: boolean
    locked_at?: boolean
  }, ExtArgs["result"]["seats"]>

  export type seatsSelectScalar = {
    id?: boolean
    zone_id?: boolean
    zone_name?: boolean
    zone_price?: boolean
    event_id?: boolean
    row_label?: boolean
    seat_number?: boolean
    status?: boolean
    locked_by?: boolean
    locked_at?: boolean
  }

  export type seatsOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "zone_id" | "zone_name" | "zone_price" | "event_id" | "row_label" | "seat_number" | "status" | "locked_by" | "locked_at", ExtArgs["result"]["seats"]>
  export type seatsInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tickets?: boolean | seats$ticketsArgs<ExtArgs>
  }
  export type seatsIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type seatsIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $seatsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "seats"
    objects: {
      tickets: Prisma.$ticketsPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      zone_id: string
      zone_name: string
      zone_price: Prisma.Decimal
      event_id: string
      row_label: string
      seat_number: number
      status: $Enums.seat_status_enum | null
      locked_by: string | null
      locked_at: Date | null
    }, ExtArgs["result"]["seats"]>
    composites: {}
  }

  type seatsGetPayload<S extends boolean | null | undefined | seatsDefaultArgs> = $Result.GetResult<Prisma.$seatsPayload, S>

  type seatsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<seatsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SeatsCountAggregateInputType | true
    }

  export interface seatsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['seats'], meta: { name: 'seats' } }
    /**
     * Find zero or one Seats that matches the filter.
     * @param {seatsFindUniqueArgs} args - Arguments to find a Seats
     * @example
     * // Get one Seats
     * const seats = await prisma.seats.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends seatsFindUniqueArgs>(args: SelectSubset<T, seatsFindUniqueArgs<ExtArgs>>): Prisma__seatsClient<$Result.GetResult<Prisma.$seatsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Seats that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {seatsFindUniqueOrThrowArgs} args - Arguments to find a Seats
     * @example
     * // Get one Seats
     * const seats = await prisma.seats.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends seatsFindUniqueOrThrowArgs>(args: SelectSubset<T, seatsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__seatsClient<$Result.GetResult<Prisma.$seatsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Seats that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {seatsFindFirstArgs} args - Arguments to find a Seats
     * @example
     * // Get one Seats
     * const seats = await prisma.seats.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends seatsFindFirstArgs>(args?: SelectSubset<T, seatsFindFirstArgs<ExtArgs>>): Prisma__seatsClient<$Result.GetResult<Prisma.$seatsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Seats that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {seatsFindFirstOrThrowArgs} args - Arguments to find a Seats
     * @example
     * // Get one Seats
     * const seats = await prisma.seats.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends seatsFindFirstOrThrowArgs>(args?: SelectSubset<T, seatsFindFirstOrThrowArgs<ExtArgs>>): Prisma__seatsClient<$Result.GetResult<Prisma.$seatsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Seats that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {seatsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Seats
     * const seats = await prisma.seats.findMany()
     * 
     * // Get first 10 Seats
     * const seats = await prisma.seats.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const seatsWithIdOnly = await prisma.seats.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends seatsFindManyArgs>(args?: SelectSubset<T, seatsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$seatsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Seats.
     * @param {seatsCreateArgs} args - Arguments to create a Seats.
     * @example
     * // Create one Seats
     * const Seats = await prisma.seats.create({
     *   data: {
     *     // ... data to create a Seats
     *   }
     * })
     * 
     */
    create<T extends seatsCreateArgs>(args: SelectSubset<T, seatsCreateArgs<ExtArgs>>): Prisma__seatsClient<$Result.GetResult<Prisma.$seatsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Seats.
     * @param {seatsCreateManyArgs} args - Arguments to create many Seats.
     * @example
     * // Create many Seats
     * const seats = await prisma.seats.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends seatsCreateManyArgs>(args?: SelectSubset<T, seatsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Seats and returns the data saved in the database.
     * @param {seatsCreateManyAndReturnArgs} args - Arguments to create many Seats.
     * @example
     * // Create many Seats
     * const seats = await prisma.seats.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Seats and only return the `id`
     * const seatsWithIdOnly = await prisma.seats.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends seatsCreateManyAndReturnArgs>(args?: SelectSubset<T, seatsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$seatsPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Seats.
     * @param {seatsDeleteArgs} args - Arguments to delete one Seats.
     * @example
     * // Delete one Seats
     * const Seats = await prisma.seats.delete({
     *   where: {
     *     // ... filter to delete one Seats
     *   }
     * })
     * 
     */
    delete<T extends seatsDeleteArgs>(args: SelectSubset<T, seatsDeleteArgs<ExtArgs>>): Prisma__seatsClient<$Result.GetResult<Prisma.$seatsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Seats.
     * @param {seatsUpdateArgs} args - Arguments to update one Seats.
     * @example
     * // Update one Seats
     * const seats = await prisma.seats.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends seatsUpdateArgs>(args: SelectSubset<T, seatsUpdateArgs<ExtArgs>>): Prisma__seatsClient<$Result.GetResult<Prisma.$seatsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Seats.
     * @param {seatsDeleteManyArgs} args - Arguments to filter Seats to delete.
     * @example
     * // Delete a few Seats
     * const { count } = await prisma.seats.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends seatsDeleteManyArgs>(args?: SelectSubset<T, seatsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Seats.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {seatsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Seats
     * const seats = await prisma.seats.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends seatsUpdateManyArgs>(args: SelectSubset<T, seatsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Seats and returns the data updated in the database.
     * @param {seatsUpdateManyAndReturnArgs} args - Arguments to update many Seats.
     * @example
     * // Update many Seats
     * const seats = await prisma.seats.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Seats and only return the `id`
     * const seatsWithIdOnly = await prisma.seats.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends seatsUpdateManyAndReturnArgs>(args: SelectSubset<T, seatsUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$seatsPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Seats.
     * @param {seatsUpsertArgs} args - Arguments to update or create a Seats.
     * @example
     * // Update or create a Seats
     * const seats = await prisma.seats.upsert({
     *   create: {
     *     // ... data to create a Seats
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Seats we want to update
     *   }
     * })
     */
    upsert<T extends seatsUpsertArgs>(args: SelectSubset<T, seatsUpsertArgs<ExtArgs>>): Prisma__seatsClient<$Result.GetResult<Prisma.$seatsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Seats.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {seatsCountArgs} args - Arguments to filter Seats to count.
     * @example
     * // Count the number of Seats
     * const count = await prisma.seats.count({
     *   where: {
     *     // ... the filter for the Seats we want to count
     *   }
     * })
    **/
    count<T extends seatsCountArgs>(
      args?: Subset<T, seatsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SeatsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Seats.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SeatsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SeatsAggregateArgs>(args: Subset<T, SeatsAggregateArgs>): Prisma.PrismaPromise<GetSeatsAggregateType<T>>

    /**
     * Group by Seats.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {seatsGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends seatsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: seatsGroupByArgs['orderBy'] }
        : { orderBy?: seatsGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, seatsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSeatsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the seats model
   */
  readonly fields: seatsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for seats.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__seatsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    tickets<T extends seats$ticketsArgs<ExtArgs> = {}>(args?: Subset<T, seats$ticketsArgs<ExtArgs>>): Prisma__ticketsClient<$Result.GetResult<Prisma.$ticketsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the seats model
   */
  interface seatsFieldRefs {
    readonly id: FieldRef<"seats", 'String'>
    readonly zone_id: FieldRef<"seats", 'String'>
    readonly zone_name: FieldRef<"seats", 'String'>
    readonly zone_price: FieldRef<"seats", 'Decimal'>
    readonly event_id: FieldRef<"seats", 'String'>
    readonly row_label: FieldRef<"seats", 'String'>
    readonly seat_number: FieldRef<"seats", 'Int'>
    readonly status: FieldRef<"seats", 'seat_status_enum'>
    readonly locked_by: FieldRef<"seats", 'String'>
    readonly locked_at: FieldRef<"seats", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * seats findUnique
   */
  export type seatsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the seats
     */
    select?: seatsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the seats
     */
    omit?: seatsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: seatsInclude<ExtArgs> | null
    /**
     * Filter, which seats to fetch.
     */
    where: seatsWhereUniqueInput
  }

  /**
   * seats findUniqueOrThrow
   */
  export type seatsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the seats
     */
    select?: seatsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the seats
     */
    omit?: seatsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: seatsInclude<ExtArgs> | null
    /**
     * Filter, which seats to fetch.
     */
    where: seatsWhereUniqueInput
  }

  /**
   * seats findFirst
   */
  export type seatsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the seats
     */
    select?: seatsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the seats
     */
    omit?: seatsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: seatsInclude<ExtArgs> | null
    /**
     * Filter, which seats to fetch.
     */
    where?: seatsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of seats to fetch.
     */
    orderBy?: seatsOrderByWithRelationInput | seatsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for seats.
     */
    cursor?: seatsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` seats from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` seats.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of seats.
     */
    distinct?: SeatsScalarFieldEnum | SeatsScalarFieldEnum[]
  }

  /**
   * seats findFirstOrThrow
   */
  export type seatsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the seats
     */
    select?: seatsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the seats
     */
    omit?: seatsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: seatsInclude<ExtArgs> | null
    /**
     * Filter, which seats to fetch.
     */
    where?: seatsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of seats to fetch.
     */
    orderBy?: seatsOrderByWithRelationInput | seatsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for seats.
     */
    cursor?: seatsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` seats from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` seats.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of seats.
     */
    distinct?: SeatsScalarFieldEnum | SeatsScalarFieldEnum[]
  }

  /**
   * seats findMany
   */
  export type seatsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the seats
     */
    select?: seatsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the seats
     */
    omit?: seatsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: seatsInclude<ExtArgs> | null
    /**
     * Filter, which seats to fetch.
     */
    where?: seatsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of seats to fetch.
     */
    orderBy?: seatsOrderByWithRelationInput | seatsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing seats.
     */
    cursor?: seatsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` seats from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` seats.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of seats.
     */
    distinct?: SeatsScalarFieldEnum | SeatsScalarFieldEnum[]
  }

  /**
   * seats create
   */
  export type seatsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the seats
     */
    select?: seatsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the seats
     */
    omit?: seatsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: seatsInclude<ExtArgs> | null
    /**
     * The data needed to create a seats.
     */
    data: XOR<seatsCreateInput, seatsUncheckedCreateInput>
  }

  /**
   * seats createMany
   */
  export type seatsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many seats.
     */
    data: seatsCreateManyInput | seatsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * seats createManyAndReturn
   */
  export type seatsCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the seats
     */
    select?: seatsSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the seats
     */
    omit?: seatsOmit<ExtArgs> | null
    /**
     * The data used to create many seats.
     */
    data: seatsCreateManyInput | seatsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * seats update
   */
  export type seatsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the seats
     */
    select?: seatsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the seats
     */
    omit?: seatsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: seatsInclude<ExtArgs> | null
    /**
     * The data needed to update a seats.
     */
    data: XOR<seatsUpdateInput, seatsUncheckedUpdateInput>
    /**
     * Choose, which seats to update.
     */
    where: seatsWhereUniqueInput
  }

  /**
   * seats updateMany
   */
  export type seatsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update seats.
     */
    data: XOR<seatsUpdateManyMutationInput, seatsUncheckedUpdateManyInput>
    /**
     * Filter which seats to update
     */
    where?: seatsWhereInput
    /**
     * Limit how many seats to update.
     */
    limit?: number
  }

  /**
   * seats updateManyAndReturn
   */
  export type seatsUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the seats
     */
    select?: seatsSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the seats
     */
    omit?: seatsOmit<ExtArgs> | null
    /**
     * The data used to update seats.
     */
    data: XOR<seatsUpdateManyMutationInput, seatsUncheckedUpdateManyInput>
    /**
     * Filter which seats to update
     */
    where?: seatsWhereInput
    /**
     * Limit how many seats to update.
     */
    limit?: number
  }

  /**
   * seats upsert
   */
  export type seatsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the seats
     */
    select?: seatsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the seats
     */
    omit?: seatsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: seatsInclude<ExtArgs> | null
    /**
     * The filter to search for the seats to update in case it exists.
     */
    where: seatsWhereUniqueInput
    /**
     * In case the seats found by the `where` argument doesn't exist, create a new seats with this data.
     */
    create: XOR<seatsCreateInput, seatsUncheckedCreateInput>
    /**
     * In case the seats was found with the provided `where` argument, update it with this data.
     */
    update: XOR<seatsUpdateInput, seatsUncheckedUpdateInput>
  }

  /**
   * seats delete
   */
  export type seatsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the seats
     */
    select?: seatsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the seats
     */
    omit?: seatsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: seatsInclude<ExtArgs> | null
    /**
     * Filter which seats to delete.
     */
    where: seatsWhereUniqueInput
  }

  /**
   * seats deleteMany
   */
  export type seatsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which seats to delete
     */
    where?: seatsWhereInput
    /**
     * Limit how many seats to delete.
     */
    limit?: number
  }

  /**
   * seats.tickets
   */
  export type seats$ticketsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tickets
     */
    select?: ticketsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tickets
     */
    omit?: ticketsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ticketsInclude<ExtArgs> | null
    where?: ticketsWhereInput
  }

  /**
   * seats without action
   */
  export type seatsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the seats
     */
    select?: seatsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the seats
     */
    omit?: seatsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: seatsInclude<ExtArgs> | null
  }


  /**
   * Model orders
   */

  export type AggregateOrders = {
    _count: OrdersCountAggregateOutputType | null
    _avg: OrdersAvgAggregateOutputType | null
    _sum: OrdersSumAggregateOutputType | null
    _min: OrdersMinAggregateOutputType | null
    _max: OrdersMaxAggregateOutputType | null
  }

  export type OrdersAvgAggregateOutputType = {
    total_amount: Decimal | null
  }

  export type OrdersSumAggregateOutputType = {
    total_amount: Decimal | null
  }

  export type OrdersMinAggregateOutputType = {
    id: string | null
    user_id: string | null
    event_id: string | null
    event_title: string | null
    category_name: string | null
    user_email: string | null
    total_amount: Decimal | null
    status: $Enums.order_status_enum | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type OrdersMaxAggregateOutputType = {
    id: string | null
    user_id: string | null
    event_id: string | null
    event_title: string | null
    category_name: string | null
    user_email: string | null
    total_amount: Decimal | null
    status: $Enums.order_status_enum | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type OrdersCountAggregateOutputType = {
    id: number
    user_id: number
    event_id: number
    event_title: number
    category_name: number
    user_email: number
    total_amount: number
    status: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type OrdersAvgAggregateInputType = {
    total_amount?: true
  }

  export type OrdersSumAggregateInputType = {
    total_amount?: true
  }

  export type OrdersMinAggregateInputType = {
    id?: true
    user_id?: true
    event_id?: true
    event_title?: true
    category_name?: true
    user_email?: true
    total_amount?: true
    status?: true
    created_at?: true
    updated_at?: true
  }

  export type OrdersMaxAggregateInputType = {
    id?: true
    user_id?: true
    event_id?: true
    event_title?: true
    category_name?: true
    user_email?: true
    total_amount?: true
    status?: true
    created_at?: true
    updated_at?: true
  }

  export type OrdersCountAggregateInputType = {
    id?: true
    user_id?: true
    event_id?: true
    event_title?: true
    category_name?: true
    user_email?: true
    total_amount?: true
    status?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type OrdersAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which orders to aggregate.
     */
    where?: ordersWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of orders to fetch.
     */
    orderBy?: ordersOrderByWithRelationInput | ordersOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ordersWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` orders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` orders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned orders
    **/
    _count?: true | OrdersCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: OrdersAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: OrdersSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OrdersMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OrdersMaxAggregateInputType
  }

  export type GetOrdersAggregateType<T extends OrdersAggregateArgs> = {
        [P in keyof T & keyof AggregateOrders]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOrders[P]>
      : GetScalarType<T[P], AggregateOrders[P]>
  }




  export type ordersGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ordersWhereInput
    orderBy?: ordersOrderByWithAggregationInput | ordersOrderByWithAggregationInput[]
    by: OrdersScalarFieldEnum[] | OrdersScalarFieldEnum
    having?: ordersScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OrdersCountAggregateInputType | true
    _avg?: OrdersAvgAggregateInputType
    _sum?: OrdersSumAggregateInputType
    _min?: OrdersMinAggregateInputType
    _max?: OrdersMaxAggregateInputType
  }

  export type OrdersGroupByOutputType = {
    id: string
    user_id: string
    event_id: string
    event_title: string
    category_name: string | null
    user_email: string
    total_amount: Decimal
    status: $Enums.order_status_enum | null
    created_at: Date | null
    updated_at: Date | null
    _count: OrdersCountAggregateOutputType | null
    _avg: OrdersAvgAggregateOutputType | null
    _sum: OrdersSumAggregateOutputType | null
    _min: OrdersMinAggregateOutputType | null
    _max: OrdersMaxAggregateOutputType | null
  }

  type GetOrdersGroupByPayload<T extends ordersGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OrdersGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OrdersGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OrdersGroupByOutputType[P]>
            : GetScalarType<T[P], OrdersGroupByOutputType[P]>
        }
      >
    >


  export type ordersSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    user_id?: boolean
    event_id?: boolean
    event_title?: boolean
    category_name?: boolean
    user_email?: boolean
    total_amount?: boolean
    status?: boolean
    created_at?: boolean
    updated_at?: boolean
    tickets?: boolean | orders$ticketsArgs<ExtArgs>
    _count?: boolean | OrdersCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["orders"]>

  export type ordersSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    user_id?: boolean
    event_id?: boolean
    event_title?: boolean
    category_name?: boolean
    user_email?: boolean
    total_amount?: boolean
    status?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["orders"]>

  export type ordersSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    user_id?: boolean
    event_id?: boolean
    event_title?: boolean
    category_name?: boolean
    user_email?: boolean
    total_amount?: boolean
    status?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["orders"]>

  export type ordersSelectScalar = {
    id?: boolean
    user_id?: boolean
    event_id?: boolean
    event_title?: boolean
    category_name?: boolean
    user_email?: boolean
    total_amount?: boolean
    status?: boolean
    created_at?: boolean
    updated_at?: boolean
  }

  export type ordersOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "user_id" | "event_id" | "event_title" | "category_name" | "user_email" | "total_amount" | "status" | "created_at" | "updated_at", ExtArgs["result"]["orders"]>
  export type ordersInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tickets?: boolean | orders$ticketsArgs<ExtArgs>
    _count?: boolean | OrdersCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ordersIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type ordersIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $ordersPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "orders"
    objects: {
      tickets: Prisma.$ticketsPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      user_id: string
      event_id: string
      event_title: string
      category_name: string | null
      user_email: string
      total_amount: Prisma.Decimal
      status: $Enums.order_status_enum | null
      created_at: Date | null
      updated_at: Date | null
    }, ExtArgs["result"]["orders"]>
    composites: {}
  }

  type ordersGetPayload<S extends boolean | null | undefined | ordersDefaultArgs> = $Result.GetResult<Prisma.$ordersPayload, S>

  type ordersCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ordersFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: OrdersCountAggregateInputType | true
    }

  export interface ordersDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['orders'], meta: { name: 'orders' } }
    /**
     * Find zero or one Orders that matches the filter.
     * @param {ordersFindUniqueArgs} args - Arguments to find a Orders
     * @example
     * // Get one Orders
     * const orders = await prisma.orders.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ordersFindUniqueArgs>(args: SelectSubset<T, ordersFindUniqueArgs<ExtArgs>>): Prisma__ordersClient<$Result.GetResult<Prisma.$ordersPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Orders that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ordersFindUniqueOrThrowArgs} args - Arguments to find a Orders
     * @example
     * // Get one Orders
     * const orders = await prisma.orders.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ordersFindUniqueOrThrowArgs>(args: SelectSubset<T, ordersFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ordersClient<$Result.GetResult<Prisma.$ordersPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Orders that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ordersFindFirstArgs} args - Arguments to find a Orders
     * @example
     * // Get one Orders
     * const orders = await prisma.orders.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ordersFindFirstArgs>(args?: SelectSubset<T, ordersFindFirstArgs<ExtArgs>>): Prisma__ordersClient<$Result.GetResult<Prisma.$ordersPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Orders that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ordersFindFirstOrThrowArgs} args - Arguments to find a Orders
     * @example
     * // Get one Orders
     * const orders = await prisma.orders.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ordersFindFirstOrThrowArgs>(args?: SelectSubset<T, ordersFindFirstOrThrowArgs<ExtArgs>>): Prisma__ordersClient<$Result.GetResult<Prisma.$ordersPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Orders that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ordersFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Orders
     * const orders = await prisma.orders.findMany()
     * 
     * // Get first 10 Orders
     * const orders = await prisma.orders.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const ordersWithIdOnly = await prisma.orders.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ordersFindManyArgs>(args?: SelectSubset<T, ordersFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ordersPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Orders.
     * @param {ordersCreateArgs} args - Arguments to create a Orders.
     * @example
     * // Create one Orders
     * const Orders = await prisma.orders.create({
     *   data: {
     *     // ... data to create a Orders
     *   }
     * })
     * 
     */
    create<T extends ordersCreateArgs>(args: SelectSubset<T, ordersCreateArgs<ExtArgs>>): Prisma__ordersClient<$Result.GetResult<Prisma.$ordersPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Orders.
     * @param {ordersCreateManyArgs} args - Arguments to create many Orders.
     * @example
     * // Create many Orders
     * const orders = await prisma.orders.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ordersCreateManyArgs>(args?: SelectSubset<T, ordersCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Orders and returns the data saved in the database.
     * @param {ordersCreateManyAndReturnArgs} args - Arguments to create many Orders.
     * @example
     * // Create many Orders
     * const orders = await prisma.orders.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Orders and only return the `id`
     * const ordersWithIdOnly = await prisma.orders.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ordersCreateManyAndReturnArgs>(args?: SelectSubset<T, ordersCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ordersPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Orders.
     * @param {ordersDeleteArgs} args - Arguments to delete one Orders.
     * @example
     * // Delete one Orders
     * const Orders = await prisma.orders.delete({
     *   where: {
     *     // ... filter to delete one Orders
     *   }
     * })
     * 
     */
    delete<T extends ordersDeleteArgs>(args: SelectSubset<T, ordersDeleteArgs<ExtArgs>>): Prisma__ordersClient<$Result.GetResult<Prisma.$ordersPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Orders.
     * @param {ordersUpdateArgs} args - Arguments to update one Orders.
     * @example
     * // Update one Orders
     * const orders = await prisma.orders.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ordersUpdateArgs>(args: SelectSubset<T, ordersUpdateArgs<ExtArgs>>): Prisma__ordersClient<$Result.GetResult<Prisma.$ordersPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Orders.
     * @param {ordersDeleteManyArgs} args - Arguments to filter Orders to delete.
     * @example
     * // Delete a few Orders
     * const { count } = await prisma.orders.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ordersDeleteManyArgs>(args?: SelectSubset<T, ordersDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Orders.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ordersUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Orders
     * const orders = await prisma.orders.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ordersUpdateManyArgs>(args: SelectSubset<T, ordersUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Orders and returns the data updated in the database.
     * @param {ordersUpdateManyAndReturnArgs} args - Arguments to update many Orders.
     * @example
     * // Update many Orders
     * const orders = await prisma.orders.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Orders and only return the `id`
     * const ordersWithIdOnly = await prisma.orders.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ordersUpdateManyAndReturnArgs>(args: SelectSubset<T, ordersUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ordersPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Orders.
     * @param {ordersUpsertArgs} args - Arguments to update or create a Orders.
     * @example
     * // Update or create a Orders
     * const orders = await prisma.orders.upsert({
     *   create: {
     *     // ... data to create a Orders
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Orders we want to update
     *   }
     * })
     */
    upsert<T extends ordersUpsertArgs>(args: SelectSubset<T, ordersUpsertArgs<ExtArgs>>): Prisma__ordersClient<$Result.GetResult<Prisma.$ordersPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Orders.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ordersCountArgs} args - Arguments to filter Orders to count.
     * @example
     * // Count the number of Orders
     * const count = await prisma.orders.count({
     *   where: {
     *     // ... the filter for the Orders we want to count
     *   }
     * })
    **/
    count<T extends ordersCountArgs>(
      args?: Subset<T, ordersCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OrdersCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Orders.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrdersAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends OrdersAggregateArgs>(args: Subset<T, OrdersAggregateArgs>): Prisma.PrismaPromise<GetOrdersAggregateType<T>>

    /**
     * Group by Orders.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ordersGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ordersGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ordersGroupByArgs['orderBy'] }
        : { orderBy?: ordersGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ordersGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOrdersGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the orders model
   */
  readonly fields: ordersFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for orders.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ordersClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    tickets<T extends orders$ticketsArgs<ExtArgs> = {}>(args?: Subset<T, orders$ticketsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ticketsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the orders model
   */
  interface ordersFieldRefs {
    readonly id: FieldRef<"orders", 'String'>
    readonly user_id: FieldRef<"orders", 'String'>
    readonly event_id: FieldRef<"orders", 'String'>
    readonly event_title: FieldRef<"orders", 'String'>
    readonly category_name: FieldRef<"orders", 'String'>
    readonly user_email: FieldRef<"orders", 'String'>
    readonly total_amount: FieldRef<"orders", 'Decimal'>
    readonly status: FieldRef<"orders", 'order_status_enum'>
    readonly created_at: FieldRef<"orders", 'DateTime'>
    readonly updated_at: FieldRef<"orders", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * orders findUnique
   */
  export type ordersFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the orders
     */
    select?: ordersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the orders
     */
    omit?: ordersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ordersInclude<ExtArgs> | null
    /**
     * Filter, which orders to fetch.
     */
    where: ordersWhereUniqueInput
  }

  /**
   * orders findUniqueOrThrow
   */
  export type ordersFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the orders
     */
    select?: ordersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the orders
     */
    omit?: ordersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ordersInclude<ExtArgs> | null
    /**
     * Filter, which orders to fetch.
     */
    where: ordersWhereUniqueInput
  }

  /**
   * orders findFirst
   */
  export type ordersFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the orders
     */
    select?: ordersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the orders
     */
    omit?: ordersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ordersInclude<ExtArgs> | null
    /**
     * Filter, which orders to fetch.
     */
    where?: ordersWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of orders to fetch.
     */
    orderBy?: ordersOrderByWithRelationInput | ordersOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for orders.
     */
    cursor?: ordersWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` orders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` orders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of orders.
     */
    distinct?: OrdersScalarFieldEnum | OrdersScalarFieldEnum[]
  }

  /**
   * orders findFirstOrThrow
   */
  export type ordersFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the orders
     */
    select?: ordersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the orders
     */
    omit?: ordersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ordersInclude<ExtArgs> | null
    /**
     * Filter, which orders to fetch.
     */
    where?: ordersWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of orders to fetch.
     */
    orderBy?: ordersOrderByWithRelationInput | ordersOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for orders.
     */
    cursor?: ordersWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` orders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` orders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of orders.
     */
    distinct?: OrdersScalarFieldEnum | OrdersScalarFieldEnum[]
  }

  /**
   * orders findMany
   */
  export type ordersFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the orders
     */
    select?: ordersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the orders
     */
    omit?: ordersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ordersInclude<ExtArgs> | null
    /**
     * Filter, which orders to fetch.
     */
    where?: ordersWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of orders to fetch.
     */
    orderBy?: ordersOrderByWithRelationInput | ordersOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing orders.
     */
    cursor?: ordersWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` orders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` orders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of orders.
     */
    distinct?: OrdersScalarFieldEnum | OrdersScalarFieldEnum[]
  }

  /**
   * orders create
   */
  export type ordersCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the orders
     */
    select?: ordersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the orders
     */
    omit?: ordersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ordersInclude<ExtArgs> | null
    /**
     * The data needed to create a orders.
     */
    data: XOR<ordersCreateInput, ordersUncheckedCreateInput>
  }

  /**
   * orders createMany
   */
  export type ordersCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many orders.
     */
    data: ordersCreateManyInput | ordersCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * orders createManyAndReturn
   */
  export type ordersCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the orders
     */
    select?: ordersSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the orders
     */
    omit?: ordersOmit<ExtArgs> | null
    /**
     * The data used to create many orders.
     */
    data: ordersCreateManyInput | ordersCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * orders update
   */
  export type ordersUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the orders
     */
    select?: ordersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the orders
     */
    omit?: ordersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ordersInclude<ExtArgs> | null
    /**
     * The data needed to update a orders.
     */
    data: XOR<ordersUpdateInput, ordersUncheckedUpdateInput>
    /**
     * Choose, which orders to update.
     */
    where: ordersWhereUniqueInput
  }

  /**
   * orders updateMany
   */
  export type ordersUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update orders.
     */
    data: XOR<ordersUpdateManyMutationInput, ordersUncheckedUpdateManyInput>
    /**
     * Filter which orders to update
     */
    where?: ordersWhereInput
    /**
     * Limit how many orders to update.
     */
    limit?: number
  }

  /**
   * orders updateManyAndReturn
   */
  export type ordersUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the orders
     */
    select?: ordersSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the orders
     */
    omit?: ordersOmit<ExtArgs> | null
    /**
     * The data used to update orders.
     */
    data: XOR<ordersUpdateManyMutationInput, ordersUncheckedUpdateManyInput>
    /**
     * Filter which orders to update
     */
    where?: ordersWhereInput
    /**
     * Limit how many orders to update.
     */
    limit?: number
  }

  /**
   * orders upsert
   */
  export type ordersUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the orders
     */
    select?: ordersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the orders
     */
    omit?: ordersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ordersInclude<ExtArgs> | null
    /**
     * The filter to search for the orders to update in case it exists.
     */
    where: ordersWhereUniqueInput
    /**
     * In case the orders found by the `where` argument doesn't exist, create a new orders with this data.
     */
    create: XOR<ordersCreateInput, ordersUncheckedCreateInput>
    /**
     * In case the orders was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ordersUpdateInput, ordersUncheckedUpdateInput>
  }

  /**
   * orders delete
   */
  export type ordersDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the orders
     */
    select?: ordersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the orders
     */
    omit?: ordersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ordersInclude<ExtArgs> | null
    /**
     * Filter which orders to delete.
     */
    where: ordersWhereUniqueInput
  }

  /**
   * orders deleteMany
   */
  export type ordersDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which orders to delete
     */
    where?: ordersWhereInput
    /**
     * Limit how many orders to delete.
     */
    limit?: number
  }

  /**
   * orders.tickets
   */
  export type orders$ticketsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tickets
     */
    select?: ticketsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tickets
     */
    omit?: ticketsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ticketsInclude<ExtArgs> | null
    where?: ticketsWhereInput
    orderBy?: ticketsOrderByWithRelationInput | ticketsOrderByWithRelationInput[]
    cursor?: ticketsWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TicketsScalarFieldEnum | TicketsScalarFieldEnum[]
  }

  /**
   * orders without action
   */
  export type ordersDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the orders
     */
    select?: ordersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the orders
     */
    omit?: ordersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ordersInclude<ExtArgs> | null
  }


  /**
   * Model tickets
   */

  export type AggregateTickets = {
    _count: TicketsCountAggregateOutputType | null
    _min: TicketsMinAggregateOutputType | null
    _max: TicketsMaxAggregateOutputType | null
  }

  export type TicketsMinAggregateOutputType = {
    id: string | null
    order_id: string | null
    seat_id: string | null
    qr_code: string | null
    issued_at: Date | null
    status: $Enums.ticket_status_enum | null
  }

  export type TicketsMaxAggregateOutputType = {
    id: string | null
    order_id: string | null
    seat_id: string | null
    qr_code: string | null
    issued_at: Date | null
    status: $Enums.ticket_status_enum | null
  }

  export type TicketsCountAggregateOutputType = {
    id: number
    order_id: number
    seat_id: number
    qr_code: number
    issued_at: number
    status: number
    _all: number
  }


  export type TicketsMinAggregateInputType = {
    id?: true
    order_id?: true
    seat_id?: true
    qr_code?: true
    issued_at?: true
    status?: true
  }

  export type TicketsMaxAggregateInputType = {
    id?: true
    order_id?: true
    seat_id?: true
    qr_code?: true
    issued_at?: true
    status?: true
  }

  export type TicketsCountAggregateInputType = {
    id?: true
    order_id?: true
    seat_id?: true
    qr_code?: true
    issued_at?: true
    status?: true
    _all?: true
  }

  export type TicketsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which tickets to aggregate.
     */
    where?: ticketsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tickets to fetch.
     */
    orderBy?: ticketsOrderByWithRelationInput | ticketsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ticketsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tickets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tickets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned tickets
    **/
    _count?: true | TicketsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TicketsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TicketsMaxAggregateInputType
  }

  export type GetTicketsAggregateType<T extends TicketsAggregateArgs> = {
        [P in keyof T & keyof AggregateTickets]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTickets[P]>
      : GetScalarType<T[P], AggregateTickets[P]>
  }




  export type ticketsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ticketsWhereInput
    orderBy?: ticketsOrderByWithAggregationInput | ticketsOrderByWithAggregationInput[]
    by: TicketsScalarFieldEnum[] | TicketsScalarFieldEnum
    having?: ticketsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TicketsCountAggregateInputType | true
    _min?: TicketsMinAggregateInputType
    _max?: TicketsMaxAggregateInputType
  }

  export type TicketsGroupByOutputType = {
    id: string
    order_id: string
    seat_id: string
    qr_code: string
    issued_at: Date | null
    status: $Enums.ticket_status_enum | null
    _count: TicketsCountAggregateOutputType | null
    _min: TicketsMinAggregateOutputType | null
    _max: TicketsMaxAggregateOutputType | null
  }

  type GetTicketsGroupByPayload<T extends ticketsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TicketsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TicketsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TicketsGroupByOutputType[P]>
            : GetScalarType<T[P], TicketsGroupByOutputType[P]>
        }
      >
    >


  export type ticketsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    order_id?: boolean
    seat_id?: boolean
    qr_code?: boolean
    issued_at?: boolean
    status?: boolean
    orders?: boolean | ordersDefaultArgs<ExtArgs>
    seats?: boolean | seatsDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tickets"]>

  export type ticketsSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    order_id?: boolean
    seat_id?: boolean
    qr_code?: boolean
    issued_at?: boolean
    status?: boolean
    orders?: boolean | ordersDefaultArgs<ExtArgs>
    seats?: boolean | seatsDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tickets"]>

  export type ticketsSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    order_id?: boolean
    seat_id?: boolean
    qr_code?: boolean
    issued_at?: boolean
    status?: boolean
    orders?: boolean | ordersDefaultArgs<ExtArgs>
    seats?: boolean | seatsDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tickets"]>

  export type ticketsSelectScalar = {
    id?: boolean
    order_id?: boolean
    seat_id?: boolean
    qr_code?: boolean
    issued_at?: boolean
    status?: boolean
  }

  export type ticketsOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "order_id" | "seat_id" | "qr_code" | "issued_at" | "status", ExtArgs["result"]["tickets"]>
  export type ticketsInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    orders?: boolean | ordersDefaultArgs<ExtArgs>
    seats?: boolean | seatsDefaultArgs<ExtArgs>
  }
  export type ticketsIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    orders?: boolean | ordersDefaultArgs<ExtArgs>
    seats?: boolean | seatsDefaultArgs<ExtArgs>
  }
  export type ticketsIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    orders?: boolean | ordersDefaultArgs<ExtArgs>
    seats?: boolean | seatsDefaultArgs<ExtArgs>
  }

  export type $ticketsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "tickets"
    objects: {
      orders: Prisma.$ordersPayload<ExtArgs>
      seats: Prisma.$seatsPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      order_id: string
      seat_id: string
      qr_code: string
      issued_at: Date | null
      status: $Enums.ticket_status_enum | null
    }, ExtArgs["result"]["tickets"]>
    composites: {}
  }

  type ticketsGetPayload<S extends boolean | null | undefined | ticketsDefaultArgs> = $Result.GetResult<Prisma.$ticketsPayload, S>

  type ticketsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ticketsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TicketsCountAggregateInputType | true
    }

  export interface ticketsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['tickets'], meta: { name: 'tickets' } }
    /**
     * Find zero or one Tickets that matches the filter.
     * @param {ticketsFindUniqueArgs} args - Arguments to find a Tickets
     * @example
     * // Get one Tickets
     * const tickets = await prisma.tickets.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ticketsFindUniqueArgs>(args: SelectSubset<T, ticketsFindUniqueArgs<ExtArgs>>): Prisma__ticketsClient<$Result.GetResult<Prisma.$ticketsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Tickets that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ticketsFindUniqueOrThrowArgs} args - Arguments to find a Tickets
     * @example
     * // Get one Tickets
     * const tickets = await prisma.tickets.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ticketsFindUniqueOrThrowArgs>(args: SelectSubset<T, ticketsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ticketsClient<$Result.GetResult<Prisma.$ticketsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tickets that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ticketsFindFirstArgs} args - Arguments to find a Tickets
     * @example
     * // Get one Tickets
     * const tickets = await prisma.tickets.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ticketsFindFirstArgs>(args?: SelectSubset<T, ticketsFindFirstArgs<ExtArgs>>): Prisma__ticketsClient<$Result.GetResult<Prisma.$ticketsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tickets that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ticketsFindFirstOrThrowArgs} args - Arguments to find a Tickets
     * @example
     * // Get one Tickets
     * const tickets = await prisma.tickets.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ticketsFindFirstOrThrowArgs>(args?: SelectSubset<T, ticketsFindFirstOrThrowArgs<ExtArgs>>): Prisma__ticketsClient<$Result.GetResult<Prisma.$ticketsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Tickets that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ticketsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Tickets
     * const tickets = await prisma.tickets.findMany()
     * 
     * // Get first 10 Tickets
     * const tickets = await prisma.tickets.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const ticketsWithIdOnly = await prisma.tickets.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ticketsFindManyArgs>(args?: SelectSubset<T, ticketsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ticketsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Tickets.
     * @param {ticketsCreateArgs} args - Arguments to create a Tickets.
     * @example
     * // Create one Tickets
     * const Tickets = await prisma.tickets.create({
     *   data: {
     *     // ... data to create a Tickets
     *   }
     * })
     * 
     */
    create<T extends ticketsCreateArgs>(args: SelectSubset<T, ticketsCreateArgs<ExtArgs>>): Prisma__ticketsClient<$Result.GetResult<Prisma.$ticketsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Tickets.
     * @param {ticketsCreateManyArgs} args - Arguments to create many Tickets.
     * @example
     * // Create many Tickets
     * const tickets = await prisma.tickets.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ticketsCreateManyArgs>(args?: SelectSubset<T, ticketsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Tickets and returns the data saved in the database.
     * @param {ticketsCreateManyAndReturnArgs} args - Arguments to create many Tickets.
     * @example
     * // Create many Tickets
     * const tickets = await prisma.tickets.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Tickets and only return the `id`
     * const ticketsWithIdOnly = await prisma.tickets.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ticketsCreateManyAndReturnArgs>(args?: SelectSubset<T, ticketsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ticketsPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Tickets.
     * @param {ticketsDeleteArgs} args - Arguments to delete one Tickets.
     * @example
     * // Delete one Tickets
     * const Tickets = await prisma.tickets.delete({
     *   where: {
     *     // ... filter to delete one Tickets
     *   }
     * })
     * 
     */
    delete<T extends ticketsDeleteArgs>(args: SelectSubset<T, ticketsDeleteArgs<ExtArgs>>): Prisma__ticketsClient<$Result.GetResult<Prisma.$ticketsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Tickets.
     * @param {ticketsUpdateArgs} args - Arguments to update one Tickets.
     * @example
     * // Update one Tickets
     * const tickets = await prisma.tickets.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ticketsUpdateArgs>(args: SelectSubset<T, ticketsUpdateArgs<ExtArgs>>): Prisma__ticketsClient<$Result.GetResult<Prisma.$ticketsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Tickets.
     * @param {ticketsDeleteManyArgs} args - Arguments to filter Tickets to delete.
     * @example
     * // Delete a few Tickets
     * const { count } = await prisma.tickets.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ticketsDeleteManyArgs>(args?: SelectSubset<T, ticketsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tickets.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ticketsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Tickets
     * const tickets = await prisma.tickets.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ticketsUpdateManyArgs>(args: SelectSubset<T, ticketsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tickets and returns the data updated in the database.
     * @param {ticketsUpdateManyAndReturnArgs} args - Arguments to update many Tickets.
     * @example
     * // Update many Tickets
     * const tickets = await prisma.tickets.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Tickets and only return the `id`
     * const ticketsWithIdOnly = await prisma.tickets.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ticketsUpdateManyAndReturnArgs>(args: SelectSubset<T, ticketsUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ticketsPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Tickets.
     * @param {ticketsUpsertArgs} args - Arguments to update or create a Tickets.
     * @example
     * // Update or create a Tickets
     * const tickets = await prisma.tickets.upsert({
     *   create: {
     *     // ... data to create a Tickets
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Tickets we want to update
     *   }
     * })
     */
    upsert<T extends ticketsUpsertArgs>(args: SelectSubset<T, ticketsUpsertArgs<ExtArgs>>): Prisma__ticketsClient<$Result.GetResult<Prisma.$ticketsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Tickets.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ticketsCountArgs} args - Arguments to filter Tickets to count.
     * @example
     * // Count the number of Tickets
     * const count = await prisma.tickets.count({
     *   where: {
     *     // ... the filter for the Tickets we want to count
     *   }
     * })
    **/
    count<T extends ticketsCountArgs>(
      args?: Subset<T, ticketsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TicketsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Tickets.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TicketsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TicketsAggregateArgs>(args: Subset<T, TicketsAggregateArgs>): Prisma.PrismaPromise<GetTicketsAggregateType<T>>

    /**
     * Group by Tickets.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ticketsGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ticketsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ticketsGroupByArgs['orderBy'] }
        : { orderBy?: ticketsGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ticketsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTicketsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the tickets model
   */
  readonly fields: ticketsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for tickets.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ticketsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    orders<T extends ordersDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ordersDefaultArgs<ExtArgs>>): Prisma__ordersClient<$Result.GetResult<Prisma.$ordersPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    seats<T extends seatsDefaultArgs<ExtArgs> = {}>(args?: Subset<T, seatsDefaultArgs<ExtArgs>>): Prisma__seatsClient<$Result.GetResult<Prisma.$seatsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the tickets model
   */
  interface ticketsFieldRefs {
    readonly id: FieldRef<"tickets", 'String'>
    readonly order_id: FieldRef<"tickets", 'String'>
    readonly seat_id: FieldRef<"tickets", 'String'>
    readonly qr_code: FieldRef<"tickets", 'String'>
    readonly issued_at: FieldRef<"tickets", 'DateTime'>
    readonly status: FieldRef<"tickets", 'ticket_status_enum'>
  }
    

  // Custom InputTypes
  /**
   * tickets findUnique
   */
  export type ticketsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tickets
     */
    select?: ticketsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tickets
     */
    omit?: ticketsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ticketsInclude<ExtArgs> | null
    /**
     * Filter, which tickets to fetch.
     */
    where: ticketsWhereUniqueInput
  }

  /**
   * tickets findUniqueOrThrow
   */
  export type ticketsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tickets
     */
    select?: ticketsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tickets
     */
    omit?: ticketsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ticketsInclude<ExtArgs> | null
    /**
     * Filter, which tickets to fetch.
     */
    where: ticketsWhereUniqueInput
  }

  /**
   * tickets findFirst
   */
  export type ticketsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tickets
     */
    select?: ticketsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tickets
     */
    omit?: ticketsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ticketsInclude<ExtArgs> | null
    /**
     * Filter, which tickets to fetch.
     */
    where?: ticketsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tickets to fetch.
     */
    orderBy?: ticketsOrderByWithRelationInput | ticketsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for tickets.
     */
    cursor?: ticketsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tickets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tickets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tickets.
     */
    distinct?: TicketsScalarFieldEnum | TicketsScalarFieldEnum[]
  }

  /**
   * tickets findFirstOrThrow
   */
  export type ticketsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tickets
     */
    select?: ticketsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tickets
     */
    omit?: ticketsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ticketsInclude<ExtArgs> | null
    /**
     * Filter, which tickets to fetch.
     */
    where?: ticketsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tickets to fetch.
     */
    orderBy?: ticketsOrderByWithRelationInput | ticketsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for tickets.
     */
    cursor?: ticketsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tickets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tickets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tickets.
     */
    distinct?: TicketsScalarFieldEnum | TicketsScalarFieldEnum[]
  }

  /**
   * tickets findMany
   */
  export type ticketsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tickets
     */
    select?: ticketsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tickets
     */
    omit?: ticketsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ticketsInclude<ExtArgs> | null
    /**
     * Filter, which tickets to fetch.
     */
    where?: ticketsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tickets to fetch.
     */
    orderBy?: ticketsOrderByWithRelationInput | ticketsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing tickets.
     */
    cursor?: ticketsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tickets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tickets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tickets.
     */
    distinct?: TicketsScalarFieldEnum | TicketsScalarFieldEnum[]
  }

  /**
   * tickets create
   */
  export type ticketsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tickets
     */
    select?: ticketsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tickets
     */
    omit?: ticketsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ticketsInclude<ExtArgs> | null
    /**
     * The data needed to create a tickets.
     */
    data: XOR<ticketsCreateInput, ticketsUncheckedCreateInput>
  }

  /**
   * tickets createMany
   */
  export type ticketsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many tickets.
     */
    data: ticketsCreateManyInput | ticketsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * tickets createManyAndReturn
   */
  export type ticketsCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tickets
     */
    select?: ticketsSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the tickets
     */
    omit?: ticketsOmit<ExtArgs> | null
    /**
     * The data used to create many tickets.
     */
    data: ticketsCreateManyInput | ticketsCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ticketsIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * tickets update
   */
  export type ticketsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tickets
     */
    select?: ticketsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tickets
     */
    omit?: ticketsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ticketsInclude<ExtArgs> | null
    /**
     * The data needed to update a tickets.
     */
    data: XOR<ticketsUpdateInput, ticketsUncheckedUpdateInput>
    /**
     * Choose, which tickets to update.
     */
    where: ticketsWhereUniqueInput
  }

  /**
   * tickets updateMany
   */
  export type ticketsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update tickets.
     */
    data: XOR<ticketsUpdateManyMutationInput, ticketsUncheckedUpdateManyInput>
    /**
     * Filter which tickets to update
     */
    where?: ticketsWhereInput
    /**
     * Limit how many tickets to update.
     */
    limit?: number
  }

  /**
   * tickets updateManyAndReturn
   */
  export type ticketsUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tickets
     */
    select?: ticketsSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the tickets
     */
    omit?: ticketsOmit<ExtArgs> | null
    /**
     * The data used to update tickets.
     */
    data: XOR<ticketsUpdateManyMutationInput, ticketsUncheckedUpdateManyInput>
    /**
     * Filter which tickets to update
     */
    where?: ticketsWhereInput
    /**
     * Limit how many tickets to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ticketsIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * tickets upsert
   */
  export type ticketsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tickets
     */
    select?: ticketsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tickets
     */
    omit?: ticketsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ticketsInclude<ExtArgs> | null
    /**
     * The filter to search for the tickets to update in case it exists.
     */
    where: ticketsWhereUniqueInput
    /**
     * In case the tickets found by the `where` argument doesn't exist, create a new tickets with this data.
     */
    create: XOR<ticketsCreateInput, ticketsUncheckedCreateInput>
    /**
     * In case the tickets was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ticketsUpdateInput, ticketsUncheckedUpdateInput>
  }

  /**
   * tickets delete
   */
  export type ticketsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tickets
     */
    select?: ticketsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tickets
     */
    omit?: ticketsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ticketsInclude<ExtArgs> | null
    /**
     * Filter which tickets to delete.
     */
    where: ticketsWhereUniqueInput
  }

  /**
   * tickets deleteMany
   */
  export type ticketsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which tickets to delete
     */
    where?: ticketsWhereInput
    /**
     * Limit how many tickets to delete.
     */
    limit?: number
  }

  /**
   * tickets without action
   */
  export type ticketsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tickets
     */
    select?: ticketsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tickets
     */
    omit?: ticketsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ticketsInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const SeatsScalarFieldEnum: {
    id: 'id',
    zone_id: 'zone_id',
    zone_name: 'zone_name',
    zone_price: 'zone_price',
    event_id: 'event_id',
    row_label: 'row_label',
    seat_number: 'seat_number',
    status: 'status',
    locked_by: 'locked_by',
    locked_at: 'locked_at'
  };

  export type SeatsScalarFieldEnum = (typeof SeatsScalarFieldEnum)[keyof typeof SeatsScalarFieldEnum]


  export const OrdersScalarFieldEnum: {
    id: 'id',
    user_id: 'user_id',
    event_id: 'event_id',
    event_title: 'event_title',
    category_name: 'category_name',
    user_email: 'user_email',
    total_amount: 'total_amount',
    status: 'status',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type OrdersScalarFieldEnum = (typeof OrdersScalarFieldEnum)[keyof typeof OrdersScalarFieldEnum]


  export const TicketsScalarFieldEnum: {
    id: 'id',
    order_id: 'order_id',
    seat_id: 'seat_id',
    qr_code: 'qr_code',
    issued_at: 'issued_at',
    status: 'status'
  };

  export type TicketsScalarFieldEnum = (typeof TicketsScalarFieldEnum)[keyof typeof TicketsScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Decimal'
   */
  export type DecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal'>
    


  /**
   * Reference to a field of type 'Decimal[]'
   */
  export type ListDecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'seat_status_enum'
   */
  export type Enumseat_status_enumFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'seat_status_enum'>
    


  /**
   * Reference to a field of type 'seat_status_enum[]'
   */
  export type ListEnumseat_status_enumFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'seat_status_enum[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'order_status_enum'
   */
  export type Enumorder_status_enumFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'order_status_enum'>
    


  /**
   * Reference to a field of type 'order_status_enum[]'
   */
  export type ListEnumorder_status_enumFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'order_status_enum[]'>
    


  /**
   * Reference to a field of type 'ticket_status_enum'
   */
  export type Enumticket_status_enumFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ticket_status_enum'>
    


  /**
   * Reference to a field of type 'ticket_status_enum[]'
   */
  export type ListEnumticket_status_enumFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ticket_status_enum[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type seatsWhereInput = {
    AND?: seatsWhereInput | seatsWhereInput[]
    OR?: seatsWhereInput[]
    NOT?: seatsWhereInput | seatsWhereInput[]
    id?: UuidFilter<"seats"> | string
    zone_id?: UuidFilter<"seats"> | string
    zone_name?: StringFilter<"seats"> | string
    zone_price?: DecimalFilter<"seats"> | Decimal | DecimalJsLike | number | string
    event_id?: UuidFilter<"seats"> | string
    row_label?: StringFilter<"seats"> | string
    seat_number?: IntFilter<"seats"> | number
    status?: Enumseat_status_enumNullableFilter<"seats"> | $Enums.seat_status_enum | null
    locked_by?: UuidNullableFilter<"seats"> | string | null
    locked_at?: DateTimeNullableFilter<"seats"> | Date | string | null
    tickets?: XOR<TicketsNullableScalarRelationFilter, ticketsWhereInput> | null
  }

  export type seatsOrderByWithRelationInput = {
    id?: SortOrder
    zone_id?: SortOrder
    zone_name?: SortOrder
    zone_price?: SortOrder
    event_id?: SortOrder
    row_label?: SortOrder
    seat_number?: SortOrder
    status?: SortOrderInput | SortOrder
    locked_by?: SortOrderInput | SortOrder
    locked_at?: SortOrderInput | SortOrder
    tickets?: ticketsOrderByWithRelationInput
  }

  export type seatsWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    zone_id_row_label_seat_number?: seatsZone_idRow_labelSeat_numberCompoundUniqueInput
    AND?: seatsWhereInput | seatsWhereInput[]
    OR?: seatsWhereInput[]
    NOT?: seatsWhereInput | seatsWhereInput[]
    zone_id?: UuidFilter<"seats"> | string
    zone_name?: StringFilter<"seats"> | string
    zone_price?: DecimalFilter<"seats"> | Decimal | DecimalJsLike | number | string
    event_id?: UuidFilter<"seats"> | string
    row_label?: StringFilter<"seats"> | string
    seat_number?: IntFilter<"seats"> | number
    status?: Enumseat_status_enumNullableFilter<"seats"> | $Enums.seat_status_enum | null
    locked_by?: UuidNullableFilter<"seats"> | string | null
    locked_at?: DateTimeNullableFilter<"seats"> | Date | string | null
    tickets?: XOR<TicketsNullableScalarRelationFilter, ticketsWhereInput> | null
  }, "id" | "zone_id_row_label_seat_number">

  export type seatsOrderByWithAggregationInput = {
    id?: SortOrder
    zone_id?: SortOrder
    zone_name?: SortOrder
    zone_price?: SortOrder
    event_id?: SortOrder
    row_label?: SortOrder
    seat_number?: SortOrder
    status?: SortOrderInput | SortOrder
    locked_by?: SortOrderInput | SortOrder
    locked_at?: SortOrderInput | SortOrder
    _count?: seatsCountOrderByAggregateInput
    _avg?: seatsAvgOrderByAggregateInput
    _max?: seatsMaxOrderByAggregateInput
    _min?: seatsMinOrderByAggregateInput
    _sum?: seatsSumOrderByAggregateInput
  }

  export type seatsScalarWhereWithAggregatesInput = {
    AND?: seatsScalarWhereWithAggregatesInput | seatsScalarWhereWithAggregatesInput[]
    OR?: seatsScalarWhereWithAggregatesInput[]
    NOT?: seatsScalarWhereWithAggregatesInput | seatsScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"seats"> | string
    zone_id?: UuidWithAggregatesFilter<"seats"> | string
    zone_name?: StringWithAggregatesFilter<"seats"> | string
    zone_price?: DecimalWithAggregatesFilter<"seats"> | Decimal | DecimalJsLike | number | string
    event_id?: UuidWithAggregatesFilter<"seats"> | string
    row_label?: StringWithAggregatesFilter<"seats"> | string
    seat_number?: IntWithAggregatesFilter<"seats"> | number
    status?: Enumseat_status_enumNullableWithAggregatesFilter<"seats"> | $Enums.seat_status_enum | null
    locked_by?: UuidNullableWithAggregatesFilter<"seats"> | string | null
    locked_at?: DateTimeNullableWithAggregatesFilter<"seats"> | Date | string | null
  }

  export type ordersWhereInput = {
    AND?: ordersWhereInput | ordersWhereInput[]
    OR?: ordersWhereInput[]
    NOT?: ordersWhereInput | ordersWhereInput[]
    id?: UuidFilter<"orders"> | string
    user_id?: UuidFilter<"orders"> | string
    event_id?: UuidFilter<"orders"> | string
    event_title?: StringFilter<"orders"> | string
    category_name?: StringNullableFilter<"orders"> | string | null
    user_email?: StringFilter<"orders"> | string
    total_amount?: DecimalFilter<"orders"> | Decimal | DecimalJsLike | number | string
    status?: Enumorder_status_enumNullableFilter<"orders"> | $Enums.order_status_enum | null
    created_at?: DateTimeNullableFilter<"orders"> | Date | string | null
    updated_at?: DateTimeNullableFilter<"orders"> | Date | string | null
    tickets?: TicketsListRelationFilter
  }

  export type ordersOrderByWithRelationInput = {
    id?: SortOrder
    user_id?: SortOrder
    event_id?: SortOrder
    event_title?: SortOrder
    category_name?: SortOrderInput | SortOrder
    user_email?: SortOrder
    total_amount?: SortOrder
    status?: SortOrderInput | SortOrder
    created_at?: SortOrderInput | SortOrder
    updated_at?: SortOrderInput | SortOrder
    tickets?: ticketsOrderByRelationAggregateInput
  }

  export type ordersWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ordersWhereInput | ordersWhereInput[]
    OR?: ordersWhereInput[]
    NOT?: ordersWhereInput | ordersWhereInput[]
    user_id?: UuidFilter<"orders"> | string
    event_id?: UuidFilter<"orders"> | string
    event_title?: StringFilter<"orders"> | string
    category_name?: StringNullableFilter<"orders"> | string | null
    user_email?: StringFilter<"orders"> | string
    total_amount?: DecimalFilter<"orders"> | Decimal | DecimalJsLike | number | string
    status?: Enumorder_status_enumNullableFilter<"orders"> | $Enums.order_status_enum | null
    created_at?: DateTimeNullableFilter<"orders"> | Date | string | null
    updated_at?: DateTimeNullableFilter<"orders"> | Date | string | null
    tickets?: TicketsListRelationFilter
  }, "id">

  export type ordersOrderByWithAggregationInput = {
    id?: SortOrder
    user_id?: SortOrder
    event_id?: SortOrder
    event_title?: SortOrder
    category_name?: SortOrderInput | SortOrder
    user_email?: SortOrder
    total_amount?: SortOrder
    status?: SortOrderInput | SortOrder
    created_at?: SortOrderInput | SortOrder
    updated_at?: SortOrderInput | SortOrder
    _count?: ordersCountOrderByAggregateInput
    _avg?: ordersAvgOrderByAggregateInput
    _max?: ordersMaxOrderByAggregateInput
    _min?: ordersMinOrderByAggregateInput
    _sum?: ordersSumOrderByAggregateInput
  }

  export type ordersScalarWhereWithAggregatesInput = {
    AND?: ordersScalarWhereWithAggregatesInput | ordersScalarWhereWithAggregatesInput[]
    OR?: ordersScalarWhereWithAggregatesInput[]
    NOT?: ordersScalarWhereWithAggregatesInput | ordersScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"orders"> | string
    user_id?: UuidWithAggregatesFilter<"orders"> | string
    event_id?: UuidWithAggregatesFilter<"orders"> | string
    event_title?: StringWithAggregatesFilter<"orders"> | string
    category_name?: StringNullableWithAggregatesFilter<"orders"> | string | null
    user_email?: StringWithAggregatesFilter<"orders"> | string
    total_amount?: DecimalWithAggregatesFilter<"orders"> | Decimal | DecimalJsLike | number | string
    status?: Enumorder_status_enumNullableWithAggregatesFilter<"orders"> | $Enums.order_status_enum | null
    created_at?: DateTimeNullableWithAggregatesFilter<"orders"> | Date | string | null
    updated_at?: DateTimeNullableWithAggregatesFilter<"orders"> | Date | string | null
  }

  export type ticketsWhereInput = {
    AND?: ticketsWhereInput | ticketsWhereInput[]
    OR?: ticketsWhereInput[]
    NOT?: ticketsWhereInput | ticketsWhereInput[]
    id?: UuidFilter<"tickets"> | string
    order_id?: UuidFilter<"tickets"> | string
    seat_id?: UuidFilter<"tickets"> | string
    qr_code?: StringFilter<"tickets"> | string
    issued_at?: DateTimeNullableFilter<"tickets"> | Date | string | null
    status?: Enumticket_status_enumNullableFilter<"tickets"> | $Enums.ticket_status_enum | null
    orders?: XOR<OrdersScalarRelationFilter, ordersWhereInput>
    seats?: XOR<SeatsScalarRelationFilter, seatsWhereInput>
  }

  export type ticketsOrderByWithRelationInput = {
    id?: SortOrder
    order_id?: SortOrder
    seat_id?: SortOrder
    qr_code?: SortOrder
    issued_at?: SortOrderInput | SortOrder
    status?: SortOrderInput | SortOrder
    orders?: ordersOrderByWithRelationInput
    seats?: seatsOrderByWithRelationInput
  }

  export type ticketsWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    seat_id?: string
    qr_code?: string
    AND?: ticketsWhereInput | ticketsWhereInput[]
    OR?: ticketsWhereInput[]
    NOT?: ticketsWhereInput | ticketsWhereInput[]
    order_id?: UuidFilter<"tickets"> | string
    issued_at?: DateTimeNullableFilter<"tickets"> | Date | string | null
    status?: Enumticket_status_enumNullableFilter<"tickets"> | $Enums.ticket_status_enum | null
    orders?: XOR<OrdersScalarRelationFilter, ordersWhereInput>
    seats?: XOR<SeatsScalarRelationFilter, seatsWhereInput>
  }, "id" | "seat_id" | "qr_code">

  export type ticketsOrderByWithAggregationInput = {
    id?: SortOrder
    order_id?: SortOrder
    seat_id?: SortOrder
    qr_code?: SortOrder
    issued_at?: SortOrderInput | SortOrder
    status?: SortOrderInput | SortOrder
    _count?: ticketsCountOrderByAggregateInput
    _max?: ticketsMaxOrderByAggregateInput
    _min?: ticketsMinOrderByAggregateInput
  }

  export type ticketsScalarWhereWithAggregatesInput = {
    AND?: ticketsScalarWhereWithAggregatesInput | ticketsScalarWhereWithAggregatesInput[]
    OR?: ticketsScalarWhereWithAggregatesInput[]
    NOT?: ticketsScalarWhereWithAggregatesInput | ticketsScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"tickets"> | string
    order_id?: UuidWithAggregatesFilter<"tickets"> | string
    seat_id?: UuidWithAggregatesFilter<"tickets"> | string
    qr_code?: StringWithAggregatesFilter<"tickets"> | string
    issued_at?: DateTimeNullableWithAggregatesFilter<"tickets"> | Date | string | null
    status?: Enumticket_status_enumNullableWithAggregatesFilter<"tickets"> | $Enums.ticket_status_enum | null
  }

  export type seatsCreateInput = {
    id?: string
    zone_id: string
    zone_name: string
    zone_price: Decimal | DecimalJsLike | number | string
    event_id: string
    row_label: string
    seat_number: number
    status?: $Enums.seat_status_enum | null
    locked_by?: string | null
    locked_at?: Date | string | null
    tickets?: ticketsCreateNestedOneWithoutSeatsInput
  }

  export type seatsUncheckedCreateInput = {
    id?: string
    zone_id: string
    zone_name: string
    zone_price: Decimal | DecimalJsLike | number | string
    event_id: string
    row_label: string
    seat_number: number
    status?: $Enums.seat_status_enum | null
    locked_by?: string | null
    locked_at?: Date | string | null
    tickets?: ticketsUncheckedCreateNestedOneWithoutSeatsInput
  }

  export type seatsUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    zone_id?: StringFieldUpdateOperationsInput | string
    zone_name?: StringFieldUpdateOperationsInput | string
    zone_price?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    event_id?: StringFieldUpdateOperationsInput | string
    row_label?: StringFieldUpdateOperationsInput | string
    seat_number?: IntFieldUpdateOperationsInput | number
    status?: NullableEnumseat_status_enumFieldUpdateOperationsInput | $Enums.seat_status_enum | null
    locked_by?: NullableStringFieldUpdateOperationsInput | string | null
    locked_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    tickets?: ticketsUpdateOneWithoutSeatsNestedInput
  }

  export type seatsUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    zone_id?: StringFieldUpdateOperationsInput | string
    zone_name?: StringFieldUpdateOperationsInput | string
    zone_price?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    event_id?: StringFieldUpdateOperationsInput | string
    row_label?: StringFieldUpdateOperationsInput | string
    seat_number?: IntFieldUpdateOperationsInput | number
    status?: NullableEnumseat_status_enumFieldUpdateOperationsInput | $Enums.seat_status_enum | null
    locked_by?: NullableStringFieldUpdateOperationsInput | string | null
    locked_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    tickets?: ticketsUncheckedUpdateOneWithoutSeatsNestedInput
  }

  export type seatsCreateManyInput = {
    id?: string
    zone_id: string
    zone_name: string
    zone_price: Decimal | DecimalJsLike | number | string
    event_id: string
    row_label: string
    seat_number: number
    status?: $Enums.seat_status_enum | null
    locked_by?: string | null
    locked_at?: Date | string | null
  }

  export type seatsUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    zone_id?: StringFieldUpdateOperationsInput | string
    zone_name?: StringFieldUpdateOperationsInput | string
    zone_price?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    event_id?: StringFieldUpdateOperationsInput | string
    row_label?: StringFieldUpdateOperationsInput | string
    seat_number?: IntFieldUpdateOperationsInput | number
    status?: NullableEnumseat_status_enumFieldUpdateOperationsInput | $Enums.seat_status_enum | null
    locked_by?: NullableStringFieldUpdateOperationsInput | string | null
    locked_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type seatsUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    zone_id?: StringFieldUpdateOperationsInput | string
    zone_name?: StringFieldUpdateOperationsInput | string
    zone_price?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    event_id?: StringFieldUpdateOperationsInput | string
    row_label?: StringFieldUpdateOperationsInput | string
    seat_number?: IntFieldUpdateOperationsInput | number
    status?: NullableEnumseat_status_enumFieldUpdateOperationsInput | $Enums.seat_status_enum | null
    locked_by?: NullableStringFieldUpdateOperationsInput | string | null
    locked_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ordersCreateInput = {
    id?: string
    user_id: string
    event_id: string
    event_title: string
    category_name?: string | null
    user_email: string
    total_amount: Decimal | DecimalJsLike | number | string
    status?: $Enums.order_status_enum | null
    created_at?: Date | string | null
    updated_at?: Date | string | null
    tickets?: ticketsCreateNestedManyWithoutOrdersInput
  }

  export type ordersUncheckedCreateInput = {
    id?: string
    user_id: string
    event_id: string
    event_title: string
    category_name?: string | null
    user_email: string
    total_amount: Decimal | DecimalJsLike | number | string
    status?: $Enums.order_status_enum | null
    created_at?: Date | string | null
    updated_at?: Date | string | null
    tickets?: ticketsUncheckedCreateNestedManyWithoutOrdersInput
  }

  export type ordersUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    user_id?: StringFieldUpdateOperationsInput | string
    event_id?: StringFieldUpdateOperationsInput | string
    event_title?: StringFieldUpdateOperationsInput | string
    category_name?: NullableStringFieldUpdateOperationsInput | string | null
    user_email?: StringFieldUpdateOperationsInput | string
    total_amount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    status?: NullableEnumorder_status_enumFieldUpdateOperationsInput | $Enums.order_status_enum | null
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updated_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    tickets?: ticketsUpdateManyWithoutOrdersNestedInput
  }

  export type ordersUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    user_id?: StringFieldUpdateOperationsInput | string
    event_id?: StringFieldUpdateOperationsInput | string
    event_title?: StringFieldUpdateOperationsInput | string
    category_name?: NullableStringFieldUpdateOperationsInput | string | null
    user_email?: StringFieldUpdateOperationsInput | string
    total_amount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    status?: NullableEnumorder_status_enumFieldUpdateOperationsInput | $Enums.order_status_enum | null
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updated_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    tickets?: ticketsUncheckedUpdateManyWithoutOrdersNestedInput
  }

  export type ordersCreateManyInput = {
    id?: string
    user_id: string
    event_id: string
    event_title: string
    category_name?: string | null
    user_email: string
    total_amount: Decimal | DecimalJsLike | number | string
    status?: $Enums.order_status_enum | null
    created_at?: Date | string | null
    updated_at?: Date | string | null
  }

  export type ordersUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    user_id?: StringFieldUpdateOperationsInput | string
    event_id?: StringFieldUpdateOperationsInput | string
    event_title?: StringFieldUpdateOperationsInput | string
    category_name?: NullableStringFieldUpdateOperationsInput | string | null
    user_email?: StringFieldUpdateOperationsInput | string
    total_amount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    status?: NullableEnumorder_status_enumFieldUpdateOperationsInput | $Enums.order_status_enum | null
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updated_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ordersUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    user_id?: StringFieldUpdateOperationsInput | string
    event_id?: StringFieldUpdateOperationsInput | string
    event_title?: StringFieldUpdateOperationsInput | string
    category_name?: NullableStringFieldUpdateOperationsInput | string | null
    user_email?: StringFieldUpdateOperationsInput | string
    total_amount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    status?: NullableEnumorder_status_enumFieldUpdateOperationsInput | $Enums.order_status_enum | null
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updated_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ticketsCreateInput = {
    id?: string
    qr_code: string
    issued_at?: Date | string | null
    status?: $Enums.ticket_status_enum | null
    orders: ordersCreateNestedOneWithoutTicketsInput
    seats: seatsCreateNestedOneWithoutTicketsInput
  }

  export type ticketsUncheckedCreateInput = {
    id?: string
    order_id: string
    seat_id: string
    qr_code: string
    issued_at?: Date | string | null
    status?: $Enums.ticket_status_enum | null
  }

  export type ticketsUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    qr_code?: StringFieldUpdateOperationsInput | string
    issued_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    status?: NullableEnumticket_status_enumFieldUpdateOperationsInput | $Enums.ticket_status_enum | null
    orders?: ordersUpdateOneRequiredWithoutTicketsNestedInput
    seats?: seatsUpdateOneRequiredWithoutTicketsNestedInput
  }

  export type ticketsUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    order_id?: StringFieldUpdateOperationsInput | string
    seat_id?: StringFieldUpdateOperationsInput | string
    qr_code?: StringFieldUpdateOperationsInput | string
    issued_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    status?: NullableEnumticket_status_enumFieldUpdateOperationsInput | $Enums.ticket_status_enum | null
  }

  export type ticketsCreateManyInput = {
    id?: string
    order_id: string
    seat_id: string
    qr_code: string
    issued_at?: Date | string | null
    status?: $Enums.ticket_status_enum | null
  }

  export type ticketsUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    qr_code?: StringFieldUpdateOperationsInput | string
    issued_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    status?: NullableEnumticket_status_enumFieldUpdateOperationsInput | $Enums.ticket_status_enum | null
  }

  export type ticketsUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    order_id?: StringFieldUpdateOperationsInput | string
    seat_id?: StringFieldUpdateOperationsInput | string
    qr_code?: StringFieldUpdateOperationsInput | string
    issued_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    status?: NullableEnumticket_status_enumFieldUpdateOperationsInput | $Enums.ticket_status_enum | null
  }

  export type UuidFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidFilter<$PrismaModel> | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type DecimalFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type Enumseat_status_enumNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.seat_status_enum | Enumseat_status_enumFieldRefInput<$PrismaModel> | null
    in?: $Enums.seat_status_enum[] | ListEnumseat_status_enumFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.seat_status_enum[] | ListEnumseat_status_enumFieldRefInput<$PrismaModel> | null
    not?: NestedEnumseat_status_enumNullableFilter<$PrismaModel> | $Enums.seat_status_enum | null
  }

  export type UuidNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidNullableFilter<$PrismaModel> | string | null
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type TicketsNullableScalarRelationFilter = {
    is?: ticketsWhereInput | null
    isNot?: ticketsWhereInput | null
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type seatsZone_idRow_labelSeat_numberCompoundUniqueInput = {
    zone_id: string
    row_label: string
    seat_number: number
  }

  export type seatsCountOrderByAggregateInput = {
    id?: SortOrder
    zone_id?: SortOrder
    zone_name?: SortOrder
    zone_price?: SortOrder
    event_id?: SortOrder
    row_label?: SortOrder
    seat_number?: SortOrder
    status?: SortOrder
    locked_by?: SortOrder
    locked_at?: SortOrder
  }

  export type seatsAvgOrderByAggregateInput = {
    zone_price?: SortOrder
    seat_number?: SortOrder
  }

  export type seatsMaxOrderByAggregateInput = {
    id?: SortOrder
    zone_id?: SortOrder
    zone_name?: SortOrder
    zone_price?: SortOrder
    event_id?: SortOrder
    row_label?: SortOrder
    seat_number?: SortOrder
    status?: SortOrder
    locked_by?: SortOrder
    locked_at?: SortOrder
  }

  export type seatsMinOrderByAggregateInput = {
    id?: SortOrder
    zone_id?: SortOrder
    zone_name?: SortOrder
    zone_price?: SortOrder
    event_id?: SortOrder
    row_label?: SortOrder
    seat_number?: SortOrder
    status?: SortOrder
    locked_by?: SortOrder
    locked_at?: SortOrder
  }

  export type seatsSumOrderByAggregateInput = {
    zone_price?: SortOrder
    seat_number?: SortOrder
  }

  export type UuidWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type DecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedDecimalFilter<$PrismaModel>
    _sum?: NestedDecimalFilter<$PrismaModel>
    _min?: NestedDecimalFilter<$PrismaModel>
    _max?: NestedDecimalFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type Enumseat_status_enumNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.seat_status_enum | Enumseat_status_enumFieldRefInput<$PrismaModel> | null
    in?: $Enums.seat_status_enum[] | ListEnumseat_status_enumFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.seat_status_enum[] | ListEnumseat_status_enumFieldRefInput<$PrismaModel> | null
    not?: NestedEnumseat_status_enumNullableWithAggregatesFilter<$PrismaModel> | $Enums.seat_status_enum | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumseat_status_enumNullableFilter<$PrismaModel>
    _max?: NestedEnumseat_status_enumNullableFilter<$PrismaModel>
  }

  export type UuidNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type Enumorder_status_enumNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.order_status_enum | Enumorder_status_enumFieldRefInput<$PrismaModel> | null
    in?: $Enums.order_status_enum[] | ListEnumorder_status_enumFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.order_status_enum[] | ListEnumorder_status_enumFieldRefInput<$PrismaModel> | null
    not?: NestedEnumorder_status_enumNullableFilter<$PrismaModel> | $Enums.order_status_enum | null
  }

  export type TicketsListRelationFilter = {
    every?: ticketsWhereInput
    some?: ticketsWhereInput
    none?: ticketsWhereInput
  }

  export type ticketsOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ordersCountOrderByAggregateInput = {
    id?: SortOrder
    user_id?: SortOrder
    event_id?: SortOrder
    event_title?: SortOrder
    category_name?: SortOrder
    user_email?: SortOrder
    total_amount?: SortOrder
    status?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type ordersAvgOrderByAggregateInput = {
    total_amount?: SortOrder
  }

  export type ordersMaxOrderByAggregateInput = {
    id?: SortOrder
    user_id?: SortOrder
    event_id?: SortOrder
    event_title?: SortOrder
    category_name?: SortOrder
    user_email?: SortOrder
    total_amount?: SortOrder
    status?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type ordersMinOrderByAggregateInput = {
    id?: SortOrder
    user_id?: SortOrder
    event_id?: SortOrder
    event_title?: SortOrder
    category_name?: SortOrder
    user_email?: SortOrder
    total_amount?: SortOrder
    status?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type ordersSumOrderByAggregateInput = {
    total_amount?: SortOrder
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type Enumorder_status_enumNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.order_status_enum | Enumorder_status_enumFieldRefInput<$PrismaModel> | null
    in?: $Enums.order_status_enum[] | ListEnumorder_status_enumFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.order_status_enum[] | ListEnumorder_status_enumFieldRefInput<$PrismaModel> | null
    not?: NestedEnumorder_status_enumNullableWithAggregatesFilter<$PrismaModel> | $Enums.order_status_enum | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumorder_status_enumNullableFilter<$PrismaModel>
    _max?: NestedEnumorder_status_enumNullableFilter<$PrismaModel>
  }

  export type Enumticket_status_enumNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.ticket_status_enum | Enumticket_status_enumFieldRefInput<$PrismaModel> | null
    in?: $Enums.ticket_status_enum[] | ListEnumticket_status_enumFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.ticket_status_enum[] | ListEnumticket_status_enumFieldRefInput<$PrismaModel> | null
    not?: NestedEnumticket_status_enumNullableFilter<$PrismaModel> | $Enums.ticket_status_enum | null
  }

  export type OrdersScalarRelationFilter = {
    is?: ordersWhereInput
    isNot?: ordersWhereInput
  }

  export type SeatsScalarRelationFilter = {
    is?: seatsWhereInput
    isNot?: seatsWhereInput
  }

  export type ticketsCountOrderByAggregateInput = {
    id?: SortOrder
    order_id?: SortOrder
    seat_id?: SortOrder
    qr_code?: SortOrder
    issued_at?: SortOrder
    status?: SortOrder
  }

  export type ticketsMaxOrderByAggregateInput = {
    id?: SortOrder
    order_id?: SortOrder
    seat_id?: SortOrder
    qr_code?: SortOrder
    issued_at?: SortOrder
    status?: SortOrder
  }

  export type ticketsMinOrderByAggregateInput = {
    id?: SortOrder
    order_id?: SortOrder
    seat_id?: SortOrder
    qr_code?: SortOrder
    issued_at?: SortOrder
    status?: SortOrder
  }

  export type Enumticket_status_enumNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ticket_status_enum | Enumticket_status_enumFieldRefInput<$PrismaModel> | null
    in?: $Enums.ticket_status_enum[] | ListEnumticket_status_enumFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.ticket_status_enum[] | ListEnumticket_status_enumFieldRefInput<$PrismaModel> | null
    not?: NestedEnumticket_status_enumNullableWithAggregatesFilter<$PrismaModel> | $Enums.ticket_status_enum | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumticket_status_enumNullableFilter<$PrismaModel>
    _max?: NestedEnumticket_status_enumNullableFilter<$PrismaModel>
  }

  export type ticketsCreateNestedOneWithoutSeatsInput = {
    create?: XOR<ticketsCreateWithoutSeatsInput, ticketsUncheckedCreateWithoutSeatsInput>
    connectOrCreate?: ticketsCreateOrConnectWithoutSeatsInput
    connect?: ticketsWhereUniqueInput
  }

  export type ticketsUncheckedCreateNestedOneWithoutSeatsInput = {
    create?: XOR<ticketsCreateWithoutSeatsInput, ticketsUncheckedCreateWithoutSeatsInput>
    connectOrCreate?: ticketsCreateOrConnectWithoutSeatsInput
    connect?: ticketsWhereUniqueInput
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type DecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string
    increment?: Decimal | DecimalJsLike | number | string
    decrement?: Decimal | DecimalJsLike | number | string
    multiply?: Decimal | DecimalJsLike | number | string
    divide?: Decimal | DecimalJsLike | number | string
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableEnumseat_status_enumFieldUpdateOperationsInput = {
    set?: $Enums.seat_status_enum | null
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type ticketsUpdateOneWithoutSeatsNestedInput = {
    create?: XOR<ticketsCreateWithoutSeatsInput, ticketsUncheckedCreateWithoutSeatsInput>
    connectOrCreate?: ticketsCreateOrConnectWithoutSeatsInput
    upsert?: ticketsUpsertWithoutSeatsInput
    disconnect?: ticketsWhereInput | boolean
    delete?: ticketsWhereInput | boolean
    connect?: ticketsWhereUniqueInput
    update?: XOR<XOR<ticketsUpdateToOneWithWhereWithoutSeatsInput, ticketsUpdateWithoutSeatsInput>, ticketsUncheckedUpdateWithoutSeatsInput>
  }

  export type ticketsUncheckedUpdateOneWithoutSeatsNestedInput = {
    create?: XOR<ticketsCreateWithoutSeatsInput, ticketsUncheckedCreateWithoutSeatsInput>
    connectOrCreate?: ticketsCreateOrConnectWithoutSeatsInput
    upsert?: ticketsUpsertWithoutSeatsInput
    disconnect?: ticketsWhereInput | boolean
    delete?: ticketsWhereInput | boolean
    connect?: ticketsWhereUniqueInput
    update?: XOR<XOR<ticketsUpdateToOneWithWhereWithoutSeatsInput, ticketsUpdateWithoutSeatsInput>, ticketsUncheckedUpdateWithoutSeatsInput>
  }

  export type ticketsCreateNestedManyWithoutOrdersInput = {
    create?: XOR<ticketsCreateWithoutOrdersInput, ticketsUncheckedCreateWithoutOrdersInput> | ticketsCreateWithoutOrdersInput[] | ticketsUncheckedCreateWithoutOrdersInput[]
    connectOrCreate?: ticketsCreateOrConnectWithoutOrdersInput | ticketsCreateOrConnectWithoutOrdersInput[]
    createMany?: ticketsCreateManyOrdersInputEnvelope
    connect?: ticketsWhereUniqueInput | ticketsWhereUniqueInput[]
  }

  export type ticketsUncheckedCreateNestedManyWithoutOrdersInput = {
    create?: XOR<ticketsCreateWithoutOrdersInput, ticketsUncheckedCreateWithoutOrdersInput> | ticketsCreateWithoutOrdersInput[] | ticketsUncheckedCreateWithoutOrdersInput[]
    connectOrCreate?: ticketsCreateOrConnectWithoutOrdersInput | ticketsCreateOrConnectWithoutOrdersInput[]
    createMany?: ticketsCreateManyOrdersInputEnvelope
    connect?: ticketsWhereUniqueInput | ticketsWhereUniqueInput[]
  }

  export type NullableEnumorder_status_enumFieldUpdateOperationsInput = {
    set?: $Enums.order_status_enum | null
  }

  export type ticketsUpdateManyWithoutOrdersNestedInput = {
    create?: XOR<ticketsCreateWithoutOrdersInput, ticketsUncheckedCreateWithoutOrdersInput> | ticketsCreateWithoutOrdersInput[] | ticketsUncheckedCreateWithoutOrdersInput[]
    connectOrCreate?: ticketsCreateOrConnectWithoutOrdersInput | ticketsCreateOrConnectWithoutOrdersInput[]
    upsert?: ticketsUpsertWithWhereUniqueWithoutOrdersInput | ticketsUpsertWithWhereUniqueWithoutOrdersInput[]
    createMany?: ticketsCreateManyOrdersInputEnvelope
    set?: ticketsWhereUniqueInput | ticketsWhereUniqueInput[]
    disconnect?: ticketsWhereUniqueInput | ticketsWhereUniqueInput[]
    delete?: ticketsWhereUniqueInput | ticketsWhereUniqueInput[]
    connect?: ticketsWhereUniqueInput | ticketsWhereUniqueInput[]
    update?: ticketsUpdateWithWhereUniqueWithoutOrdersInput | ticketsUpdateWithWhereUniqueWithoutOrdersInput[]
    updateMany?: ticketsUpdateManyWithWhereWithoutOrdersInput | ticketsUpdateManyWithWhereWithoutOrdersInput[]
    deleteMany?: ticketsScalarWhereInput | ticketsScalarWhereInput[]
  }

  export type ticketsUncheckedUpdateManyWithoutOrdersNestedInput = {
    create?: XOR<ticketsCreateWithoutOrdersInput, ticketsUncheckedCreateWithoutOrdersInput> | ticketsCreateWithoutOrdersInput[] | ticketsUncheckedCreateWithoutOrdersInput[]
    connectOrCreate?: ticketsCreateOrConnectWithoutOrdersInput | ticketsCreateOrConnectWithoutOrdersInput[]
    upsert?: ticketsUpsertWithWhereUniqueWithoutOrdersInput | ticketsUpsertWithWhereUniqueWithoutOrdersInput[]
    createMany?: ticketsCreateManyOrdersInputEnvelope
    set?: ticketsWhereUniqueInput | ticketsWhereUniqueInput[]
    disconnect?: ticketsWhereUniqueInput | ticketsWhereUniqueInput[]
    delete?: ticketsWhereUniqueInput | ticketsWhereUniqueInput[]
    connect?: ticketsWhereUniqueInput | ticketsWhereUniqueInput[]
    update?: ticketsUpdateWithWhereUniqueWithoutOrdersInput | ticketsUpdateWithWhereUniqueWithoutOrdersInput[]
    updateMany?: ticketsUpdateManyWithWhereWithoutOrdersInput | ticketsUpdateManyWithWhereWithoutOrdersInput[]
    deleteMany?: ticketsScalarWhereInput | ticketsScalarWhereInput[]
  }

  export type ordersCreateNestedOneWithoutTicketsInput = {
    create?: XOR<ordersCreateWithoutTicketsInput, ordersUncheckedCreateWithoutTicketsInput>
    connectOrCreate?: ordersCreateOrConnectWithoutTicketsInput
    connect?: ordersWhereUniqueInput
  }

  export type seatsCreateNestedOneWithoutTicketsInput = {
    create?: XOR<seatsCreateWithoutTicketsInput, seatsUncheckedCreateWithoutTicketsInput>
    connectOrCreate?: seatsCreateOrConnectWithoutTicketsInput
    connect?: seatsWhereUniqueInput
  }

  export type NullableEnumticket_status_enumFieldUpdateOperationsInput = {
    set?: $Enums.ticket_status_enum | null
  }

  export type ordersUpdateOneRequiredWithoutTicketsNestedInput = {
    create?: XOR<ordersCreateWithoutTicketsInput, ordersUncheckedCreateWithoutTicketsInput>
    connectOrCreate?: ordersCreateOrConnectWithoutTicketsInput
    upsert?: ordersUpsertWithoutTicketsInput
    connect?: ordersWhereUniqueInput
    update?: XOR<XOR<ordersUpdateToOneWithWhereWithoutTicketsInput, ordersUpdateWithoutTicketsInput>, ordersUncheckedUpdateWithoutTicketsInput>
  }

  export type seatsUpdateOneRequiredWithoutTicketsNestedInput = {
    create?: XOR<seatsCreateWithoutTicketsInput, seatsUncheckedCreateWithoutTicketsInput>
    connectOrCreate?: seatsCreateOrConnectWithoutTicketsInput
    upsert?: seatsUpsertWithoutTicketsInput
    connect?: seatsWhereUniqueInput
    update?: XOR<XOR<seatsUpdateToOneWithWhereWithoutTicketsInput, seatsUpdateWithoutTicketsInput>, seatsUncheckedUpdateWithoutTicketsInput>
  }

  export type NestedUuidFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidFilter<$PrismaModel> | string
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedDecimalFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedEnumseat_status_enumNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.seat_status_enum | Enumseat_status_enumFieldRefInput<$PrismaModel> | null
    in?: $Enums.seat_status_enum[] | ListEnumseat_status_enumFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.seat_status_enum[] | ListEnumseat_status_enumFieldRefInput<$PrismaModel> | null
    not?: NestedEnumseat_status_enumNullableFilter<$PrismaModel> | $Enums.seat_status_enum | null
  }

  export type NestedUuidNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedUuidWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedDecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedDecimalFilter<$PrismaModel>
    _sum?: NestedDecimalFilter<$PrismaModel>
    _min?: NestedDecimalFilter<$PrismaModel>
    _max?: NestedDecimalFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedEnumseat_status_enumNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.seat_status_enum | Enumseat_status_enumFieldRefInput<$PrismaModel> | null
    in?: $Enums.seat_status_enum[] | ListEnumseat_status_enumFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.seat_status_enum[] | ListEnumseat_status_enumFieldRefInput<$PrismaModel> | null
    not?: NestedEnumseat_status_enumNullableWithAggregatesFilter<$PrismaModel> | $Enums.seat_status_enum | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumseat_status_enumNullableFilter<$PrismaModel>
    _max?: NestedEnumseat_status_enumNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedUuidNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedEnumorder_status_enumNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.order_status_enum | Enumorder_status_enumFieldRefInput<$PrismaModel> | null
    in?: $Enums.order_status_enum[] | ListEnumorder_status_enumFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.order_status_enum[] | ListEnumorder_status_enumFieldRefInput<$PrismaModel> | null
    not?: NestedEnumorder_status_enumNullableFilter<$PrismaModel> | $Enums.order_status_enum | null
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedEnumorder_status_enumNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.order_status_enum | Enumorder_status_enumFieldRefInput<$PrismaModel> | null
    in?: $Enums.order_status_enum[] | ListEnumorder_status_enumFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.order_status_enum[] | ListEnumorder_status_enumFieldRefInput<$PrismaModel> | null
    not?: NestedEnumorder_status_enumNullableWithAggregatesFilter<$PrismaModel> | $Enums.order_status_enum | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumorder_status_enumNullableFilter<$PrismaModel>
    _max?: NestedEnumorder_status_enumNullableFilter<$PrismaModel>
  }

  export type NestedEnumticket_status_enumNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.ticket_status_enum | Enumticket_status_enumFieldRefInput<$PrismaModel> | null
    in?: $Enums.ticket_status_enum[] | ListEnumticket_status_enumFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.ticket_status_enum[] | ListEnumticket_status_enumFieldRefInput<$PrismaModel> | null
    not?: NestedEnumticket_status_enumNullableFilter<$PrismaModel> | $Enums.ticket_status_enum | null
  }

  export type NestedEnumticket_status_enumNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ticket_status_enum | Enumticket_status_enumFieldRefInput<$PrismaModel> | null
    in?: $Enums.ticket_status_enum[] | ListEnumticket_status_enumFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.ticket_status_enum[] | ListEnumticket_status_enumFieldRefInput<$PrismaModel> | null
    not?: NestedEnumticket_status_enumNullableWithAggregatesFilter<$PrismaModel> | $Enums.ticket_status_enum | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumticket_status_enumNullableFilter<$PrismaModel>
    _max?: NestedEnumticket_status_enumNullableFilter<$PrismaModel>
  }

  export type ticketsCreateWithoutSeatsInput = {
    id?: string
    qr_code: string
    issued_at?: Date | string | null
    status?: $Enums.ticket_status_enum | null
    orders: ordersCreateNestedOneWithoutTicketsInput
  }

  export type ticketsUncheckedCreateWithoutSeatsInput = {
    id?: string
    order_id: string
    qr_code: string
    issued_at?: Date | string | null
    status?: $Enums.ticket_status_enum | null
  }

  export type ticketsCreateOrConnectWithoutSeatsInput = {
    where: ticketsWhereUniqueInput
    create: XOR<ticketsCreateWithoutSeatsInput, ticketsUncheckedCreateWithoutSeatsInput>
  }

  export type ticketsUpsertWithoutSeatsInput = {
    update: XOR<ticketsUpdateWithoutSeatsInput, ticketsUncheckedUpdateWithoutSeatsInput>
    create: XOR<ticketsCreateWithoutSeatsInput, ticketsUncheckedCreateWithoutSeatsInput>
    where?: ticketsWhereInput
  }

  export type ticketsUpdateToOneWithWhereWithoutSeatsInput = {
    where?: ticketsWhereInput
    data: XOR<ticketsUpdateWithoutSeatsInput, ticketsUncheckedUpdateWithoutSeatsInput>
  }

  export type ticketsUpdateWithoutSeatsInput = {
    id?: StringFieldUpdateOperationsInput | string
    qr_code?: StringFieldUpdateOperationsInput | string
    issued_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    status?: NullableEnumticket_status_enumFieldUpdateOperationsInput | $Enums.ticket_status_enum | null
    orders?: ordersUpdateOneRequiredWithoutTicketsNestedInput
  }

  export type ticketsUncheckedUpdateWithoutSeatsInput = {
    id?: StringFieldUpdateOperationsInput | string
    order_id?: StringFieldUpdateOperationsInput | string
    qr_code?: StringFieldUpdateOperationsInput | string
    issued_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    status?: NullableEnumticket_status_enumFieldUpdateOperationsInput | $Enums.ticket_status_enum | null
  }

  export type ticketsCreateWithoutOrdersInput = {
    id?: string
    qr_code: string
    issued_at?: Date | string | null
    status?: $Enums.ticket_status_enum | null
    seats: seatsCreateNestedOneWithoutTicketsInput
  }

  export type ticketsUncheckedCreateWithoutOrdersInput = {
    id?: string
    seat_id: string
    qr_code: string
    issued_at?: Date | string | null
    status?: $Enums.ticket_status_enum | null
  }

  export type ticketsCreateOrConnectWithoutOrdersInput = {
    where: ticketsWhereUniqueInput
    create: XOR<ticketsCreateWithoutOrdersInput, ticketsUncheckedCreateWithoutOrdersInput>
  }

  export type ticketsCreateManyOrdersInputEnvelope = {
    data: ticketsCreateManyOrdersInput | ticketsCreateManyOrdersInput[]
    skipDuplicates?: boolean
  }

  export type ticketsUpsertWithWhereUniqueWithoutOrdersInput = {
    where: ticketsWhereUniqueInput
    update: XOR<ticketsUpdateWithoutOrdersInput, ticketsUncheckedUpdateWithoutOrdersInput>
    create: XOR<ticketsCreateWithoutOrdersInput, ticketsUncheckedCreateWithoutOrdersInput>
  }

  export type ticketsUpdateWithWhereUniqueWithoutOrdersInput = {
    where: ticketsWhereUniqueInput
    data: XOR<ticketsUpdateWithoutOrdersInput, ticketsUncheckedUpdateWithoutOrdersInput>
  }

  export type ticketsUpdateManyWithWhereWithoutOrdersInput = {
    where: ticketsScalarWhereInput
    data: XOR<ticketsUpdateManyMutationInput, ticketsUncheckedUpdateManyWithoutOrdersInput>
  }

  export type ticketsScalarWhereInput = {
    AND?: ticketsScalarWhereInput | ticketsScalarWhereInput[]
    OR?: ticketsScalarWhereInput[]
    NOT?: ticketsScalarWhereInput | ticketsScalarWhereInput[]
    id?: UuidFilter<"tickets"> | string
    order_id?: UuidFilter<"tickets"> | string
    seat_id?: UuidFilter<"tickets"> | string
    qr_code?: StringFilter<"tickets"> | string
    issued_at?: DateTimeNullableFilter<"tickets"> | Date | string | null
    status?: Enumticket_status_enumNullableFilter<"tickets"> | $Enums.ticket_status_enum | null
  }

  export type ordersCreateWithoutTicketsInput = {
    id?: string
    user_id: string
    event_id: string
    event_title: string
    category_name?: string | null
    user_email: string
    total_amount: Decimal | DecimalJsLike | number | string
    status?: $Enums.order_status_enum | null
    created_at?: Date | string | null
    updated_at?: Date | string | null
  }

  export type ordersUncheckedCreateWithoutTicketsInput = {
    id?: string
    user_id: string
    event_id: string
    event_title: string
    category_name?: string | null
    user_email: string
    total_amount: Decimal | DecimalJsLike | number | string
    status?: $Enums.order_status_enum | null
    created_at?: Date | string | null
    updated_at?: Date | string | null
  }

  export type ordersCreateOrConnectWithoutTicketsInput = {
    where: ordersWhereUniqueInput
    create: XOR<ordersCreateWithoutTicketsInput, ordersUncheckedCreateWithoutTicketsInput>
  }

  export type seatsCreateWithoutTicketsInput = {
    id?: string
    zone_id: string
    zone_name: string
    zone_price: Decimal | DecimalJsLike | number | string
    event_id: string
    row_label: string
    seat_number: number
    status?: $Enums.seat_status_enum | null
    locked_by?: string | null
    locked_at?: Date | string | null
  }

  export type seatsUncheckedCreateWithoutTicketsInput = {
    id?: string
    zone_id: string
    zone_name: string
    zone_price: Decimal | DecimalJsLike | number | string
    event_id: string
    row_label: string
    seat_number: number
    status?: $Enums.seat_status_enum | null
    locked_by?: string | null
    locked_at?: Date | string | null
  }

  export type seatsCreateOrConnectWithoutTicketsInput = {
    where: seatsWhereUniqueInput
    create: XOR<seatsCreateWithoutTicketsInput, seatsUncheckedCreateWithoutTicketsInput>
  }

  export type ordersUpsertWithoutTicketsInput = {
    update: XOR<ordersUpdateWithoutTicketsInput, ordersUncheckedUpdateWithoutTicketsInput>
    create: XOR<ordersCreateWithoutTicketsInput, ordersUncheckedCreateWithoutTicketsInput>
    where?: ordersWhereInput
  }

  export type ordersUpdateToOneWithWhereWithoutTicketsInput = {
    where?: ordersWhereInput
    data: XOR<ordersUpdateWithoutTicketsInput, ordersUncheckedUpdateWithoutTicketsInput>
  }

  export type ordersUpdateWithoutTicketsInput = {
    id?: StringFieldUpdateOperationsInput | string
    user_id?: StringFieldUpdateOperationsInput | string
    event_id?: StringFieldUpdateOperationsInput | string
    event_title?: StringFieldUpdateOperationsInput | string
    category_name?: NullableStringFieldUpdateOperationsInput | string | null
    user_email?: StringFieldUpdateOperationsInput | string
    total_amount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    status?: NullableEnumorder_status_enumFieldUpdateOperationsInput | $Enums.order_status_enum | null
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updated_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ordersUncheckedUpdateWithoutTicketsInput = {
    id?: StringFieldUpdateOperationsInput | string
    user_id?: StringFieldUpdateOperationsInput | string
    event_id?: StringFieldUpdateOperationsInput | string
    event_title?: StringFieldUpdateOperationsInput | string
    category_name?: NullableStringFieldUpdateOperationsInput | string | null
    user_email?: StringFieldUpdateOperationsInput | string
    total_amount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    status?: NullableEnumorder_status_enumFieldUpdateOperationsInput | $Enums.order_status_enum | null
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updated_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type seatsUpsertWithoutTicketsInput = {
    update: XOR<seatsUpdateWithoutTicketsInput, seatsUncheckedUpdateWithoutTicketsInput>
    create: XOR<seatsCreateWithoutTicketsInput, seatsUncheckedCreateWithoutTicketsInput>
    where?: seatsWhereInput
  }

  export type seatsUpdateToOneWithWhereWithoutTicketsInput = {
    where?: seatsWhereInput
    data: XOR<seatsUpdateWithoutTicketsInput, seatsUncheckedUpdateWithoutTicketsInput>
  }

  export type seatsUpdateWithoutTicketsInput = {
    id?: StringFieldUpdateOperationsInput | string
    zone_id?: StringFieldUpdateOperationsInput | string
    zone_name?: StringFieldUpdateOperationsInput | string
    zone_price?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    event_id?: StringFieldUpdateOperationsInput | string
    row_label?: StringFieldUpdateOperationsInput | string
    seat_number?: IntFieldUpdateOperationsInput | number
    status?: NullableEnumseat_status_enumFieldUpdateOperationsInput | $Enums.seat_status_enum | null
    locked_by?: NullableStringFieldUpdateOperationsInput | string | null
    locked_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type seatsUncheckedUpdateWithoutTicketsInput = {
    id?: StringFieldUpdateOperationsInput | string
    zone_id?: StringFieldUpdateOperationsInput | string
    zone_name?: StringFieldUpdateOperationsInput | string
    zone_price?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    event_id?: StringFieldUpdateOperationsInput | string
    row_label?: StringFieldUpdateOperationsInput | string
    seat_number?: IntFieldUpdateOperationsInput | number
    status?: NullableEnumseat_status_enumFieldUpdateOperationsInput | $Enums.seat_status_enum | null
    locked_by?: NullableStringFieldUpdateOperationsInput | string | null
    locked_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ticketsCreateManyOrdersInput = {
    id?: string
    seat_id: string
    qr_code: string
    issued_at?: Date | string | null
    status?: $Enums.ticket_status_enum | null
  }

  export type ticketsUpdateWithoutOrdersInput = {
    id?: StringFieldUpdateOperationsInput | string
    qr_code?: StringFieldUpdateOperationsInput | string
    issued_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    status?: NullableEnumticket_status_enumFieldUpdateOperationsInput | $Enums.ticket_status_enum | null
    seats?: seatsUpdateOneRequiredWithoutTicketsNestedInput
  }

  export type ticketsUncheckedUpdateWithoutOrdersInput = {
    id?: StringFieldUpdateOperationsInput | string
    seat_id?: StringFieldUpdateOperationsInput | string
    qr_code?: StringFieldUpdateOperationsInput | string
    issued_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    status?: NullableEnumticket_status_enumFieldUpdateOperationsInput | $Enums.ticket_status_enum | null
  }

  export type ticketsUncheckedUpdateManyWithoutOrdersInput = {
    id?: StringFieldUpdateOperationsInput | string
    seat_id?: StringFieldUpdateOperationsInput | string
    qr_code?: StringFieldUpdateOperationsInput | string
    issued_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    status?: NullableEnumticket_status_enumFieldUpdateOperationsInput | $Enums.ticket_status_enum | null
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}