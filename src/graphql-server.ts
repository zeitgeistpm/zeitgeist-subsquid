#!/usr/bin/env node

import { spawn, ChildProcess } from 'child_process'
import { parse, DocumentNode, FragmentDefinitionNode, FieldNode, OperationDefinitionNode, InlineFragmentNode } from 'graphql'
import { createServer } from 'http'
import * as http from 'http'

// Configuration constants
const PROXY_PORT = Number(process.env.GQL_PORT || process.env.GRAPHQL_SERVER_PORT || 4350)
const BACKEND_PORT = PROXY_PORT + 1
const MAX_QUERY_DEPTH = 5
const HEALTH_CHECK_TIMEOUT = 2000
const HEALTH_CHECK_RETRIES = 30
const HEALTH_CHECK_INTERVAL = 1000
const BACKEND_SHUTDOWN_TIMEOUT = 5000
const GRACEFUL_SHUTDOWN_DELAY = 1000

// Security configuration for backend server
const SECURITY_ARGS = [
  '--subscriptions',
  '--sql-statement-timeout', '8000',
  '--validation-max-errors', '5',
  '--max-request-size', '75',
  // '--max-root-fields', '20',
  // '--max-response-size', '100000',
  '--subscription-max-response-size', '8000',
  '--subscription-poll-interval', '5000'
]

// Global backend server reference
let backendServer: ChildProcess

// Utility functions
function logSecurityConfig(): void {
  console.log(`Starting secure GraphQL server on port ${PROXY_PORT}`)
  console.log('Security limits applied:')
  console.log('- SQL timeout: 8 seconds')
  console.log('- Max request size: 75KB (BACKEND)')
  console.log(`- Query depth limit: ${MAX_QUERY_DEPTH} levels (ENFORCED)`)
  // console.log('- Max root fields: 20 per query (BACKEND)')
  // console.log('- Max response size: 10,000 nodes (BACKEND)')
  console.log('- Subscription poll interval: 5 seconds')
  console.log('- Backend health check: 30 attempts, 1s intervals (ACTIVE)')
}

function createErrorResponse(message: string, code: string): string {
  return JSON.stringify({
    errors: [{
      message,
      extensions: { code }
    }]
  })
}

function collectFragmentDefinitions(documentAST: DocumentNode): Map<string, FragmentDefinitionNode> {
  const fragmentDefinitions = new Map<string, FragmentDefinitionNode>()
  
  for (const definition of documentAST.definitions) {
    if (definition.kind === 'FragmentDefinition') {
      fragmentDefinitions.set(definition.name.value, definition)
    }
  }
  
  return fragmentDefinitions
}

function checkQueryDepth(
  node: FieldNode | OperationDefinitionNode | FragmentDefinitionNode | InlineFragmentNode,
  depth = 0,
  fragmentDefinitions: Map<string, FragmentDefinitionNode> = new Map(),
  visitedFragments: Set<string> = new Set()
): boolean {
  if (depth > MAX_QUERY_DEPTH) return false
  
  if (!node.selectionSet) return true
  
  for (const selection of node.selectionSet.selections) {
    if (selection.kind === 'Field') {
      if (!checkQueryDepth(selection, depth + 1, fragmentDefinitions, visitedFragments)) {
        return false
      }
    } else if (selection.kind === 'InlineFragment') {
      const fragmentDepth = selection.selectionSet ? depth + 1 : depth
      if (!checkQueryDepth(selection, fragmentDepth, fragmentDefinitions, visitedFragments)) {
        return false
      }
    } else if (selection.kind === 'FragmentSpread') {
      const fragmentName = selection.name.value
      
      if (visitedFragments.has(fragmentName)) {
        console.log(`⚠️  Circular fragment reference detected: ${fragmentName}`)
        return false
      }
      
      const fragmentDefinition = fragmentDefinitions.get(fragmentName)
      if (!fragmentDefinition) {
        console.log(`⚠️  Fragment definition not found: ${fragmentName}`)
        return false
      }
      
      const newVisitedFragments = new Set(visitedFragments)
      newVisitedFragments.add(fragmentName)
      
      if (!checkQueryDepth(fragmentDefinition, depth, fragmentDefinitions, newVisitedFragments)) {
        return false
      }
    }
  }
  
  return true
}

function validateQueryDepth(query: string): boolean {
  try {
    // Check if this is an introspection query (safe to bypass depth limit)
    if (isIntrospectionQuery(query)) {
      console.log('✅ Introspection query detected - bypassing depth limit')
      return true
    }

    const documentAST = parse(query)
    const fragmentDefinitions = collectFragmentDefinitions(documentAST)
    
    for (const definition of documentAST.definitions) {
      if (definition.kind === 'OperationDefinition') {
        if (!checkQueryDepth(definition, 0, fragmentDefinitions)) {
          return false
        }
      }
    }
    
    return true
  } catch (error) {
    console.error('❌ Query parsing error:', error)
    return false
  }
}

