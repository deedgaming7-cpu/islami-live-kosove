export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=1800');

    try {
        const response = await fetch('https://takvimi-ks.com');
        const html = await response.text();

        // Parse prayer times from the HTML
        // Structure: <div>PrayerName</div>\n<span class="text-muted">HH:MM</span>
        const times = {};

        const prayerPatterns = [
            { key: 'Imsaku', regex: /<div>Imsaku<\/div>\s*<span[^>]*>(\d{2}:\d{2})<\/span>/i },
            { key: 'LindjaEDiellit', regex: /<div>Lindja e diellit<\/div>\s*<span[^>]*>(\d{2}:\d{2})<\/span>/i },
            { key: 'Dreka', regex: /<div>Dreka<\/div>\s*<span[^>]*>(\d{2}:\d{2})<\/span>/i },
            { key: 'Ikindia', regex: /<div>Ikindia<\/div>\s*<span[^>]*>(\d{2}:\d{2})<\/span>/i },
            { key: 'Akshami', regex: /<div>Akshami<\/div>\s*<span[^>]*>(\d{2}:\d{2})<\/span>/i },
            { key: 'Jacia', regex: /<div>Jacia<\/div>\s*<span[^>]*>(\d{2}:\d{2})<\/span>/i },
        ];

        for (const p of prayerPatterns) {
            const match = html.match(p.regex);
            if (match) {
                times[p.key] = match[1];
            }
        }

        // Verify we got all core times
        const coreKeys = ['Imsaku', 'Dreka', 'Ikindia', 'Akshami', 'Jacia'];
        const missing = coreKeys.filter(k => !times[k]);

        if (missing.length > 0) {
            return res.status(502).json({
                error: 'Could not parse all prayer times from takvimi-ks.com',
                missing,
                partialTimes: times
            });
        }

        return res.status(200).json({
            source: 'takvimi-ks.com',
            date: new Date().toISOString().split('T')[0],
            times
        });

    } catch (error) {
        return res.status(500).json({
            error: 'Failed to fetch from takvimi-ks.com',
            message: error.message
        });
    }
}
