import { Arg, Field, Int, ObjectType, Query, Resolver } from 'type-graphql';
import type { EntityManager } from 'typeorm';
import { Market } from '../../model/generated';
import { Cache } from '../../mappings/util';
import { marketMetadata } from '../query';

@ObjectType()
export class MarketMetadata {
  @Field(() => Int)
  marketId!: number;

  @Field(() => String)
  encoded!: string;

  @Field(() => String, { nullable: true })
  decoded!: string;

  constructor(props: Partial<MarketMetadata>) {
    Object.assign(this, props);
  }
}

@Resolver()
export class MarketMetadataResolver {
  constructor(private tx: () => Promise<EntityManager>) {}

  @Query(() => [MarketMetadata])
  async marketMetadata(@Arg('marketId', () => [Int!], { nullable: false }) ids: number[]): Promise<MarketMetadata[]> {
    const manager = await this.tx();
    const encodedData = await manager.getRepository(Market).query(marketMetadata(ids));

    let result: MarketMetadata[] = await Promise.all(
      encodedData.map(async (ed: any) => {
        const decodedData = await (await Cache.init()).getDecodedMetadata(ed.metadata);
        return {
          marketId: ed.market_id,
          encoded: ed.metadata,
          decoded: decodedData !== '0' ? decodedData : null, // '0' implies non-decodable metadata
        };
      })
    );
    return result;
  }
}
