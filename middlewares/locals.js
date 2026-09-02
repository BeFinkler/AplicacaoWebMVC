function formatDateTime(value) {
    if (!value) return '';
    return new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
        timeZone: process.env.APP_TIMEZONE || 'America/Sao_Paulo'
    }).format(new Date(value));
}

function toInputDateTime(value) {
    if (!value) return '';
    const formatted = new Intl.DateTimeFormat('sv-SE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
        timeZone: process.env.APP_TIMEZONE || 'America/Sao_Paulo'
    }).format(new Date(value));
    return formatted.replace(' ', 'T');
}

function templateLocals(req, res, next) {
    res.locals.user = req.session?.user || null;
    res.locals.flash = req.session?.flash || null;
    res.locals.currentPath = req.path;
    res.locals.formatDateTime = formatDateTime;
    res.locals.toInputDateTime = toInputDateTime;
    if (req.session?.flash) delete req.session.flash;
    next();
}

function setFlash(req, type, message) {
    req.session.flash = { type, message };
}

module.exports = { formatDateTime, setFlash, templateLocals, toInputDateTime };
