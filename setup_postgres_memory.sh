#!/bin/bash

# Enhanced PostgreSQL Memory System Setup Script
echo "🚀 Setting up Enhanced PostgreSQL Memory System for DD-AI"
echo "============================================================"

# Navigate to project directory
cd /Users/mubashirasaad/Projects/dd-ai/ddai_api

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Verify PostgreSQL connection
echo "🔗 Testing PostgreSQL connection..."
python -c "
import os
from dotenv import load_dotenv
load_dotenv()
import psycopg2

try:
    conn = psycopg2.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        port=os.getenv('DB_PORT', '5432'),
        database=os.getenv('DB_NAME', 'postgres'),
        user=os.getenv('DB_USER', 'postgres'),
        password=os.getenv('DB_PASSWORD', '')
    )
    print(' PostgreSQL connection successful!')
    conn.close()
except Exception as e:
    print(f'❌ PostgreSQL connection failed: {e}')
"

# Run Django checks
echo "🔍 Running Django system checks..."
python manage.py check

# Test the memory system
echo "🧠 Testing enhanced memory system..."
python manage.py test_memory --session-id="setup-test" --agent-name="SetupTestBot"

echo ""
echo " Enhanced PostgreSQL Memory System Setup Complete!"
echo ""
echo "🔧 Key Improvements:"
echo "   • Replaced Qdrant with PostgreSQL for better performance"
echo "   • Implemented proper agent naming per Agno documentation"
echo "   • Enhanced memory management with structured storage"
echo "   • Integrated with existing Node.js PostgreSQL database"
echo "   • Added multi-agent support with memory isolation"
echo ""
echo "🚀 You can now start the server with:"
echo "   python manage.py runserver 8000"
echo ""
echo "📝 Test the system with:"
echo "   python ../test_postgres_memory.py"
