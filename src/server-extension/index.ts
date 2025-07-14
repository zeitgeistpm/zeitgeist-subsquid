import depthLimit from 'graphql-depth-limit'

// Export validation rules to prevent recursive GraphQL queries
export const validationRules = [
  depthLimit(5) // Limit GraphQL queries to maximum 5 levels deep
]

// Re-export all resolvers
export * from './resolvers'
