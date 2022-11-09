import { BlockHandlerContext } from '@subsquid/substrate-processor'
import { Store } from '@subsquid/typeorm-store'

export async function destroy_markets(ctx: BlockHandlerContext<Store>) {
  for (var i = 0; i < ctx.items.length; i++) {
    console.log(ctx.items[i])
  }
}
