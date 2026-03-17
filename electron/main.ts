import type { BrowserWindow as BWType } from "electron";
declare const require: any;
const { app, BrowserWindow } = require("electron");
import path from "path";
import fs from "fs";
import { type ChildProcess, fork } from "child_process";

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();

let serverProcess: ChildProcess | null = null;
let mainWindow: BWType | null = null;

if (!gotTheLock) {
    app.quit();
} else {
    app.on("second-instance", () => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });

    app.whenReady().then(createWindow);

    app.on("window-all-closed", () => {
        if (process.platform !== "darwin") {
            app.quit();
        }
    });

    app.on("will-quit", () => {
        if (serverProcess) {
            serverProcess.kill();
        }
    });
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        title: "Armor & Light",
        show: false, // Don't show until content is loaded
        backgroundColor: "#12151A", // hsl(220 15% 8%) to prevent white flash
        icon: path.join(__dirname, "..", "client", "public", "icon.png"),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        }
    });


    mainWindow?.once("ready-to-show", () => {
        if (!mainWindow) return;
        // Start completely invisible at the native OS level
        mainWindow.setOpacity(0);
        mainWindow.show();

        // Fade in the dark initial loading screen natively over 150ms
        let opacity = 0;
        const interval = 10;
        const duration = 150;
        const step = 1 / (duration / interval);

        const timer = setInterval(() => {
            if (!mainWindow || mainWindow.isDestroyed()) {
                clearInterval(timer);
                return;
            }
            opacity += step;
            if (opacity >= 1) {
                mainWindow.setOpacity(1);
                clearInterval(timer);
            } else {
                mainWindow.setOpacity(opacity);
            }
        }, interval);
    });

    // ─── CRITICAL FLASH FIX: Immediately load a black data payload so about:blank never renders ───
    mainWindow?.loadURL(`data:text/html;charset=utf-8,<html><head><style>body { background-color: #12151A; margin: 0; overflow: hidden; }</style></head><body></body></html>`);

    const logPath = path.join(app.getPath("userData"), "server.log");
    // Truncate (overwrite) the log each launch to prevent unbounded growth
    const logStream = fs.createWriteStream(logPath, { flags: 'w' });

    mainWindow?.webContents.on('console-message', (event, level, message, line, sourceId) => {
        const levels = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
        const levelStr = levels[level] || 'INFO';
        const logLine = `[Frontend ${levelStr}] ${message} (${sourceId}:${line})\n`;
        console.log(logLine.trim());
        if (logStream) {
            logStream.write(logLine);
        }
    });



    mainWindow?.on("closed", () => {
        mainWindow = null;
    });

    // ─── 2. Start the Express server as a child process ───
    const scriptPath = path.join(process.resourcesPath, "app.asar.unpacked", "dist", "start.cjs");
    const devScriptPath = path.join(__dirname, "..", "dist", "start.cjs");
    const finalScriptPath = app.isPackaged ? scriptPath : devScriptPath;

    console.log("[Main] Starting server from:", finalScriptPath);


    serverProcess = fork(finalScriptPath, [], {
        env: {
            ...process.env,
            ELECTRON_RUN: "true",
            RESOURCES_PATH: process.resourcesPath
        },
        stdio: ["ignore", "pipe", "pipe", "ipc"]
    });

    serverProcess.stdout?.pipe(logStream);
    serverProcess.stderr?.pipe(logStream);

    // ─── 3. Capture port and load URL into the already-created window ───
    let serverPort: string | null = null;

    serverProcess.stdout?.on('data', (data) => {
        const output = data.toString();
        const portMatch = output.match(/SERVER_PORT:(\d+)/);
        if (portMatch && !serverPort) {
            serverPort = portMatch[1];
            console.log(`[Main] Server started on port ${serverPort}`);
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.loadURL(`http://localhost:${serverPort}`);

                // Wait until the React app has actually finished loading and rendering its own dark theme
                mainWindow.webContents.once('did-finish-load', () => {
                    // Inject a soft crossfade to mask the transition from the black dummy payload to the React DOM
                    mainWindow?.webContents.insertCSS(`
                        body {
                            animation: reactContentFadeIn 0.4s ease-out forwards;
                            opacity: 0;
                        }
                        @keyframes reactContentFadeIn {
                            from { opacity: 0; }
                            to { opacity: 1; }
                        }
                    `);
                });
            }
        }
    });

    if (serverProcess) {
        serverProcess.on('error', (err: any) => {
            console.error("[Main] Server process error:", err.message);
            logStream.write(`Server Process Error: ${err.message}\n`);
            // Show error in window
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.loadURL(`data:text/html,<html><body style="font-family:sans-serif;padding:40px;background:#1a1a2e;color:#eee"><h1>⚠️ Server Error</h1><p>${err.message}</p><p>Check the log at:<br><code>${logPath}</code></p></body></html>`);
                mainWindow.show();
            }
        });

        serverProcess.on('exit', (code: any, signal: any) => {
            logStream.write(`Server Process Exited with code ${code} and signal ${signal}\n`);
            // If the server exits before a port was captured, show an error
            if (!serverPort && mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.loadURL(`data:text/html,<html><body style="font-family:sans-serif;padding:40px;background:#1a1a2e;color:#eee"><h1>⚠️ Server Failed to Start</h1><p>Exit code: ${code}</p><p>Check the log at:<br><code>${logPath}</code></p></body></html>`);
                mainWindow.show();
            }
        });
    }
}
