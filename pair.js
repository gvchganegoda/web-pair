router.get('/', async (req, res) => {
    let num = req.query.number;
    if (!num || !/^\d{6,15}$/.test(num)) {
        return res.status(400).json({ error: "Invalid number" });
    }

    async function GV_BudPair() {
        const { state, saveCreds } = await useMultiFileAuthState(`./session`);
        try {
            let GV_BudPairWeb = makeWASocket({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
                },
                printQRInTerminal: false,
                logger: pino({ level: "fatal" }).child({ level: "fatal" }),
                browser: Browsers.macOS("Safari"),
            });

            if (!GV_BudPairWeb.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, '');
                const code = await GV_BudPairWeb.requestPairingCode(num);
                if (!res.headersSent) res.send({ code });
            }

            GV_BudPairWeb.ev.on('creds.update', saveCreds);
            // …connection.update handler…
        } catch (err) {
            console.error("Service error", err);
            if (!res.headersSent) res.status(503).send({ code: "Service Unavailable" });
        }
    }

    return await GV_BudPair();
});
