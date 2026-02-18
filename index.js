const { default: makeWASocket, useMultiFileAuthState, downloadMediaMessage } = require("@whiskeysockets/baileys")
const qrcode = require("qrcode-terminal")

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("auth")
    const sock = makeWASocket({ auth: state })

    sock.ev.on("connection.update", (update) => {
        const { qr } = update
        if (qr) qrcode.generate(qr, { small: true })
    })

    sock.ev.on("creds.update", saveCreds)

    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0]
        if (!msg.message) return

        const text = msg.message.conversation || msg.message.extendedTextMessage?.text

        // Sticker Random
        if (text === "sticker random") {
            const stickers = [
                "https://raw.githubusercontent.com/adiwajshing/Baileys/master/Media/ma_gif.webp",
                "https://raw.githubusercontent.com/adiwajshing/Baileys/master/Media/ma.webp"
            ]

            const random = stickers[Math.floor(Math.random() * stickers.length)]

            await sock.sendMessage(msg.key.remoteJid, {
                sticker: { url: random }
            })
        }

        // Auto gambar jadi stiker
        if (msg.message.imageMessage) {
            const buffer = await downloadMediaMessage(
                msg,
                "buffer",
                {},
                { logger: console }
            )

            await sock.sendMessage(msg.key.remoteJid, {
                sticker: buffer
            })
        }
    })
}

startBot()