function isIntrospectionQuery(query: string): boolean {
  // Introspection queries typically contain these patterns
  const introspectionPatterns = [
    '__schema',
    '__type',
    '__typename',
    'IntrospectionQuery',
    '__Field',
    '__InputValue',
    '__EnumValue',
    '__Directive'
  ]
  
  // Check if query contains introspection patterns
  return introspectionPatterns.some(pattern => query.includes(pattern))
}

function createProxyRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  body?: string
): void {
  const proxyReq = http.request({
    hostname: 'localhost',
    port: BACKEND_PORT,
    path: req.url,
    method: req.method,
    headers: req.headers
  }, (proxyRes: http.IncomingMessage) => {
    res.writeHead(proxyRes.statusCode || 500, proxyRes.headers)
    proxyRes.pipe(res)
    
    proxyRes.on('error', (err: Error) => {
      console.error('❌ Proxy response error:', err)
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(createErrorResponse('Backend response failed', 'BACKEND_RESPONSE_ERROR'))
      }
    })
  })
  
  proxyReq.on('error', (err) => {
    console.error('❌ Proxy request error:', err)
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(createErrorResponse('Backend request failed', 'BACKEND_ERROR'))
    }
  })
  
  if (body) {
    try {
      proxyReq.write(body)
      proxyReq.end()
    } catch (err) {
      console.error('❌ Error writing to proxy request:', err)
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(createErrorResponse('Failed to forward request', 'PROXY_WRITE_ERROR'))
      }
    }
  } else {
    req.pipe(proxyReq)
    req.on('error', (err) => {
      console.error('Request error:', err)
      proxyReq.destroy()
    })
  }
}

function handleGraphQLRequest(req: http.IncomingMessage, res: http.ServerResponse): void {
  let body = ''
  
  req.on('data', chunk => body += chunk)
  req.on('end', () => {
    try {
      // Handle empty request body
      if (!body || body.trim() === '') {
        console.log('🚫 Empty request body')
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(createErrorResponse('Empty request body', 'EMPTY_REQUEST_BODY'))
        return
      }

      const requestData = JSON.parse(body)
      
      // Handle missing query
      if (!requestData.query) {
        console.log('🚫 Missing query in request')
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(createErrorResponse('Missing query in request', 'MISSING_QUERY'))
        return
      }

      // Handle empty query
      if (requestData.query.trim() === '') {
        console.log('🚫 Empty query in request')
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(createErrorResponse('Empty query in request', 'EMPTY_QUERY'))
        return
      }
      
      if (!validateQueryDepth(requestData.query)) {
        console.log(`🚫 Query rejected: exceeds maximum depth of ${MAX_QUERY_DEPTH} levels`)
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(createErrorResponse(
          `Query exceeds maximum depth of ${MAX_QUERY_DEPTH} levels`,
          'GRAPHQL_VALIDATION_FAILED'
        ))
        return
      }
      
      console.log('✅ Query passed depth validation')
      createProxyRequest(req, res, body)
      
    } catch (error) {
      console.error('❌ Request validation error:', error)
      res.writeHead(400, { 'Content-Type': 'application/json' })
      res.end(createErrorResponse('Invalid request format', 'INVALID_REQUEST_FORMAT'))
    }
  })
}

async function waitForBackendReady(): Promise<void> {
  return new Promise((resolve, reject) => {
    let attempts = 0
    let resolved = false
    
    const safeResolve = () => {
      if (!resolved) {
        resolved = true
        resolve()
      }
    }
    
    const safeReject = (error: Error) => {
      if (!resolved) {
        resolved = true
        reject(error)
      }
    }
    
    const checkHealth = () => {
      if (resolved) return
      
      attempts++
      
      const healthReq = http.request({
        hostname: 'localhost',
        port: BACKEND_PORT,
        path: '/graphql',
        method: 'GET',
        timeout: HEALTH_CHECK_TIMEOUT
      }, () => {
        console.log(`✅ Backend GraphQL server is ready (attempt ${attempts})`)
        safeResolve()
      })
      
      healthReq.on('error', (err) => {
        if (resolved) return
        
        if (attempts >= HEALTH_CHECK_RETRIES) {
          console.error(`❌ Backend server failed to start after ${HEALTH_CHECK_RETRIES} attempts`)
          safeReject(new Error(`Backend server health check failed: ${err.message}`))
          return
        }
        
        console.log(`🔄 Waiting for backend server... (attempt ${attempts}/${HEALTH_CHECK_RETRIES})`)
        setTimeout(checkHealth, HEALTH_CHECK_INTERVAL)
      })
      
      healthReq.on('timeout', () => {
        healthReq.destroy()
        if (resolved) return
        
        if (attempts >= HEALTH_CHECK_RETRIES) {
          console.error(`❌ Backend server failed to start after ${HEALTH_CHECK_RETRIES} attempts`)
          safeReject(new Error('Backend server health check timeout'))
          return
        }
        
        console.log(`🔄 Backend server timeout, retrying... (attempt ${attempts}/${HEALTH_CHECK_RETRIES})`)
        setTimeout(checkHealth, HEALTH_CHECK_INTERVAL)
      })
      
      healthReq.end()
    }
    
    checkHealth()
  })
}

