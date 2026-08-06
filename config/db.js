const dns = require('node:dns');
const mongoose = require('mongoose');

const DNS_SERVERS = ['8.8.8.8', '1.1.1.1'];
const CONNECTION_OPTIONS = { serverSelectionTimeoutMS: 10_000 };

function validateMongoUri(uri) {
    if (!uri) throw new Error('Defina MONGO_URI no arquivo .env.');
    if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
        throw new Error('MONGO_URI deve iniciar com mongodb:// ou mongodb+srv://.');
    }
}

async function buildDirectUri(srvUri) {
    const source = new URL(srvUri);
    const resolver = new dns.promises.Resolver();
    resolver.setServers(DNS_SERVERS);

    const [srvRecords, txtRecords] = await Promise.all([
        resolver.resolveSrv(`_mongodb._tcp.${source.hostname}`),
        resolver.resolveTxt(source.hostname).catch(() => [])
    ]);

    if (!srvRecords.length) throw new Error('Nenhum nó MongoDB foi encontrado no DNS.');

    const credentials = source.username
        ? `${encodeURIComponent(decodeURIComponent(source.username))}:${encodeURIComponent(decodeURIComponent(source.password))}@`
        : '';
    const hosts = srvRecords.map(({ name, port }) => `${name}:${port}`).join(',');
    const options = new URLSearchParams(txtRecords.flat().join('&'));

    for (const [key, value] of source.searchParams) options.set(key, value);
    options.set('tls', 'true');
    options.set('retryWrites', options.get('retryWrites') || 'true');
    options.set('w', options.get('w') || 'majority');

    const database = source.pathname === '/' ? '/aplicacaomvc' : source.pathname;
    return `mongodb://${credentials}${hosts}${database}?${options}`;
}

async function connect(uri, mode) {
    await mongoose.connect(uri, CONNECTION_OPTIONS);
    console.log(`MongoDB conectado (${mode}): ${mongoose.connection.name}`);
}

async function connectDB() {
    const uri = process.env.MONGO_DIRECT_URI || process.env.MONGO_URI;
    validateMongoUri(uri);

    if (process.env.MONGO_DIRECT_URI || uri.startsWith('mongodb://')) {
        return connect(uri, 'URI direta');
    }

    try {
        return await connect(uri, 'DNS padrão');
    } catch (firstError) {
        await mongoose.disconnect().catch(() => {});
        console.warn(`DNS padrão indisponível (${firstError.code || 'erro de conexão'}). Tentando DNS público...`);

        try {
            return await connect(await buildDirectUri(uri), 'DNS público');
        } catch (fallbackError) {
            await mongoose.disconnect().catch(() => {});
            throw new Error(`Não foi possível conectar ao MongoDB: ${fallbackError.message}`);
        }
    }
}

module.exports = connectDB;
