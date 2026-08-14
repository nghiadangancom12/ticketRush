
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
 * Model analytics_order_summary
 * Bảng tổng hợp denormalized cho Admin Dashboard.
 */
export type analytics_order_summary = $Result.DefaultSelection<Prisma.$analytics_order_summaryPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const gender_enum: {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
  OTHER: 'OTHER'
};

export type gender_enum = (typeof gender_enum)[keyof typeof gender_enum]


export const order_status_enum: {
  PENDING: 'PENDING',
  PAID: 'PAID',
  CANCELLED: 'CANCELLED'
};

export type order_status_enum = (typeof order_status_enum)[keyof typeof order_status_enum]

}

export type gender_enum = $Enums.gender_enum

export const gender_enum: typeof $Enums.gender_enum

export type order_status_enum = $Enums.order_status_enum

export const order_status_enum: typeof $Enums.order_status_enum

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient({
 *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
 * })
 * // Fetch zero or more Analytics_order_summaries
 * const analytics_order_summaries = await prisma.analytics_order_summary.findMany()
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
   * // Fetch zero or more Analytics_order_summaries
   * const analytics_order_summaries = await prisma.analytics_order_summary.findMany()
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
   * `prisma.analytics_order_summary`: Exposes CRUD operations for the **analytics_order_summary** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Analytics_order_summaries
    * const analytics_order_summaries = await prisma.analytics_order_summary.findMany()
    * ```
    */
  get analytics_order_summary(): Prisma.analytics_order_summaryDelegate<ExtArgs, ClientOptions>;
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
    analytics_order_summary: 'analytics_order_summary'
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
      modelProps: "analytics_order_summary"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      analytics_order_summary: {
        payload: Prisma.$analytics_order_summaryPayload<ExtArgs>
        fields: Prisma.analytics_order_summaryFieldRefs
        operations: {
          findUnique: {
            args: Prisma.analytics_order_summaryFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$analytics_order_summaryPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.analytics_order_summaryFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$analytics_order_summaryPayload>
          }
          findFirst: {
            args: Prisma.analytics_order_summaryFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$analytics_order_summaryPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.analytics_order_summaryFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$analytics_order_summaryPayload>
          }
          findMany: {
            args: Prisma.analytics_order_summaryFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$analytics_order_summaryPayload>[]
          }
          create: {
            args: Prisma.analytics_order_summaryCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$analytics_order_summaryPayload>
          }
          createMany: {
            args: Prisma.analytics_order_summaryCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.analytics_order_summaryCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$analytics_order_summaryPayload>[]
          }
          delete: {
            args: Prisma.analytics_order_summaryDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$analytics_order_summaryPayload>
          }
          update: {
            args: Prisma.analytics_order_summaryUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$analytics_order_summaryPayload>
          }
          deleteMany: {
            args: Prisma.analytics_order_summaryDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.analytics_order_summaryUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.analytics_order_summaryUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$analytics_order_summaryPayload>[]
          }
          upsert: {
            args: Prisma.analytics_order_summaryUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$analytics_order_summaryPayload>
          }
          aggregate: {
            args: Prisma.Analytics_order_summaryAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAnalytics_order_summary>
          }
          groupBy: {
            args: Prisma.analytics_order_summaryGroupByArgs<ExtArgs>
            result: $Utils.Optional<Analytics_order_summaryGroupByOutputType>[]
          }
          count: {
            args: Prisma.analytics_order_summaryCountArgs<ExtArgs>
            result: $Utils.Optional<Analytics_order_summaryCountAggregateOutputType> | number
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
    analytics_order_summary?: analytics_order_summaryOmit
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
   * Models
   */

  /**
   * Model analytics_order_summary
   */

  export type AggregateAnalytics_order_summary = {
    _count: Analytics_order_summaryCountAggregateOutputType | null
    _avg: Analytics_order_summaryAvgAggregateOutputType | null
    _sum: Analytics_order_summarySumAggregateOutputType | null
    _min: Analytics_order_summaryMinAggregateOutputType | null
    _max: Analytics_order_summaryMaxAggregateOutputType | null
  }

  export type Analytics_order_summaryAvgAggregateOutputType = {
    total_amount: Decimal | null
  }

  export type Analytics_order_summarySumAggregateOutputType = {
    total_amount: Decimal | null
  }

  export type Analytics_order_summaryMinAggregateOutputType = {
    order_id: string | null
    user_id: string | null
    user_email: string | null
    user_gender: $Enums.gender_enum | null
    user_dob: Date | null
    event_id: string | null
    event_title: string | null
    category_name: string | null
    total_amount: Decimal | null
    order_status: $Enums.order_status_enum | null
    created_at: Date | null
  }

  export type Analytics_order_summaryMaxAggregateOutputType = {
    order_id: string | null
    user_id: string | null
    user_email: string | null
    user_gender: $Enums.gender_enum | null
    user_dob: Date | null
    event_id: string | null
    event_title: string | null
    category_name: string | null
    total_amount: Decimal | null
    order_status: $Enums.order_status_enum | null
    created_at: Date | null
  }

  export type Analytics_order_summaryCountAggregateOutputType = {
    order_id: number
    user_id: number
    user_email: number
    user_gender: number
    user_dob: number
    event_id: number
    event_title: number
    category_name: number
    total_amount: number
    order_status: number
    created_at: number
    _all: number
  }


  export type Analytics_order_summaryAvgAggregateInputType = {
    total_amount?: true
  }

  export type Analytics_order_summarySumAggregateInputType = {
    total_amount?: true
  }

  export type Analytics_order_summaryMinAggregateInputType = {
    order_id?: true
    user_id?: true
    user_email?: true
    user_gender?: true
    user_dob?: true
    event_id?: true
    event_title?: true
    category_name?: true
    total_amount?: true
    order_status?: true
    created_at?: true
  }

  export type Analytics_order_summaryMaxAggregateInputType = {
    order_id?: true
    user_id?: true
    user_email?: true
    user_gender?: true
    user_dob?: true
    event_id?: true
    event_title?: true
    category_name?: true
    total_amount?: true
    order_status?: true
    created_at?: true
  }

  export type Analytics_order_summaryCountAggregateInputType = {
    order_id?: true
    user_id?: true
    user_email?: true
    user_gender?: true
    user_dob?: true
    event_id?: true
    event_title?: true
    category_name?: true
    total_amount?: true
    order_status?: true
    created_at?: true
    _all?: true
  }

  export type Analytics_order_summaryAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which analytics_order_summary to aggregate.
     */
    where?: analytics_order_summaryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of analytics_order_summaries to fetch.
     */
    orderBy?: analytics_order_summaryOrderByWithRelationInput | analytics_order_summaryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: analytics_order_summaryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` analytics_order_summaries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` analytics_order_summaries.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned analytics_order_summaries
    **/
    _count?: true | Analytics_order_summaryCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Analytics_order_summaryAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Analytics_order_summarySumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Analytics_order_summaryMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Analytics_order_summaryMaxAggregateInputType
  }

  export type GetAnalytics_order_summaryAggregateType<T extends Analytics_order_summaryAggregateArgs> = {
        [P in keyof T & keyof AggregateAnalytics_order_summary]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAnalytics_order_summary[P]>
      : GetScalarType<T[P], AggregateAnalytics_order_summary[P]>
  }




  export type analytics_order_summaryGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: analytics_order_summaryWhereInput
    orderBy?: analytics_order_summaryOrderByWithAggregationInput | analytics_order_summaryOrderByWithAggregationInput[]
    by: Analytics_order_summaryScalarFieldEnum[] | Analytics_order_summaryScalarFieldEnum
    having?: analytics_order_summaryScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Analytics_order_summaryCountAggregateInputType | true
    _avg?: Analytics_order_summaryAvgAggregateInputType
    _sum?: Analytics_order_summarySumAggregateInputType
    _min?: Analytics_order_summaryMinAggregateInputType
    _max?: Analytics_order_summaryMaxAggregateInputType
  }

  export type Analytics_order_summaryGroupByOutputType = {
    order_id: string
    user_id: string
    user_email: string
    user_gender: $Enums.gender_enum | null
    user_dob: Date | null
    event_id: string
    event_title: string
    category_name: string | null
    total_amount: Decimal
    order_status: $Enums.order_status_enum
    created_at: Date
    _count: Analytics_order_summaryCountAggregateOutputType | null
    _avg: Analytics_order_summaryAvgAggregateOutputType | null
    _sum: Analytics_order_summarySumAggregateOutputType | null
    _min: Analytics_order_summaryMinAggregateOutputType | null
    _max: Analytics_order_summaryMaxAggregateOutputType | null
  }

  type GetAnalytics_order_summaryGroupByPayload<T extends analytics_order_summaryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Analytics_order_summaryGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Analytics_order_summaryGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Analytics_order_summaryGroupByOutputType[P]>
            : GetScalarType<T[P], Analytics_order_summaryGroupByOutputType[P]>
        }
      >
    >


  export type analytics_order_summarySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    order_id?: boolean
    user_id?: boolean
    user_email?: boolean
    user_gender?: boolean
    user_dob?: boolean
    event_id?: boolean
    event_title?: boolean
    category_name?: boolean
    total_amount?: boolean
    order_status?: boolean
    created_at?: boolean
  }, ExtArgs["result"]["analytics_order_summary"]>

  export type analytics_order_summarySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    order_id?: boolean
    user_id?: boolean
    user_email?: boolean
    user_gender?: boolean
    user_dob?: boolean
    event_id?: boolean
    event_title?: boolean
    category_name?: boolean
    total_amount?: boolean
    order_status?: boolean
    created_at?: boolean
  }, ExtArgs["result"]["analytics_order_summary"]>

  export type analytics_order_summarySelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    order_id?: boolean
    user_id?: boolean
    user_email?: boolean
    user_gender?: boolean
    user_dob?: boolean
    event_id?: boolean
    event_title?: boolean
    category_name?: boolean
    total_amount?: boolean
    order_status?: boolean
    created_at?: boolean
  }, ExtArgs["result"]["analytics_order_summary"]>

  export type analytics_order_summarySelectScalar = {
    order_id?: boolean
    user_id?: boolean
    user_email?: boolean
    user_gender?: boolean
    user_dob?: boolean
    event_id?: boolean
    event_title?: boolean
    category_name?: boolean
    total_amount?: boolean
    order_status?: boolean
    created_at?: boolean
  }

  export type analytics_order_summaryOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"order_id" | "user_id" | "user_email" | "user_gender" | "user_dob" | "event_id" | "event_title" | "category_name" | "total_amount" | "order_status" | "created_at", ExtArgs["result"]["analytics_order_summary"]>

  export type $analytics_order_summaryPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "analytics_order_summary"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      order_id: string
      user_id: string
      user_email: string
      user_gender: $Enums.gender_enum | null
      user_dob: Date | null
      event_id: string
      event_title: string
      category_name: string | null
      total_amount: Prisma.Decimal
      order_status: $Enums.order_status_enum
      created_at: Date
    }, ExtArgs["result"]["analytics_order_summary"]>
    composites: {}
  }

  type analytics_order_summaryGetPayload<S extends boolean | null | undefined | analytics_order_summaryDefaultArgs> = $Result.GetResult<Prisma.$analytics_order_summaryPayload, S>

  type analytics_order_summaryCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<analytics_order_summaryFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Analytics_order_summaryCountAggregateInputType | true
    }

  export interface analytics_order_summaryDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['analytics_order_summary'], meta: { name: 'analytics_order_summary' } }
    /**
     * Find zero or one Analytics_order_summary that matches the filter.
     * @param {analytics_order_summaryFindUniqueArgs} args - Arguments to find a Analytics_order_summary
     * @example
     * // Get one Analytics_order_summary
     * const analytics_order_summary = await prisma.analytics_order_summary.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends analytics_order_summaryFindUniqueArgs>(args: SelectSubset<T, analytics_order_summaryFindUniqueArgs<ExtArgs>>): Prisma__analytics_order_summaryClient<$Result.GetResult<Prisma.$analytics_order_summaryPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Analytics_order_summary that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {analytics_order_summaryFindUniqueOrThrowArgs} args - Arguments to find a Analytics_order_summary
     * @example
     * // Get one Analytics_order_summary
     * const analytics_order_summary = await prisma.analytics_order_summary.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends analytics_order_summaryFindUniqueOrThrowArgs>(args: SelectSubset<T, analytics_order_summaryFindUniqueOrThrowArgs<ExtArgs>>): Prisma__analytics_order_summaryClient<$Result.GetResult<Prisma.$analytics_order_summaryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Analytics_order_summary that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {analytics_order_summaryFindFirstArgs} args - Arguments to find a Analytics_order_summary
     * @example
     * // Get one Analytics_order_summary
     * const analytics_order_summary = await prisma.analytics_order_summary.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends analytics_order_summaryFindFirstArgs>(args?: SelectSubset<T, analytics_order_summaryFindFirstArgs<ExtArgs>>): Prisma__analytics_order_summaryClient<$Result.GetResult<Prisma.$analytics_order_summaryPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Analytics_order_summary that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {analytics_order_summaryFindFirstOrThrowArgs} args - Arguments to find a Analytics_order_summary
     * @example
     * // Get one Analytics_order_summary
     * const analytics_order_summary = await prisma.analytics_order_summary.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends analytics_order_summaryFindFirstOrThrowArgs>(args?: SelectSubset<T, analytics_order_summaryFindFirstOrThrowArgs<ExtArgs>>): Prisma__analytics_order_summaryClient<$Result.GetResult<Prisma.$analytics_order_summaryPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Analytics_order_summaries that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {analytics_order_summaryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Analytics_order_summaries
     * const analytics_order_summaries = await prisma.analytics_order_summary.findMany()
     * 
     * // Get first 10 Analytics_order_summaries
     * const analytics_order_summaries = await prisma.analytics_order_summary.findMany({ take: 10 })
     * 
     * // Only select the `order_id`
     * const analytics_order_summaryWithOrder_idOnly = await prisma.analytics_order_summary.findMany({ select: { order_id: true } })
     * 
     */
    findMany<T extends analytics_order_summaryFindManyArgs>(args?: SelectSubset<T, analytics_order_summaryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$analytics_order_summaryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Analytics_order_summary.
     * @param {analytics_order_summaryCreateArgs} args - Arguments to create a Analytics_order_summary.
     * @example
     * // Create one Analytics_order_summary
     * const Analytics_order_summary = await prisma.analytics_order_summary.create({
     *   data: {
     *     // ... data to create a Analytics_order_summary
     *   }
     * })
     * 
     */
    create<T extends analytics_order_summaryCreateArgs>(args: SelectSubset<T, analytics_order_summaryCreateArgs<ExtArgs>>): Prisma__analytics_order_summaryClient<$Result.GetResult<Prisma.$analytics_order_summaryPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Analytics_order_summaries.
     * @param {analytics_order_summaryCreateManyArgs} args - Arguments to create many Analytics_order_summaries.
     * @example
     * // Create many Analytics_order_summaries
     * const analytics_order_summary = await prisma.analytics_order_summary.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends analytics_order_summaryCreateManyArgs>(args?: SelectSubset<T, analytics_order_summaryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Analytics_order_summaries and returns the data saved in the database.
     * @param {analytics_order_summaryCreateManyAndReturnArgs} args - Arguments to create many Analytics_order_summaries.
     * @example
     * // Create many Analytics_order_summaries
     * const analytics_order_summary = await prisma.analytics_order_summary.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Analytics_order_summaries and only return the `order_id`
     * const analytics_order_summaryWithOrder_idOnly = await prisma.analytics_order_summary.createManyAndReturn({
     *   select: { order_id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends analytics_order_summaryCreateManyAndReturnArgs>(args?: SelectSubset<T, analytics_order_summaryCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$analytics_order_summaryPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Analytics_order_summary.
     * @param {analytics_order_summaryDeleteArgs} args - Arguments to delete one Analytics_order_summary.
     * @example
     * // Delete one Analytics_order_summary
     * const Analytics_order_summary = await prisma.analytics_order_summary.delete({
     *   where: {
     *     // ... filter to delete one Analytics_order_summary
     *   }
     * })
     * 
     */
    delete<T extends analytics_order_summaryDeleteArgs>(args: SelectSubset<T, analytics_order_summaryDeleteArgs<ExtArgs>>): Prisma__analytics_order_summaryClient<$Result.GetResult<Prisma.$analytics_order_summaryPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Analytics_order_summary.
     * @param {analytics_order_summaryUpdateArgs} args - Arguments to update one Analytics_order_summary.
     * @example
     * // Update one Analytics_order_summary
     * const analytics_order_summary = await prisma.analytics_order_summary.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends analytics_order_summaryUpdateArgs>(args: SelectSubset<T, analytics_order_summaryUpdateArgs<ExtArgs>>): Prisma__analytics_order_summaryClient<$Result.GetResult<Prisma.$analytics_order_summaryPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Analytics_order_summaries.
     * @param {analytics_order_summaryDeleteManyArgs} args - Arguments to filter Analytics_order_summaries to delete.
     * @example
     * // Delete a few Analytics_order_summaries
     * const { count } = await prisma.analytics_order_summary.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends analytics_order_summaryDeleteManyArgs>(args?: SelectSubset<T, analytics_order_summaryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Analytics_order_summaries.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {analytics_order_summaryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Analytics_order_summaries
     * const analytics_order_summary = await prisma.analytics_order_summary.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends analytics_order_summaryUpdateManyArgs>(args: SelectSubset<T, analytics_order_summaryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Analytics_order_summaries and returns the data updated in the database.
     * @param {analytics_order_summaryUpdateManyAndReturnArgs} args - Arguments to update many Analytics_order_summaries.
     * @example
     * // Update many Analytics_order_summaries
     * const analytics_order_summary = await prisma.analytics_order_summary.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Analytics_order_summaries and only return the `order_id`
     * const analytics_order_summaryWithOrder_idOnly = await prisma.analytics_order_summary.updateManyAndReturn({
     *   select: { order_id: true },
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
    updateManyAndReturn<T extends analytics_order_summaryUpdateManyAndReturnArgs>(args: SelectSubset<T, analytics_order_summaryUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$analytics_order_summaryPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Analytics_order_summary.
     * @param {analytics_order_summaryUpsertArgs} args - Arguments to update or create a Analytics_order_summary.
     * @example
     * // Update or create a Analytics_order_summary
     * const analytics_order_summary = await prisma.analytics_order_summary.upsert({
     *   create: {
     *     // ... data to create a Analytics_order_summary
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Analytics_order_summary we want to update
     *   }
     * })
     */
    upsert<T extends analytics_order_summaryUpsertArgs>(args: SelectSubset<T, analytics_order_summaryUpsertArgs<ExtArgs>>): Prisma__analytics_order_summaryClient<$Result.GetResult<Prisma.$analytics_order_summaryPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Analytics_order_summaries.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {analytics_order_summaryCountArgs} args - Arguments to filter Analytics_order_summaries to count.
     * @example
     * // Count the number of Analytics_order_summaries
     * const count = await prisma.analytics_order_summary.count({
     *   where: {
     *     // ... the filter for the Analytics_order_summaries we want to count
     *   }
     * })
    **/
    count<T extends analytics_order_summaryCountArgs>(
      args?: Subset<T, analytics_order_summaryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Analytics_order_summaryCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Analytics_order_summary.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Analytics_order_summaryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends Analytics_order_summaryAggregateArgs>(args: Subset<T, Analytics_order_summaryAggregateArgs>): Prisma.PrismaPromise<GetAnalytics_order_summaryAggregateType<T>>

    /**
     * Group by Analytics_order_summary.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {analytics_order_summaryGroupByArgs} args - Group by arguments.
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
      T extends analytics_order_summaryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: analytics_order_summaryGroupByArgs['orderBy'] }
        : { orderBy?: analytics_order_summaryGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, analytics_order_summaryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAnalytics_order_summaryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the analytics_order_summary model
   */
  readonly fields: analytics_order_summaryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for analytics_order_summary.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__analytics_order_summaryClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
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
   * Fields of the analytics_order_summary model
   */
  interface analytics_order_summaryFieldRefs {
    readonly order_id: FieldRef<"analytics_order_summary", 'String'>
    readonly user_id: FieldRef<"analytics_order_summary", 'String'>
    readonly user_email: FieldRef<"analytics_order_summary", 'String'>
    readonly user_gender: FieldRef<"analytics_order_summary", 'gender_enum'>
    readonly user_dob: FieldRef<"analytics_order_summary", 'DateTime'>
    readonly event_id: FieldRef<"analytics_order_summary", 'String'>
    readonly event_title: FieldRef<"analytics_order_summary", 'String'>
    readonly category_name: FieldRef<"analytics_order_summary", 'String'>
    readonly total_amount: FieldRef<"analytics_order_summary", 'Decimal'>
    readonly order_status: FieldRef<"analytics_order_summary", 'order_status_enum'>
    readonly created_at: FieldRef<"analytics_order_summary", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * analytics_order_summary findUnique
   */
  export type analytics_order_summaryFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the analytics_order_summary
     */
    select?: analytics_order_summarySelect<ExtArgs> | null
    /**
     * Omit specific fields from the analytics_order_summary
     */
    omit?: analytics_order_summaryOmit<ExtArgs> | null
    /**
     * Filter, which analytics_order_summary to fetch.
     */
    where: analytics_order_summaryWhereUniqueInput
  }

  /**
   * analytics_order_summary findUniqueOrThrow
   */
  export type analytics_order_summaryFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the analytics_order_summary
     */
    select?: analytics_order_summarySelect<ExtArgs> | null
    /**
     * Omit specific fields from the analytics_order_summary
     */
    omit?: analytics_order_summaryOmit<ExtArgs> | null
    /**
     * Filter, which analytics_order_summary to fetch.
     */
    where: analytics_order_summaryWhereUniqueInput
  }

  /**
   * analytics_order_summary findFirst
   */
  export type analytics_order_summaryFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the analytics_order_summary
     */
    select?: analytics_order_summarySelect<ExtArgs> | null
    /**
     * Omit specific fields from the analytics_order_summary
     */
    omit?: analytics_order_summaryOmit<ExtArgs> | null
    /**
     * Filter, which analytics_order_summary to fetch.
     */
    where?: analytics_order_summaryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of analytics_order_summaries to fetch.
     */
    orderBy?: analytics_order_summaryOrderByWithRelationInput | analytics_order_summaryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for analytics_order_summaries.
     */
    cursor?: analytics_order_summaryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` analytics_order_summaries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` analytics_order_summaries.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of analytics_order_summaries.
     */
    distinct?: Analytics_order_summaryScalarFieldEnum | Analytics_order_summaryScalarFieldEnum[]
  }

  /**
   * analytics_order_summary findFirstOrThrow
   */
  export type analytics_order_summaryFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the analytics_order_summary
     */
    select?: analytics_order_summarySelect<ExtArgs> | null
    /**
     * Omit specific fields from the analytics_order_summary
     */
    omit?: analytics_order_summaryOmit<ExtArgs> | null
    /**
     * Filter, which analytics_order_summary to fetch.
     */
    where?: analytics_order_summaryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of analytics_order_summaries to fetch.
     */
    orderBy?: analytics_order_summaryOrderByWithRelationInput | analytics_order_summaryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for analytics_order_summaries.
     */
    cursor?: analytics_order_summaryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` analytics_order_summaries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` analytics_order_summaries.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of analytics_order_summaries.
     */
    distinct?: Analytics_order_summaryScalarFieldEnum | Analytics_order_summaryScalarFieldEnum[]
  }

  /**
   * analytics_order_summary findMany
   */
  export type analytics_order_summaryFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the analytics_order_summary
     */
    select?: analytics_order_summarySelect<ExtArgs> | null
    /**
     * Omit specific fields from the analytics_order_summary
     */
    omit?: analytics_order_summaryOmit<ExtArgs> | null
    /**
     * Filter, which analytics_order_summaries to fetch.
     */
    where?: analytics_order_summaryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of analytics_order_summaries to fetch.
     */
    orderBy?: analytics_order_summaryOrderByWithRelationInput | analytics_order_summaryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing analytics_order_summaries.
     */
    cursor?: analytics_order_summaryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` analytics_order_summaries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` analytics_order_summaries.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of analytics_order_summaries.
     */
    distinct?: Analytics_order_summaryScalarFieldEnum | Analytics_order_summaryScalarFieldEnum[]
  }

  /**
   * analytics_order_summary create
   */
  export type analytics_order_summaryCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the analytics_order_summary
     */
    select?: analytics_order_summarySelect<ExtArgs> | null
    /**
     * Omit specific fields from the analytics_order_summary
     */
    omit?: analytics_order_summaryOmit<ExtArgs> | null
    /**
     * The data needed to create a analytics_order_summary.
     */
    data: XOR<analytics_order_summaryCreateInput, analytics_order_summaryUncheckedCreateInput>
  }

  /**
   * analytics_order_summary createMany
   */
  export type analytics_order_summaryCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many analytics_order_summaries.
     */
    data: analytics_order_summaryCreateManyInput | analytics_order_summaryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * analytics_order_summary createManyAndReturn
   */
  export type analytics_order_summaryCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the analytics_order_summary
     */
    select?: analytics_order_summarySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the analytics_order_summary
     */
    omit?: analytics_order_summaryOmit<ExtArgs> | null
    /**
     * The data used to create many analytics_order_summaries.
     */
    data: analytics_order_summaryCreateManyInput | analytics_order_summaryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * analytics_order_summary update
   */
  export type analytics_order_summaryUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the analytics_order_summary
     */
    select?: analytics_order_summarySelect<ExtArgs> | null
    /**
     * Omit specific fields from the analytics_order_summary
     */
    omit?: analytics_order_summaryOmit<ExtArgs> | null
    /**
     * The data needed to update a analytics_order_summary.
     */
    data: XOR<analytics_order_summaryUpdateInput, analytics_order_summaryUncheckedUpdateInput>
    /**
     * Choose, which analytics_order_summary to update.
     */
    where: analytics_order_summaryWhereUniqueInput
  }

  /**
   * analytics_order_summary updateMany
   */
  export type analytics_order_summaryUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update analytics_order_summaries.
     */
    data: XOR<analytics_order_summaryUpdateManyMutationInput, analytics_order_summaryUncheckedUpdateManyInput>
    /**
     * Filter which analytics_order_summaries to update
     */
    where?: analytics_order_summaryWhereInput
    /**
     * Limit how many analytics_order_summaries to update.
     */
    limit?: number
  }

  /**
   * analytics_order_summary updateManyAndReturn
   */
  export type analytics_order_summaryUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the analytics_order_summary
     */
    select?: analytics_order_summarySelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the analytics_order_summary
     */
    omit?: analytics_order_summaryOmit<ExtArgs> | null
    /**
     * The data used to update analytics_order_summaries.
     */
    data: XOR<analytics_order_summaryUpdateManyMutationInput, analytics_order_summaryUncheckedUpdateManyInput>
    /**
     * Filter which analytics_order_summaries to update
     */
    where?: analytics_order_summaryWhereInput
    /**
     * Limit how many analytics_order_summaries to update.
     */
    limit?: number
  }

  /**
   * analytics_order_summary upsert
   */
  export type analytics_order_summaryUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the analytics_order_summary
     */
    select?: analytics_order_summarySelect<ExtArgs> | null
    /**
     * Omit specific fields from the analytics_order_summary
     */
    omit?: analytics_order_summaryOmit<ExtArgs> | null
    /**
     * The filter to search for the analytics_order_summary to update in case it exists.
     */
    where: analytics_order_summaryWhereUniqueInput
    /**
     * In case the analytics_order_summary found by the `where` argument doesn't exist, create a new analytics_order_summary with this data.
     */
    create: XOR<analytics_order_summaryCreateInput, analytics_order_summaryUncheckedCreateInput>
    /**
     * In case the analytics_order_summary was found with the provided `where` argument, update it with this data.
     */
    update: XOR<analytics_order_summaryUpdateInput, analytics_order_summaryUncheckedUpdateInput>
  }

  /**
   * analytics_order_summary delete
   */
  export type analytics_order_summaryDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the analytics_order_summary
     */
    select?: analytics_order_summarySelect<ExtArgs> | null
    /**
     * Omit specific fields from the analytics_order_summary
     */
    omit?: analytics_order_summaryOmit<ExtArgs> | null
    /**
     * Filter which analytics_order_summary to delete.
     */
    where: analytics_order_summaryWhereUniqueInput
  }

  /**
   * analytics_order_summary deleteMany
   */
  export type analytics_order_summaryDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which analytics_order_summaries to delete
     */
    where?: analytics_order_summaryWhereInput
    /**
     * Limit how many analytics_order_summaries to delete.
     */
    limit?: number
  }

  /**
   * analytics_order_summary without action
   */
  export type analytics_order_summaryDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the analytics_order_summary
     */
    select?: analytics_order_summarySelect<ExtArgs> | null
    /**
     * Omit specific fields from the analytics_order_summary
     */
    omit?: analytics_order_summaryOmit<ExtArgs> | null
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


  export const Analytics_order_summaryScalarFieldEnum: {
    order_id: 'order_id',
    user_id: 'user_id',
    user_email: 'user_email',
    user_gender: 'user_gender',
    user_dob: 'user_dob',
    event_id: 'event_id',
    event_title: 'event_title',
    category_name: 'category_name',
    total_amount: 'total_amount',
    order_status: 'order_status',
    created_at: 'created_at'
  };

  export type Analytics_order_summaryScalarFieldEnum = (typeof Analytics_order_summaryScalarFieldEnum)[keyof typeof Analytics_order_summaryScalarFieldEnum]


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
   * Reference to a field of type 'gender_enum'
   */
  export type Enumgender_enumFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'gender_enum'>
    


  /**
   * Reference to a field of type 'gender_enum[]'
   */
  export type ListEnumgender_enumFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'gender_enum[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Decimal'
   */
  export type DecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal'>
    


  /**
   * Reference to a field of type 'Decimal[]'
   */
  export type ListDecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal[]'>
    


  /**
   * Reference to a field of type 'order_status_enum'
   */
  export type Enumorder_status_enumFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'order_status_enum'>
    


  /**
   * Reference to a field of type 'order_status_enum[]'
   */
  export type ListEnumorder_status_enumFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'order_status_enum[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    
  /**
   * Deep Input Types
   */


  export type analytics_order_summaryWhereInput = {
    AND?: analytics_order_summaryWhereInput | analytics_order_summaryWhereInput[]
    OR?: analytics_order_summaryWhereInput[]
    NOT?: analytics_order_summaryWhereInput | analytics_order_summaryWhereInput[]
    order_id?: UuidFilter<"analytics_order_summary"> | string
    user_id?: UuidFilter<"analytics_order_summary"> | string
    user_email?: StringFilter<"analytics_order_summary"> | string
    user_gender?: Enumgender_enumNullableFilter<"analytics_order_summary"> | $Enums.gender_enum | null
    user_dob?: DateTimeNullableFilter<"analytics_order_summary"> | Date | string | null
    event_id?: UuidFilter<"analytics_order_summary"> | string
    event_title?: StringFilter<"analytics_order_summary"> | string
    category_name?: StringNullableFilter<"analytics_order_summary"> | string | null
    total_amount?: DecimalFilter<"analytics_order_summary"> | Decimal | DecimalJsLike | number | string
    order_status?: Enumorder_status_enumFilter<"analytics_order_summary"> | $Enums.order_status_enum
    created_at?: DateTimeFilter<"analytics_order_summary"> | Date | string
  }

  export type analytics_order_summaryOrderByWithRelationInput = {
    order_id?: SortOrder
    user_id?: SortOrder
    user_email?: SortOrder
    user_gender?: SortOrderInput | SortOrder
    user_dob?: SortOrderInput | SortOrder
    event_id?: SortOrder
    event_title?: SortOrder
    category_name?: SortOrderInput | SortOrder
    total_amount?: SortOrder
    order_status?: SortOrder
    created_at?: SortOrder
  }

  export type analytics_order_summaryWhereUniqueInput = Prisma.AtLeast<{
    order_id?: string
    AND?: analytics_order_summaryWhereInput | analytics_order_summaryWhereInput[]
    OR?: analytics_order_summaryWhereInput[]
    NOT?: analytics_order_summaryWhereInput | analytics_order_summaryWhereInput[]
    user_id?: UuidFilter<"analytics_order_summary"> | string
    user_email?: StringFilter<"analytics_order_summary"> | string
    user_gender?: Enumgender_enumNullableFilter<"analytics_order_summary"> | $Enums.gender_enum | null
    user_dob?: DateTimeNullableFilter<"analytics_order_summary"> | Date | string | null
    event_id?: UuidFilter<"analytics_order_summary"> | string
    event_title?: StringFilter<"analytics_order_summary"> | string
    category_name?: StringNullableFilter<"analytics_order_summary"> | string | null
    total_amount?: DecimalFilter<"analytics_order_summary"> | Decimal | DecimalJsLike | number | string
    order_status?: Enumorder_status_enumFilter<"analytics_order_summary"> | $Enums.order_status_enum
    created_at?: DateTimeFilter<"analytics_order_summary"> | Date | string
  }, "order_id">

  export type analytics_order_summaryOrderByWithAggregationInput = {
    order_id?: SortOrder
    user_id?: SortOrder
    user_email?: SortOrder
    user_gender?: SortOrderInput | SortOrder
    user_dob?: SortOrderInput | SortOrder
    event_id?: SortOrder
    event_title?: SortOrder
    category_name?: SortOrderInput | SortOrder
    total_amount?: SortOrder
    order_status?: SortOrder
    created_at?: SortOrder
    _count?: analytics_order_summaryCountOrderByAggregateInput
    _avg?: analytics_order_summaryAvgOrderByAggregateInput
    _max?: analytics_order_summaryMaxOrderByAggregateInput
    _min?: analytics_order_summaryMinOrderByAggregateInput
    _sum?: analytics_order_summarySumOrderByAggregateInput
  }

  export type analytics_order_summaryScalarWhereWithAggregatesInput = {
    AND?: analytics_order_summaryScalarWhereWithAggregatesInput | analytics_order_summaryScalarWhereWithAggregatesInput[]
    OR?: analytics_order_summaryScalarWhereWithAggregatesInput[]
    NOT?: analytics_order_summaryScalarWhereWithAggregatesInput | analytics_order_summaryScalarWhereWithAggregatesInput[]
    order_id?: UuidWithAggregatesFilter<"analytics_order_summary"> | string
    user_id?: UuidWithAggregatesFilter<"analytics_order_summary"> | string
    user_email?: StringWithAggregatesFilter<"analytics_order_summary"> | string
    user_gender?: Enumgender_enumNullableWithAggregatesFilter<"analytics_order_summary"> | $Enums.gender_enum | null
    user_dob?: DateTimeNullableWithAggregatesFilter<"analytics_order_summary"> | Date | string | null
    event_id?: UuidWithAggregatesFilter<"analytics_order_summary"> | string
    event_title?: StringWithAggregatesFilter<"analytics_order_summary"> | string
    category_name?: StringNullableWithAggregatesFilter<"analytics_order_summary"> | string | null
    total_amount?: DecimalWithAggregatesFilter<"analytics_order_summary"> | Decimal | DecimalJsLike | number | string
    order_status?: Enumorder_status_enumWithAggregatesFilter<"analytics_order_summary"> | $Enums.order_status_enum
    created_at?: DateTimeWithAggregatesFilter<"analytics_order_summary"> | Date | string
  }

  export type analytics_order_summaryCreateInput = {
    order_id: string
    user_id: string
    user_email: string
    user_gender?: $Enums.gender_enum | null
    user_dob?: Date | string | null
    event_id: string
    event_title: string
    category_name?: string | null
    total_amount: Decimal | DecimalJsLike | number | string
    order_status: $Enums.order_status_enum
    created_at: Date | string
  }

  export type analytics_order_summaryUncheckedCreateInput = {
    order_id: string
    user_id: string
    user_email: string
    user_gender?: $Enums.gender_enum | null
    user_dob?: Date | string | null
    event_id: string
    event_title: string
    category_name?: string | null
    total_amount: Decimal | DecimalJsLike | number | string
    order_status: $Enums.order_status_enum
    created_at: Date | string
  }

  export type analytics_order_summaryUpdateInput = {
    order_id?: StringFieldUpdateOperationsInput | string
    user_id?: StringFieldUpdateOperationsInput | string
    user_email?: StringFieldUpdateOperationsInput | string
    user_gender?: NullableEnumgender_enumFieldUpdateOperationsInput | $Enums.gender_enum | null
    user_dob?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    event_id?: StringFieldUpdateOperationsInput | string
    event_title?: StringFieldUpdateOperationsInput | string
    category_name?: NullableStringFieldUpdateOperationsInput | string | null
    total_amount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    order_status?: Enumorder_status_enumFieldUpdateOperationsInput | $Enums.order_status_enum
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type analytics_order_summaryUncheckedUpdateInput = {
    order_id?: StringFieldUpdateOperationsInput | string
    user_id?: StringFieldUpdateOperationsInput | string
    user_email?: StringFieldUpdateOperationsInput | string
    user_gender?: NullableEnumgender_enumFieldUpdateOperationsInput | $Enums.gender_enum | null
    user_dob?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    event_id?: StringFieldUpdateOperationsInput | string
    event_title?: StringFieldUpdateOperationsInput | string
    category_name?: NullableStringFieldUpdateOperationsInput | string | null
    total_amount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    order_status?: Enumorder_status_enumFieldUpdateOperationsInput | $Enums.order_status_enum
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type analytics_order_summaryCreateManyInput = {
    order_id: string
    user_id: string
    user_email: string
    user_gender?: $Enums.gender_enum | null
    user_dob?: Date | string | null
    event_id: string
    event_title: string
    category_name?: string | null
    total_amount: Decimal | DecimalJsLike | number | string
    order_status: $Enums.order_status_enum
    created_at: Date | string
  }

  export type analytics_order_summaryUpdateManyMutationInput = {
    order_id?: StringFieldUpdateOperationsInput | string
    user_id?: StringFieldUpdateOperationsInput | string
    user_email?: StringFieldUpdateOperationsInput | string
    user_gender?: NullableEnumgender_enumFieldUpdateOperationsInput | $Enums.gender_enum | null
    user_dob?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    event_id?: StringFieldUpdateOperationsInput | string
    event_title?: StringFieldUpdateOperationsInput | string
    category_name?: NullableStringFieldUpdateOperationsInput | string | null
    total_amount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    order_status?: Enumorder_status_enumFieldUpdateOperationsInput | $Enums.order_status_enum
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type analytics_order_summaryUncheckedUpdateManyInput = {
    order_id?: StringFieldUpdateOperationsInput | string
    user_id?: StringFieldUpdateOperationsInput | string
    user_email?: StringFieldUpdateOperationsInput | string
    user_gender?: NullableEnumgender_enumFieldUpdateOperationsInput | $Enums.gender_enum | null
    user_dob?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    event_id?: StringFieldUpdateOperationsInput | string
    event_title?: StringFieldUpdateOperationsInput | string
    category_name?: NullableStringFieldUpdateOperationsInput | string | null
    total_amount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    order_status?: Enumorder_status_enumFieldUpdateOperationsInput | $Enums.order_status_enum
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
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

  export type Enumgender_enumNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.gender_enum | Enumgender_enumFieldRefInput<$PrismaModel> | null
    in?: $Enums.gender_enum[] | ListEnumgender_enumFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.gender_enum[] | ListEnumgender_enumFieldRefInput<$PrismaModel> | null
    not?: NestedEnumgender_enumNullableFilter<$PrismaModel> | $Enums.gender_enum | null
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

  export type Enumorder_status_enumFilter<$PrismaModel = never> = {
    equals?: $Enums.order_status_enum | Enumorder_status_enumFieldRefInput<$PrismaModel>
    in?: $Enums.order_status_enum[] | ListEnumorder_status_enumFieldRefInput<$PrismaModel>
    notIn?: $Enums.order_status_enum[] | ListEnumorder_status_enumFieldRefInput<$PrismaModel>
    not?: NestedEnumorder_status_enumFilter<$PrismaModel> | $Enums.order_status_enum
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type analytics_order_summaryCountOrderByAggregateInput = {
    order_id?: SortOrder
    user_id?: SortOrder
    user_email?: SortOrder
    user_gender?: SortOrder
    user_dob?: SortOrder
    event_id?: SortOrder
    event_title?: SortOrder
    category_name?: SortOrder
    total_amount?: SortOrder
    order_status?: SortOrder
    created_at?: SortOrder
  }

  export type analytics_order_summaryAvgOrderByAggregateInput = {
    total_amount?: SortOrder
  }

  export type analytics_order_summaryMaxOrderByAggregateInput = {
    order_id?: SortOrder
    user_id?: SortOrder
    user_email?: SortOrder
    user_gender?: SortOrder
    user_dob?: SortOrder
    event_id?: SortOrder
    event_title?: SortOrder
    category_name?: SortOrder
    total_amount?: SortOrder
    order_status?: SortOrder
    created_at?: SortOrder
  }

  export type analytics_order_summaryMinOrderByAggregateInput = {
    order_id?: SortOrder
    user_id?: SortOrder
    user_email?: SortOrder
    user_gender?: SortOrder
    user_dob?: SortOrder
    event_id?: SortOrder
    event_title?: SortOrder
    category_name?: SortOrder
    total_amount?: SortOrder
    order_status?: SortOrder
    created_at?: SortOrder
  }

  export type analytics_order_summarySumOrderByAggregateInput = {
    total_amount?: SortOrder
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

  export type Enumgender_enumNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.gender_enum | Enumgender_enumFieldRefInput<$PrismaModel> | null
    in?: $Enums.gender_enum[] | ListEnumgender_enumFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.gender_enum[] | ListEnumgender_enumFieldRefInput<$PrismaModel> | null
    not?: NestedEnumgender_enumNullableWithAggregatesFilter<$PrismaModel> | $Enums.gender_enum | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumgender_enumNullableFilter<$PrismaModel>
    _max?: NestedEnumgender_enumNullableFilter<$PrismaModel>
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

  export type Enumorder_status_enumWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.order_status_enum | Enumorder_status_enumFieldRefInput<$PrismaModel>
    in?: $Enums.order_status_enum[] | ListEnumorder_status_enumFieldRefInput<$PrismaModel>
    notIn?: $Enums.order_status_enum[] | ListEnumorder_status_enumFieldRefInput<$PrismaModel>
    not?: NestedEnumorder_status_enumWithAggregatesFilter<$PrismaModel> | $Enums.order_status_enum
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumorder_status_enumFilter<$PrismaModel>
    _max?: NestedEnumorder_status_enumFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableEnumgender_enumFieldUpdateOperationsInput = {
    set?: $Enums.gender_enum | null
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string
    increment?: Decimal | DecimalJsLike | number | string
    decrement?: Decimal | DecimalJsLike | number | string
    multiply?: Decimal | DecimalJsLike | number | string
    divide?: Decimal | DecimalJsLike | number | string
  }

  export type Enumorder_status_enumFieldUpdateOperationsInput = {
    set?: $Enums.order_status_enum
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
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

  export type NestedEnumgender_enumNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.gender_enum | Enumgender_enumFieldRefInput<$PrismaModel> | null
    in?: $Enums.gender_enum[] | ListEnumgender_enumFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.gender_enum[] | ListEnumgender_enumFieldRefInput<$PrismaModel> | null
    not?: NestedEnumgender_enumNullableFilter<$PrismaModel> | $Enums.gender_enum | null
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

  export type NestedEnumorder_status_enumFilter<$PrismaModel = never> = {
    equals?: $Enums.order_status_enum | Enumorder_status_enumFieldRefInput<$PrismaModel>
    in?: $Enums.order_status_enum[] | ListEnumorder_status_enumFieldRefInput<$PrismaModel>
    notIn?: $Enums.order_status_enum[] | ListEnumorder_status_enumFieldRefInput<$PrismaModel>
    not?: NestedEnumorder_status_enumFilter<$PrismaModel> | $Enums.order_status_enum
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
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

  export type NestedEnumgender_enumNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.gender_enum | Enumgender_enumFieldRefInput<$PrismaModel> | null
    in?: $Enums.gender_enum[] | ListEnumgender_enumFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.gender_enum[] | ListEnumgender_enumFieldRefInput<$PrismaModel> | null
    not?: NestedEnumgender_enumNullableWithAggregatesFilter<$PrismaModel> | $Enums.gender_enum | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumgender_enumNullableFilter<$PrismaModel>
    _max?: NestedEnumgender_enumNullableFilter<$PrismaModel>
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

  export type NestedEnumorder_status_enumWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.order_status_enum | Enumorder_status_enumFieldRefInput<$PrismaModel>
    in?: $Enums.order_status_enum[] | ListEnumorder_status_enumFieldRefInput<$PrismaModel>
    notIn?: $Enums.order_status_enum[] | ListEnumorder_status_enumFieldRefInput<$PrismaModel>
    not?: NestedEnumorder_status_enumWithAggregatesFilter<$PrismaModel> | $Enums.order_status_enum
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumorder_status_enumFilter<$PrismaModel>
    _max?: NestedEnumorder_status_enumFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
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