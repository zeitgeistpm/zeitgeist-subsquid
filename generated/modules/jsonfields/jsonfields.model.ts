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
  ObjectType,
} from '@subsquid/warthog';
import BN from 'bn.js';
import { InputType, Field } from 'type-graphql';

@InputType('CategoryMetadataInput')
@ObjectType()
export class CategoryMetadata {
  @StringField({
    nullable: true,
  })
  name?: string;

  @StringField({
    nullable: true,
  })
  ticker?: string;

  @StringField({
    nullable: true,
  })
  img?: string;

  @StringField({
    nullable: true,
  })
  color?: string;
}

@InputType('MarketDisputeMechanismInput')
@ObjectType()
export class MarketDisputeMechanism {
  @StringField({
    nullable: true,
  })
  authorized?: string;

  @BooleanField({
    nullable: true,
  })
  court?: boolean;

  @BooleanField({
    nullable: true,
  })
  simpleDisputes?: boolean;
}

@InputType('MarketPeriodInput')
@ObjectType()
export class MarketPeriod {
  @StringField({
    nullable: true,
  })
  block?: string;

  @StringField({
    nullable: true,
  })
  timestamp?: string;
}

@InputType('MarketReportInput')
@ObjectType()
export class MarketReport {
  @IntField({})
  at!: number;

  @StringField({})
  by!: string;

  @Field(() => OutcomeReport)
  outcome!: OutcomeReport;
}

@InputType('MarketTypeInput')
@ObjectType()
export class MarketType {
  @StringField({
    nullable: true,
  })
  categorical?: string;

  @StringField({
    nullable: true,
  })
  scalar?: string;
}

@InputType('OutcomeReportInput')
@ObjectType()
export class OutcomeReport {
  @IntField({
    nullable: true,
  })
  categorical?: number;

  @IntField({
    nullable: true,
  })
  scalar?: number;
}

@InputType('WeightInput')
@ObjectType()
export class Weight {
  @StringField({})
  assetId!: string;

  @StringField({})
  len!: string;
}
