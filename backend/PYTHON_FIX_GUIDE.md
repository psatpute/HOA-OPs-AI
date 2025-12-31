# Python 3.13 MongoDB SSL Issue - Fix Guide

## Problem
Python 3.13.2 with OpenSSL 3.0.15 has a known incompatibility with MongoDB Atlas, causing SSL handshake failures:
```
[SSL: TLSV1_ALERT_INTERNAL_ERROR] tlsv1 alert internal error
```

## Solution: Install Python 3.12

### Option 1: Install Homebrew (Recommended)
```bash
# Install Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Python 3.12
brew install python@3.12

# Verify installation
/opt/homebrew/bin/python3.12 --version
```

### Option 2: Download Python 3.12 Directly
1. Visit: https://www.python.org/downloads/release/python-3120/
2. Download "macOS 64-bit universal2 installer"
3. Install the package
4. Python 3.12 will be at: `/Library/Frameworks/Python.framework/Versions/3.12/bin/python3.12`

### Option 3: Use pyenv
```bash
# Install pyenv
curl https://pyenv.run | bash

# Add to ~/.zshrc
echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.zshrc
echo 'command -v pyenv >/dev/null || export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.zshrc
echo 'eval "$(pyenv init -)"' >> ~/.zshrc

# Restart shell
exec zsh

# Install Python 3.12
pyenv install 3.12.0
pyenv global 3.12.0
```

## After Installing Python 3.12

### Step 1: Stop Current Server
Press `Ctrl+C` in Terminal 7 to stop the backend server

### Step 2: Reinstall Dependencies
```bash
cd backend
/opt/homebrew/bin/python3.12 -m pip install -r requirements.txt
# OR if downloaded directly:
/Library/Frameworks/Python.framework/Versions/3.12/bin/python3.12 -m pip install -r requirements.txt
```

### Step 3: Start Server with Python 3.12
```bash
cd backend
/opt/homebrew/bin/python3.12 -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
# OR if downloaded directly:
/Library/Frameworks/Python.framework/Versions/3.12/bin/python3.12 -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Step 4: Verify Connection
You should see:
```
Successfully connected to MongoDB Atlas
```

## Current Status
- ✅ Error handling implemented - proper error messages
- ✅ Dependencies updated - motor 3.7.0, pymongo 4.10.1, certifi
- ⚠️ Database connection - requires Python 3.12 to fix SSL issue
- 📝 **Action needed:** Install Python 3.12 using one of the options above

## Quick Test
After installing Python 3.12, test the connection:
```bash
cd backend
python3.12 -c "from pymongo import MongoClient; import certifi; client = MongoClient('mongodb+srv://parinitashinde_db_user:Z51hCfxRaGZgujFD@cluster0.btyhbef.mongodb.net/hoaops?retryWrites=true&w=majority&appName=Cluster0', tlsCAFile=certifi.where()); print('Connected:', client.admin.command('ping'))"
```

If this prints `Connected: {'ok': 1.0}`, you're good to go!