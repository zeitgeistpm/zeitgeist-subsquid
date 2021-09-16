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
export class Block {
  public isTypeOf: string = 'Block';

  @Field(() => String!, {})
  value!: string;
}
@ObjectType()
export class Categorical {
  public isTypeOf: string = 'Categorical';

  @Field(() => Int!, {})
  categories!: number;
}
@ObjectType()
export class MarketCreated {
  public isTypeOf: string = 'MarketCreated';

  @Field(() => Float!, {})
  lowerBound!: BN;

  @Field(() => Float!, {})
  upperBound!: BN;
}
@ObjectType()
export class Scalar {
  public isTypeOf: string = 'Scalar';

  @Field(() => Float!, {})
  lowerBound!: BN;

  @Field(() => Float!, {})
  upperBound!: BN;
}
@ObjectType()
export class Timestamp {
  public isTypeOf: string = 'Timestamp';

  @Field(() => String!, {})
  value!: string;
}

export const MarketEnd = createUnionType({
  name: 'MarketEnd',
  types: () => [Block, Timestamp],
  resolveType: (value) => (value.isTypeOf ? value.isTypeOf : undefined),
});
export const MarketType = createUnionType({
  name: 'MarketType',
  types: () => [Categorical, Scalar],
  resolveType: (value) => (value.isTypeOf ? value.isTypeOf : undefined),
});
