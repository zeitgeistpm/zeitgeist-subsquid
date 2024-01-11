import { Field, ObjectType, Query, Resolver } from 'type-graphql';
import { EntityManager } from 'typeorm';
import { getAssetUsdPrices } from '../helper';
import { volumeHistory } from '../query';

@ObjectType()
export class VolumeHistory {
  @Field(() => String)
  date!: string;

  @Field(() => BigInt)
  volume!: BigInt;

  constructor(props: Partial<VolumeHistory>) {
    Object.assign(this, props);
  }
}

@Resolver()
export class VolumeHistoryResolver {
  constructor(private tx: () => Promise<EntityManager>) {}

  @Query(() => [VolumeHistory])
  async volumeHistory(): Promise<VolumeHistory[]> {
    const manager = await this.tx();
    const result = await manager.query(volumeHistory(await getAssetUsdPrices()));

    let data: VolumeHistory[] = [];
    await Promise.all(
      result.map(async ({ date, volume }: any) => {
        data.push({
          date: date.toISOString().split('T')[0],
          volume: volume,
        });
      })
    );
    return data;
  }
}
