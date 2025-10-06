#!/bin/bash

# Lab 03-02 Issue Tracker Deployment Script
echo "Starting deployment of Issue Tracker to Google Cloud..."

# Build the project
echo "Building the project..."
npm run build

# Check if gcloud is available
if command -v gcloud &> /dev/null; then
    echo "Google Cloud CLI found. Deploying to App Engine..."
    
    # Create app.yaml for App Engine deployment
    cat > app.yaml << EOF
runtime: nodejs18
service: issue-tracker

env_variables:
  NODE_ENV: production
  PORT: 8080

automatic_scaling:
  min_instances: 1
  max_instances: 10
  target_cpu_utilization: 0.6

handlers:
  - url: /.*
    script: auto
    secure: always
EOF

    # Deploy to App Engine
    gcloud app deploy app.yaml --quiet
    
    echo "Deployment completed successfully!"
    echo "Your app is available at: https://issue-tracker-dot-[PROJECT-ID].appspot.com"
    
else
    echo "Google Cloud CLI not found. Please install it first."
    echo "You can download it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi
