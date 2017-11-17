declare module 'epilogue' {
  import {
    Model,
    Sequelize,
    AssociationOptions,
    DataTypeAbstract,
    DataTypeString,
    DataTypeChar,
    DataTypeText,
    DataTypeNumber,
    DataTypeInteger,
    DataTypeBigInt,
    DataTypeFloat,
    DataTypeTime,
    DataTypeDate,
    DataTypeDateOnly,
    DataTypeBoolean,
    DataTypeNow,
    DataTypeBlob,
    DataTypeDecimal,
    DataTypeUUID,
    DataTypeUUIDv1,
    DataTypeUUIDv4,
    DataTypeHStore,
    DataTypeJSONType,
    DataTypeJSONB,
    DataTypeVirtual,
    DataTypeArray,
    DataTypeEnum,
    DataTypeRange,
    DataTypeReal,
    DataTypeDouble,
    DataTypeGeometry
  } from 'sequelize';
  import {Express, Request, Response} from 'express';

  export class Endpoint {
    constructor(endpoint: string);
    string: string;
    attributes: Array<string>;
  }

  export class Resource {
    constructor(options: ResourceOptions);
    app: Express;
    sequelize: Sequelize;
    model: Model;
    include: Array<{ model: Model } | Model | string>;
    associationOptions: ResourceAssociationOptions;
    readOnlyAttributes: Array<string>;
    excludeAttributes: Array<string>;
    attributes: Array<string>;
    actions: Array<string>;
    endpoints: {
      singular: string;
      plural: string;
    };
    updateMethod: string;
    pagination: boolean;
    search: ResourceSearchOption;
    sort: ResourceSortOption;
    reloadInstances: boolean;
    controllers: Controllers;
  }

  export interface Controllers {
    base: BaseController;
    create: CreateController;
    read: ReadController;
    update: UpdateController;
    delete: DeleteController;
    list: ListController;
  }

  export interface Errors {
    NotFoundError: EpilogueError,
    BadRequestError: EpilogueError,
    EpilogueError: EpilogueError,
    ForbiddenError: EpilogueError,
    RequestCompleted: EpilogueError
  }



  export class HasManyResource {
    constructor(Resource, resource: Resource, HasMany);
  }

  export interface ResourceAssociationOptions extends AssociationOptions {
    removeForeignKeys: boolean;
  }

  export interface ResourceSearchOption {
    param: string;
    operator: string;
    attributes: Array<string>;
  }

  export interface ResourceSortOption {
    param: string;
    default: string;
  }

  export interface InitializeOptions {
    app: Express;
    sequelize: Sequelize;
    base?: string;
    updateMethod?: string;
  }

  export interface BaseContollerOptions {
    endpoint: string;
    model: Model;
    app: Express;
    resource: Resource;
    include: Array<Model | string>;
  }

  export interface Context {
    instance: Resource;
    criteria: any;
    attributes: any;
    options: any;
    continue: () => void;
    skip: () => void;
    stop: () => void;
    error: (status: number | EpilogueError, message?: string, errorList?: Array<string>, cause?: Error) => void;
  }

  export class BaseController {
    constructor(options: BaseContollerOptions);
    endpoint: Endpoint;
    model: Model;
  }

  export class CreateController extends BaseController {
    write: (req: Request, res: Response, context: Context) => Promise<() => void>;
  }

  export class ReadController extends BaseController {
    fetch: (req: Request, res: Response, context: Context) => Promise<() => void>;
  }

  export class UpdateController extends BaseController {
    fetch: (req: Request, res: Response, context: Context) => Promise<() => void>;
    write: (req: Request, res: Response, context: Context) => Promise<() => void>;
  }

  export class DeleteController extends BaseController {
    fetch: (req: Request, res: Response, context: Context) => Promise<() => void>;
    write: (req: Request, res: Response, context: Context) => Promise<() => void>;
  }

  export class ListController extends BaseController {
    fetch: (req: Request, res: Response, context: Context) => Promise<() => void>;
    _safeishParse: (value: any, type: DataTypeAbstract | DataTypeString | DataTypeChar | DataTypeText | DataTypeNumber |
                      DataTypeInteger | DataTypeBigInt | DataTypeFloat | DataTypeTime | DataTypeDate | DataTypeDateOnly |
                      DataTypeBoolean | DataTypeNow | DataTypeBlob | DataTypeDecimal | DataTypeUUID | DataTypeUUIDv1 |
                      DataTypeUUIDv4 | DataTypeHStore | DataTypeJSONType | DataTypeJSONB | DataTypeVirtual |
                      DataTypeArray | DataTypeEnum | DataTypeRange | DataTypeReal | DataTypeDouble | DataTypeGeometry,
                    sequelize: Sequelize) => any;
  }

  export interface ResourceOptions {
    model: Model;
    endpoints: Array<string>;
    actions: Array<string>;
    include: Array<Model | string>;
    pagination: boolean;
    search: ResourceSearchOption;
    sort: ResourceSortOption;
    reloadInstances: boolean;
    associations: AssociationOptions;
    excludeAttributes: Array<string>;
    readOnlyAttributes: Array<string>;
    updateMethod: string;
  }

  export class EpilogueError extends Error {
    name: string;
    message: string;
    errors: Array<string>;
    status: EpilogueError | number;
    cause: Error;
  }

  export interface Epilogue {
    initialize: (options: InitializeOptions) => void;
    resource: (options: ResourceOptions) => Resource;
    Resource: Resource;
    Endpoint: Endpoint;
    Controllers: Controllers;
    Errors: Errors;
  }

  function initialize(options: InitializeOptions): void;
  function resource(options: ResourceOptions): Resource;
}
