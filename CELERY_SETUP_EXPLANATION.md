# Celery Setup Issue - Explanation and Solution

## The Problem

When you tried to run:
```bash
celery -A celery_app worker --loglevel=info --queue=credential_queue
```

You got:
```
Command 'celery' not found
```

## Root Cause

1. **Celery IS installed** in your virtual environment (version 5.4.0)
2. **But the `celery` command is not in your PATH**
3. The virtual environment activation might not be working correctly

## Why This Happens

- Celery is installed as a Python package, but the `celery` executable script might not be in the venv's `bin` directory
- Or the venv's `bin` directory is not in your PATH
- This is common when using `uv` or other package managers

## Solution: Use `python -m celery`

Instead of running `celery` directly, use Python's module execution:

```bash
cd Everycred
source .venv/bin/activate
python -m celery -A celery_app worker --loglevel=info --queue=credential_queue
```

Or use the full path to the venv's Python:

```bash
cd Everycred
.venv/bin/python -m celery -A celery_app worker --loglevel=info --queue=credential_queue
```

## Quick Start Script

I've created a helper script `start_celery.sh` in the Everycred directory. You can use it:

```bash
cd Everycred
./start_celery.sh
```

Or run it directly:
```bash
cd /home/i-m-shailesh/Desktop/LMS_demo/Everycred
bash start_celery.sh
```

## Verify Celery is Installed

Check if celery is available:
```bash
cd Everycred
.venv/bin/python -m celery --version
```

Should output: `5.4.0 (opalescent)` or similar

## Alternative: Install Celery Executable

If you want the `celery` command directly available:

```bash
cd Everycred
source .venv/bin/activate
# If using uv:
uv pip install --system celery

# Or create a symlink:
ln -s $(pwd)/.venv/bin/celery $(pwd)/.venv/bin/celery
```

But using `python -m celery` is the recommended approach.

## Running Celery in Background

To run Celery in the background:

```bash
cd Everycred
nohup .venv/bin/python -m celery -A celery_app worker --loglevel=info --queue=credential_queue > celery.log 2>&1 &
```

Check if it's running:
```bash
ps aux | grep celery
```

Stop it:
```bash
pkill -f "celery.*worker"
```

## Summary

**The Issue**: `celery` command not found, even though Celery is installed

**The Solution**: Use `python -m celery` instead of just `celery`

**Correct Command**:
```bash
cd Everycred
.venv/bin/python -m celery -A celery_app worker --loglevel=info --queue=credential_queue
```

This will start the Celery worker and process credential issuance tasks in the background.