function startBackendServer(): void {
  // Production-ready environment variables with Docker defaults
  // Validate required environment variables
  const requiredEnvVars = [
    'DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASS',
    'REDIS_HOST', 'REDIS_PORT'
  ]
  
  const missingVars = requiredEnvVars.filter(varName => {
    const value = process.env[varName]
    return !value || value.trim() === ''
  })
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:')
    missingVars.forEach(varName => {
      console.error(`   - ${varName}`)
    })
    console.error('\n💡 Please set these variables in your .env file')
    process.exit(1)
  }

  const serverEnv = { 
    ...process.env, 
    PORT: BACKEND_PORT.toString(),
    GQL_PORT: BACKEND_PORT.toString(),
    GRAPHQL_SERVER_PORT: BACKEND_PORT.toString(),
    DB_HOST: process.env.DB_HOST!,
    DB_PORT: process.env.DB_PORT!,
    DB_NAME: process.env.DB_NAME!,
    DB_USER: process.env.DB_USER!,
    DB_PASS: process.env.DB_PASS!,
    REDIS_HOST: process.env.REDIS_HOST!,
    REDIS_PORT: process.env.REDIS_PORT!
  }

  console.log(`🔧 Starting backend GraphQL server on port ${BACKEND_PORT}...`)
  console.log(`🔧 Database: ${serverEnv.DB_HOST}:${serverEnv.DB_PORT}/${serverEnv.DB_NAME}`)
  console.log(`🔧 Redis: ${serverEnv.REDIS_HOST}:${serverEnv.REDIS_PORT}`)
  
  backendServer = spawn('npx', ['squid-graphql-server', ...SECURITY_ARGS], {
    stdio: 'pipe',
    env: serverEnv,
    cwd: process.cwd()
  })

  backendServer.stdout?.on('data', (data) => {
    const output = data.toString().trim()
    if (output) console.log(`[Backend] ${output}`)
  })

  backendServer.stderr?.on('data', (data) => {
    const output = data.toString().trim()
    if (output) console.error(`[Backend Error] ${output}`)
  })

  backendServer.on('error', (error: NodeJS.ErrnoException) => {
    console.error(`❌ Failed to start backend GraphQL server:`, error.message)
    console.error(`   Command: npx squid-graphql-server ${SECURITY_ARGS.join(' ')}`)
    console.error(`   Working directory: ${process.cwd()}`)
    console.error(`   Database: ${serverEnv.DB_HOST}:${serverEnv.DB_PORT}/${serverEnv.DB_NAME}`)
    
    if (error.code === 'ENOENT') {
      console.error(`   Make sure @subsquid/graphql-server is installed: yarn install`)
    } else if (error.code === 'EACCES') {
      console.error(`   Permission denied. Check file permissions.`)
    }
    
    console.error(`   Shutting down secure GraphQL server...`)
    process.exit(1)
  })

  backendServer.on('exit', (code, signal) => {
    if (code !== 0) {
      console.error(`❌ Backend GraphQL server exited with code ${code}${signal ? ` (${signal})` : ''}`)
    } else {
      console.log(`✅ Backend GraphQL server exited normally`)
    }
  })
}

function createProxyServer(): void {
  const server = createServer((req, res) => {
    if (req.url?.startsWith('/graphql') && req.method === 'POST') {
      handleGraphQLRequest(req, res)
    } else {
      createProxyRequest(req, res)
    }
  })
  
  server.listen(PROXY_PORT, () => {
    console.log(`✅ Secure GraphQL server started on port ${PROXY_PORT}`)
    console.log(`✅ Query depth limit: ${MAX_QUERY_DEPTH} levels (ACTIVE)`)
    console.log(`✅ GraphQL Playground: http://localhost:${PROXY_PORT}/graphql`)
  })
}

function gracefulShutdown(signal: string): void {
  console.log(`\n🔴 Received ${signal}, shutting down secure GraphQL server...`)
  
  if (backendServer && !backendServer.killed) {
    console.log('🔄 Stopping backend GraphQL server...')
    backendServer.kill('SIGTERM')
    
    setTimeout(() => {
      if (!backendServer.killed) {
        console.log('⚠️  Backend server not responding, force killing...')
        backendServer.kill('SIGKILL')
      }
    }, BACKEND_SHUTDOWN_TIMEOUT)
  }
  
  setTimeout(() => {
    console.log('✅ Secure GraphQL server shutdown complete')
    process.exit(0)
  }, GRACEFUL_SHUTDOWN_DELAY)
}

// Main execution
async function main(): Promise<void> {
  logSecurityConfig()
  startBackendServer()
  
  try {
    await waitForBackendReady()
    console.log('✅ Backend GraphQL server confirmed ready')
    createProxyServer()
  } catch (error) {
    console.error('❌ Failed to start secure GraphQL server:', error instanceof Error ? error.message : String(error))
    console.error('   Backend server health check failed')
    console.error('   Shutting down...')
    process.exit(1)
  }
}

// Signal handlers
process.on('SIGINT', () => gracefulShutdown('SIGINT'))
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))

// Start the application
main().catch((error) => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
}) 