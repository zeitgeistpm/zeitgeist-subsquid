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
