#!/usr/bin/env node
import { spawn } from 'child_process'
import { parse } from 'graphql'
import { createServer } from 'http'

const port = process.env.GQL_PORT || process.env.GRAPHQL_SERVER_PORT || 4000
const backendPort = Number(port) + 1
const MAX_QUERY_DEPTH = 5

console.log(`Starting secure GraphQL server on port ${port}`)
console.log('Security limits applied:')
console.log('- SQL timeout: 8 seconds')
console.log('- Max request size: 75KB')
console.log(`- Query depth limit: ${MAX_QUERY_DEPTH} levels (ENFORCED)`)
console.log('- Subscription poll interval: 5 seconds')

// Start the backend GraphQL server on a different port
const securityArgs = [
  '--subscriptions',
  '--sql-statement-timeout', '8000',
  '--validation-max-errors', '5',
  '--max-request-size', '75',
  '--subscription-max-response-size', '8000',
  '--subscription-poll-interval', '5000'
]

const serverEnv = { 
  ...process.env, 
  PORT: backendPort.toString(),
  GQL_PORT: backendPort.toString(),
  GRAPHQL_SERVER_PORT: backendPort.toString()
}

console.log(`🔧 Starting backend GraphQL server on port ${backendPort}...`)
const backendServer = spawn('npx', ['squid-graphql-server', ...securityArgs], {
  stdio: 'pipe',
  env: serverEnv,
  cwd: process.cwd()
})

/**
 * Recursively checks the depth of a GraphQL query
 * @param node - The GraphQL AST node to check
 * @param depth - Current depth level (starts at 0)
 * @param maxDepth - Maximum allowed depth
 * @returns true if query is within depth limit, false otherwise
 */
function checkQueryDepth(node: any, depth = 0, maxDepth = MAX_QUERY_DEPTH): boolean {
  if (depth > maxDepth) {
    return false
  }
  
  if (node.selectionSet) {
    for (const selection of node.selectionSet.selections) {
      if (selection.kind === 'Field') {
        if (!checkQueryDepth(selection, depth + 1, maxDepth)) {
          return false
        }
      } else if (selection.kind === 'InlineFragment' || selection.kind === 'FragmentSpread') {
        if (!checkQueryDepth(selection, depth, maxDepth)) {
          return false
        }
      }
    }
  }
  
  return true
}

// Wait for backend server to start
setTimeout(() => {
  console.log('✅ Backend GraphQL server started')
  
  // Create validation proxy server
  const server = createServer((req, res) => {
    // Handle CORS
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    
    if (req.method === 'OPTIONS') {
      res.writeHead(200)
      res.end()
      return
    }
    
    // Handle GraphQL requests
    if (req.url?.startsWith('/graphql') && req.method === 'POST') {
      let body = ''
      req.on('data', chunk => body += chunk)
      req.on('end', () => {
        try {
          const requestData = JSON.parse(body)
          
          if (requestData.query) {
            // Parse and validate query depth
            const documentAST = parse(requestData.query)
            
            let isValidDepth = true
            for (const definition of documentAST.definitions) {
              if (definition.kind === 'OperationDefinition') {
                if (!checkQueryDepth(definition)) {
                  isValidDepth = false
                  break
                }
              }
            }
            
            if (!isValidDepth) {
              console.log(`🚫 Query rejected: exceeds maximum depth of ${MAX_QUERY_DEPTH} levels`)
              res.writeHead(400, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({
                errors: [{
                  message: `Query exceeds maximum depth of ${MAX_QUERY_DEPTH} levels`,
                  extensions: {
                    code: 'GRAPHQL_VALIDATION_FAILED'
                  }
                }]
              }))
              return
            }
            
            console.log('✅ Query passed depth validation')
          }
          
          // Forward valid requests to backend
          const proxyReq = require('http').request({
            hostname: 'localhost',
            port: backendPort,
            path: req.url,
            method: req.method,
            headers: req.headers
          }, (proxyRes: any) => {
            res.writeHead(proxyRes.statusCode, proxyRes.headers)
            proxyRes.pipe(res)
          })
          
          proxyReq.write(body)
          proxyReq.end()
          
        } catch (error) {
          console.error('❌ Validation error:', error)
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({
            errors: [{
              message: 'Query parsing failed',
              extensions: {
                code: 'GRAPHQL_VALIDATION_FAILED'
              }
            }]
          }))
        }
      })
    } else {
      // Forward other requests to backend
      const proxyReq = require('http').request({
        hostname: 'localhost',
        port: backendPort,
        path: req.url,
        method: req.method,
        headers: req.headers
      }, (proxyRes: any) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers)
        proxyRes.pipe(res)
      })
      
      req.pipe(proxyReq)
    }
  })
  
  server.listen(port, () => {
    console.log(`✅ Secure GraphQL server started on port ${port}`)
    console.log(`✅ Query depth limit: ${MAX_QUERY_DEPTH} levels (ACTIVE)`)
    console.log(`✅ GraphQL Playground: http://localhost:${port}/graphql`)
  })
}, 3000)

// Handle server cleanup
process.on('SIGINT', () => {
  console.log('\n🔴 Shutting down secure GraphQL server...')
  backendServer.kill()
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\n🔴 Shutting down secure GraphQL server...')
  backendServer.kill()
  process.exit(0)
}) 