#!/bin/bash
# Start the backend server with Python 3.12
cd "$(dirname "$0")"
/Library/Frameworks/Python.framework/Versions/3.12/bin/python3.12 -m uvicorn main:app --reload --host 0.0.0.0 --port 8000