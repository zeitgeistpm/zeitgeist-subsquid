import {
  BaseModel,
  BooleanField,
  DateField,
  FloatField,
  IntField,
  NumericField,
  JSONField,
  BytesField,
  EnumField,
  StringField,
} from '@subsquid/warthog';

import { Float, Int, GraphQLISODateTime } from 'type-graphql';
import BN from 'bn.js';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { GraphQLJSONObject } = require('graphql-type-json');

import { ObjectType, Field, createUnionType } from 'type-graphql';
import { getRepository, In } from 'typeorm';

@ObjectType()
export class Authorized {
  public isTypeOf: string = 'Authorized';

  @Field(() => String, {
    nullable: true,
  })
  value?: string;
}
@ObjectType()
export class Block {
  public isTypeOf: string = 'Block';

  @Field(() => String!, {})
  value!: string;
}
@ObjectType()
export class Categorical {
  public isTypeOf: string = 'Categorical';

  @Field(() => String!, {})
  value!: string;
}
@ObjectType()
export class Court {
  public isTypeOf: string = 'Court';

  @Field(() => Boolean, {
    nullable: true,
  })
  value?: boolean;
}
@ObjectType()
export class Scalar {
  public isTypeOf: string = 'Scalar';

  @Field(() => String!, {})
  value!: string;
}
@ObjectType()
export class SimpleDisputes {
  public isTypeOf: string = 'SimpleDisputes';

  @Field(() => Boolean, {
    nullable: true,
  })
  value?: boolean;
}
@ObjectType()
export class Timestamp {
  public isTypeOf: string = 'Timestamp';

  @Field(() => String!, {})
  value!: string;
}

export const MarketPeriod = createUnionType({
  name: 'MarketPeriod',
  types: () => [Block, Timestamp],
  resolveType: (value) => (value.isTypeOf ? value.isTypeOf : undefined),
});
export const MarketType = createUnionType({
  name: 'MarketType',
  types: () => [Categorical, Scalar],
  resolveType: (value) => (value.isTypeOf ? value.isTypeOf : undefined),
});
export const MarketDisputeMechanism = createUnionType({
  name: 'MarketDisputeMechanism',
  types: () => [Authorized, Court, SimpleDisputes],
  resolveType: (value) => (value.isTypeOf ? value.isTypeOf : undefined),
});
