const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys")
const qrcode = require("qrcode-terminal")
const P = require("pino")

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("auth")
    const sock = makeWASocket({
        logger: P({ level: "silent" }),
        auth: state,
        browser: ["Bot Stiker", "Chrome", "1.0.0"]
    })

    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect, qr } = update

        if (qr) {
            console.log("Scan QR ini:")
            qrcode.generate(qr, { small: true })
        }

        if (connection === "close") {
            const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
            if (shouldReconnect) {
                startBot()
            }
        }

        if (connection === "open") {
            console.log("Bot berhasil connect ✅")
        }
    })

    sock.ev.on("creds.update", saveCreds)
}

startBot()
