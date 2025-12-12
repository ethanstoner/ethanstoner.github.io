# Accessing Portfolio from Windows

## Current Status
✅ Server is running on port 3001
✅ Bound to 0.0.0.0 (accessible from Windows)
✅ HTML files are being served correctly

## How to Access

### Option 1: Standard Access (Recommended)
Open in Windows browser:
```
http://localhost:3001
```

### Option 2: Direct IP Access
If localhost doesn't work, try the WSL IP:
```
http://172.27.12.182:3001
```

### Option 3: 127.0.0.1
```
http://127.0.0.1:3001
```

## Troubleshooting

### If you see "This site can't be reached":

1. **Check WSL Port Forwarding**
   - In Windows PowerShell (as Administrator), run:
   ```powershell
   netsh interface portproxy add v4tov4 listenport=3001 listenaddress=0.0.0.0 connectport=3001 connectaddress=172.27.12.182
   ```

2. **Check Windows Firewall**
   - Allow port 3001 through Windows Firewall
   - Or temporarily disable firewall to test

3. **Verify Server is Running**
   - In WSL, run: `ps aux | grep "http.server"`
   - Should see a python3 process

4. **Restart Server**
   ```bash
   cd /home/ethan/ethanstoner-portfolio
   python3 -m http.server 3001 --bind 0.0.0.0
   ```

### If page loads but is blank:

1. **Hard Refresh Browser**
   - Windows: `Ctrl + Shift + R` or `Ctrl + F5`
   - This clears browser cache

2. **Check Browser Console**
   - Press F12 to open DevTools
   - Check Console tab for errors
   - Check Network tab to see if files are loading

3. **Verify Files Exist**
   - Check that `index.html` exists in the portfolio directory
   - Check that `styles.css` exists

## Server Commands

### Start Server
```bash
cd /home/ethan/ethanstoner-portfolio
python3 -m http.server 3001 --bind 0.0.0.0
```

### Stop Server
```bash
pkill -f "python3 -m http.server"
```

### Check Server Status
```bash
netstat -tlnp | grep 3001
# or
ss -tlnp | grep 3001
```

## Current Server Info
- **Port:** 3001
- **Bind Address:** 0.0.0.0 (all interfaces)
- **WSL IP:** 172.27.12.182
- **Status:** ✅ Running
