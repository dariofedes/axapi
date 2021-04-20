require('dotenv').config()
const { env: { PORT = 8080, API_URL }} = process

const express = require('express');


(() => {
    const app = express()

    app.get('/test', (_, res) => {
        res.status(200).send('Working')
    })

    app.listen(PORT, () =>
                console.log(`🚀 Server up and running at http://localhost:${PORT}`)
            );

    process.on('SIGINT', () => {
        console.log('🛑 server abruptly stopped')

        process.exit(0)
})
})()
