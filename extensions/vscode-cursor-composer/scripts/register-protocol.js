const fs = require("fs");
const path = require("path");
const os = require("os");
const { execSync } = require("child_process");

function checkCommand(command) {
  try {
    execSync(`which ${command}`);
    return true;
  } catch {
    return false;
  }
}

function execSafely(command, errorMessage) {
  try {
    execSync(command);
    return true;
  } catch (error) {
    console.log(`Warning: ${errorMessage}`);
    console.log(`Command failed: ${command}`);
    return false;
  }
}

function getVSCodePath() {
  const platform = os.platform();
  try {
    if (platform === "win32") {
      return execSync("where code").toString().split("\n")[0].trim();
    } else if (platform === "linux" && fs.existsSync("/proc/version")) {
      // Check if running in WSL
      const version = fs.readFileSync("/proc/version", "utf8");
      if (version.toLowerCase().includes("microsoft")) {
        // We're in WSL, use the Windows VS Code path
        const windowsPath = execSync("wslpath -w $(which code)")
          .toString()
          .trim();
        return windowsPath || "code";
      }
    }
    return execSync("which code").toString().trim();
  } catch (error) {
    console.error("VS Code not found in PATH");
    return "code";
  }
}

function registerProtocol() {
  const platform = os.platform();
  const vscodePath = getVSCodePath();

  if (platform === "linux") {
    // Create handler script
    const handlerPath = path.join(
      os.homedir(),
      ".local/bin/cursor-url-handler"
    );

    // Create PowerShell script template
    const psScriptTemplate = `
Add-Type -AssemblyName System.Windows.Forms

# Find Cursor.exe
$cursorPath = Get-ChildItem -Path "C:\\Users\\*\\AppData\\Local\\Programs\\cursor\\Cursor.exe" -ErrorAction SilentlyContinue | Select-Object -First 1 | ForEach-Object { $_.FullName }
if (-not $cursorPath) {
    $cursorPath = Get-ChildItem -Path "C:\\Users\\*\\AppData\\Local\\Programs\\Cursor\\Cursor.exe" -ErrorAction SilentlyContinue | Select-Object -First 1 | ForEach-Object { $_.FullName }
}
if (-not $cursorPath) {
    throw "Could not find Cursor.exe"
}

Write-Output "Found Cursor at: $cursorPath"

try {
    $shell = New-Object -ComObject WScript.Shell
    
    # Try to activate existing window
    if (-not $shell.AppActivate('Cursor')) {
        Write-Output "Starting new Cursor instance..."
        Start-Process -FilePath $cursorPath
        Start-Sleep -Seconds 3
        # Keep trying to activate the window
        $attempts = 0
        while (-not $shell.AppActivate('Cursor') -and $attempts -lt 10) {
            Start-Sleep -Seconds 1
            $attempts++
        }
        if (-not $shell.AppActivate('Cursor')) {
            throw "Failed to activate Cursor window"
        }
    }
    
    Start-Sleep -Seconds 1
    # Open composer (Ctrl+I)
    [System.Windows.Forms.SendKeys]::SendWait('^i')
    Start-Sleep -Seconds 1
    
    Set-Clipboard -Value $args[0]
    [System.Windows.Forms.SendKeys]::SendWait('^v')
    Start-Sleep -Milliseconds 500
    
    Write-Output "Command executed successfully"
} catch {
    Write-Error $_.Exception.Message
    throw
} finally {
    if ($shell) {
        [System.Runtime.InteropServices.Marshal]::ReleaseComObject($shell) | Out-Null
        Remove-Variable shell
    }
}
`.trim();

    const handlerScript = `#!/bin/bash
# Enable error handling
set -e

# Function to print errors in red
print_error() {
    echo -e "\\e[31mError: $1\\e[0m" >&2
}

# Function to print debug info
print_debug() {
    if [ -n "$1" ]; then
        echo -e "\\e[36mDebug: $1\\e[0m"
    fi
}

# Function to print warnings in yellow
print_warning() {
    echo -e "\\e[33mWarning: $1\\e[0m" >&2
}

url="$1"
echo "Received URL: $url"

if grep -qi microsoft /proc/version; then
  echo "Running in WSL"
  # First, register the protocol handlers in Windows
  print_debug "Running PowerShell registration command..."

  # Create temporary PowerShell script
  ps_script=$(mktemp --suffix .ps1)
  win_script=$(wslpath -w "$ps_script")

  # Write PowerShell script template to file
  cat > "$ps_script" << 'POWERSHELL_SCRIPT'
${psScriptTemplate}
POWERSHELL_SCRIPT

  # Run PowerShell script and capture output
  output=$(powershell.exe -NoProfile -NonInteractive -ExecutionPolicy Bypass -File "$win_script" "$url" 2>&1)

  # Clean up temporary script
  rm -f "$ps_script"

  # Process PowerShell output
  while IFS= read -r line; do
    if echo "$line" | grep -qi "error\\|exception\\|failed\\|warning"; then
      print_error "$line"
    else
      print_debug "$line"
    fi
  done <<< "$output"

  # Check for errors in output
  if echo "$output" | grep -qi "error:\\|exception:\\|failed"; then
    print_error "PowerShell execution failed"
    exit 1
  fi
else
  echo "Running in native Linux"
  code --open-url "$url"
fi

# Log the exit status
exit_status=$?
if [ $exit_status -ne 0 ]; then
    print_error "Process failed with status: $exit_status"
else
    echo "Command completed successfully"
fi
exit $exit_status`;

    // Ensure bin directory exists
    const binDir = path.dirname(handlerPath);
    if (!fs.existsSync(binDir)) {
      fs.mkdirSync(binDir, { recursive: true });
    }

    fs.writeFileSync(handlerPath, handlerScript);
    fs.chmodSync(handlerPath, "755");
    console.log("Created URL handler script");

    // Create desktop file
    const desktopPath = path.join(
      os.homedir(),
      ".local/share/applications/cursor-url-handler.desktop"
    );

    const desktopContent = `[Desktop Entry]
Version=1.0
Name=Cursor URL Handler
Comment=Handle cursor:// URLs
Exec=${handlerPath} %u
Terminal=false
Type=Application
Categories=Utility;
MimeType=x-scheme-handler/cursor;x-scheme-handler/vscode-cursor-composer;`;

    const desktopDir = path.dirname(desktopPath);
    if (!fs.existsSync(desktopDir)) {
      fs.mkdirSync(desktopDir, { recursive: true });
    }

    fs.writeFileSync(desktopPath, desktopContent);
    fs.chmodSync(desktopPath, "755");
    console.log("Created desktop entry");

    // Register handlers
    const commands = [
      `xdg-mime default cursor-url-handler.desktop x-scheme-handler/cursor`,
      `xdg-mime default cursor-url-handler.desktop x-scheme-handler/vscode-cursor-composer`,
      `update-desktop-database ${path.join(os.homedir(), ".local/share/applications")}`,
    ];

    commands.forEach((cmd) => {
      try {
        execSync(cmd);
        console.log(`Successfully executed: ${cmd}`);
      } catch (err) {
        console.log(`Warning: Failed to execute: ${cmd}`);
      }
    });

    // Test registration
    console.log("\nTesting registration:");
    console.log("Handler path:", handlerPath);
    console.log("Desktop file:", desktopPath);

    try {
      const handler = execSync("xdg-mime query default x-scheme-handler/cursor")
        .toString()
        .trim();
      console.log("Current cursor:// handler:", handler);
    } catch (err) {
      console.log("Failed to query handler");
    }
  } else if (platform === "win32") {
    // Windows registry commands for both protocols
    const protocols = ["cursor", "vscode-cursor-composer"];

    protocols.forEach((protocol) => {
      const regCommands = [
        `REG ADD "HKCU\\Software\\Classes\\${protocol}" /v "URL Protocol" /t REG_SZ /d "" /f`,
        `REG ADD "HKCU\\Software\\Classes\\${protocol}\\shell\\open\\command" /ve /t REG_SZ /d "\\"${vscodePath}\\" --open-url -- \\"%1\\"" /f`,
      ];

      regCommands.forEach((cmd) => {
        execSync(cmd);
      });
    });
  }
}

try {
  registerProtocol();
  console.log("\nProtocol registration completed");
} catch (error) {
  console.error("\nFailed to register protocol:", error);

  if (os.platform() === "linux") {
    console.log("\nOn Linux, you may need to install required packages:");
    console.log("sudo apt-get install desktop-file-utils xdg-utils");
    console.log("- or -");
    console.log("sudo dnf install desktop-file-utils xdg-utils");
  }
}
