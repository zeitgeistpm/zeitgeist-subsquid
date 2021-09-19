import {Resolver, ObjectType, Field, Query} from "type-graphql"
import {InjectManager} from "typeorm-typedi-extensions"
import {EntityManager} from "typeorm"
import {BlockTimestamp} from "../generated/model"


@ObjectType()
export class Hello {
  @Field(() => String, { nullable: false })
  greeting!: string

  constructor(greeting: string) {
    this.greeting = greeting
  }
}


@Resolver()
export class HelloResolver {
  constructor(
    @InjectManager() private db: EntityManager
  ) {}

  @Query(() => Hello)
  async hello(): Promise<Hello> {
    let count = await this.db.getRepository(BlockTimestamp).createQueryBuilder().getCount()
    return new Hello(`Hello, we've seen ${count} transfers!`)
  }
}