declare module 'graphql-depth-limit' {
  import { ValidationRule } from 'graphql'
  
  function depthLimit(maxDepth: number): ValidationRule
  export = depthLimit
}
