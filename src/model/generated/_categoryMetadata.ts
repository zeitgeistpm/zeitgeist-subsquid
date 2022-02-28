import assert from "assert"
import * as marshal from "./marshal"

export class CategoryMetadata {
  private _name!: string | undefined | null
  private _ticker!: string | undefined | null
  private _img!: string | undefined | null
  private _color!: string | undefined | null

  constructor(props?: Partial<Omit<CategoryMetadata, 'toJSON'>>, json?: any) {
    Object.assign(this, props)
    if (json != null) {
      this._name = json.name == null ? undefined : marshal.string.fromJSON(json.name)
      this._ticker = json.ticker == null ? undefined : marshal.string.fromJSON(json.ticker)
      this._img = json.img == null ? undefined : marshal.string.fromJSON(json.img)
      this._color = json.color == null ? undefined : marshal.string.fromJSON(json.color)
    }
  }

  get name(): string | undefined | null {
    return this._name
  }

  set name(value: string | undefined | null) {
    this._name = value
  }

  get ticker(): string | undefined | null {
    return this._ticker
  }

  set ticker(value: string | undefined | null) {
    this._ticker = value
  }

  get img(): string | undefined | null {
    return this._img
  }

  set img(value: string | undefined | null) {
    this._img = value
  }

  get color(): string | undefined | null {
    return this._color
  }

  set color(value: string | undefined | null) {
    this._color = value
  }

  toJSON(): object {
    return {
      name: this.name,
      ticker: this.ticker,
      img: this.img,
      color: this.color,
    }
  }
}
