# Deploy LogsDX Demo to CodeSandbox

## Option 1: Using CodeSandbox CLI

1. **Install CodeSandbox CLI** (already done):
   ```bash
   bun add -g codesandbox
   ```

2. **Deploy from this directory**:
   ```bash
   cd examples/codesandbox
   codesandbox .
   ```

3. **The CLI will**:
   - Upload the demo files
   - Install dependencies 
   - Create a public CodeSandbox URL
   - Return the URL for sharing

## Option 2: Manual Upload

1. Go to [codesandbox.io](https://codesandbox.io)
2. Create a new Node.js sandbox
3. Upload these files:
   - `package.json`
   - `index.js` 
   - `README.md`
4. The sandbox will auto-install dependencies and run

## Option 3: GitHub Import

1. Push this demo to a GitHub repo
2. Go to `codesandbox.io/s/github/username/repo/tree/main/examples/codesandbox`
3. CodeSandbox will automatically import and run

## Before Deploying

Make sure to update `package.json` dependencies for production:

```json
{
  "dependencies": {
    "logsdx": "latest"
  }
}
```

(Currently set to `file:../../` for local development)

## Expected Output

The demo will show:
- All 6 built-in themes applied to sample logs
- Different log types (API logs, system logs) with different themes  
- HTML output examples for web usage
- Colorized terminal output with ANSI codes

## Demo Features

✅ **Uses actual LogsDX functionality** (not creating themes)
✅ **Uses real built-in themes** (oh-my-zsh, dracula, github-light, github-dark, solarized-light, solarized-dark)
✅ **Demonstrates multiple output formats** (ANSI for terminal, HTML for web)
✅ **Shows practical use cases** (API logs, system logs, application logs)