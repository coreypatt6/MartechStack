#!/bin/bash

echo "🚀 Starting MarTech Stack Dashboard..."
echo "📍 Checking available ports..."

# Function to check if a port is available
check_port() {
    local port=$1
    if ! lsof -i :$port > /dev/null 2>&1; then
        return 0  # Port is available
    else
        return 1  # Port is in use
    fi
}

# Try different ports
PORTS=(8080 8081 8082 8083 8084 8085 3001 3002 5000 5001)

for PORT in "${PORTS[@]}"; do
    if check_port $PORT; then
        echo "✅ Found available port: $PORT"
        echo "🌟 Starting server on http://localhost:$PORT"
        echo ""
        echo "🔗 OPEN THIS URL IN YOUR BROWSER:"
        echo "   http://localhost:$PORT"
        echo ""
        cd "$(dirname "$0")"
        
        # Try Node.js server first
        if command -v node > /dev/null 2>&1; then
            echo "📦 Using Node.js server..."
            cat > temp-server.js << EOF
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  let filePath = path.join(__dirname, 'dist', req.url === '/' ? 'index.html' : req.url);
  
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('File not found');
      return;
    }
    
    const ext = path.extname(filePath);
    let contentType = 'text/html';
    
    switch (ext) {
      case '.js': contentType = 'application/javascript'; break;
      case '.css': contentType = 'text/css'; break;
      case '.json': contentType = 'application/json'; break;
      case '.png': contentType = 'image/png'; break;
      case '.jpg': contentType = 'image/jpeg'; break;
      case '.svg': contentType = 'image/svg+xml'; break;
    }
    
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen($PORT, '0.0.0.0', () => {
  console.log('🎉 Server successfully started!');
  console.log('🔗 Access your application at: http://localhost:$PORT');
});

server.on('error', (err) => {
  console.error('❌ Server error:', err);
  process.exit(1);
});
EOF
            node temp-server.js
        else
            echo "❌ Node.js not found"
            exit 1
        fi
        break
    else
        echo "❌ Port $PORT is in use, trying next..."
    fi
done

echo "❌ No available ports found. Please close some applications and try again."