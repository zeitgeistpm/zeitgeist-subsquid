import { Field, ObjectType, Query, Resolver } from 'type-graphql';
import { EntityManager } from 'typeorm';
import { liquidityHistory } from '../query';

@ObjectType()
export class LiquidityHistory {
  @Field(() => String)
  date!: string;

  @Field(() => BigInt)
  liquidity!: BigInt;

  constructor(props: Partial<LiquidityHistory>) {
    Object.assign(this, props);
  }
}

@Resolver()
export class LiquidityHistoryResolver {
  constructor(private tx: () => Promise<EntityManager>) {}

  @Query(() => [LiquidityHistory])
  async liquidityHistory(): Promise<LiquidityHistory[]> {
    const manager = await this.tx();
    const result = await manager.query(liquidityHistory());

    let data: LiquidityHistory[] = [];
    await Promise.all(
      result.map(async ({ date, liquidity }: any) => {
        data.push({
          date: date.toISOString().split('T')[0],
          liquidity,
        });
      })
    );
    return data;
  }
}
