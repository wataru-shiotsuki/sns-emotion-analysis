const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

for (const [directory, legacyKey] of [
    ['disaster_sns_analyzer', 'gemini_api_key'],
    ['soccer_sns_analyzer', 'soccer_gemini_api_key']
]) {
    test(`${directory}: APIキーはメモリだけに保持する`, () => {
        const storage = new Map([[legacyKey, 'old-key']]);
        const localStorage = {
            getItem: key => storage.get(key) || null,
            setItem: (key, value) => storage.set(key, value),
            removeItem: key => storage.delete(key)
        };
        const source = fs.readFileSync(path.join(__dirname, '..', directory, 'gemini_api.js'), 'utf8');
        const loadPage = () => {
            const context = vm.createContext({ localStorage, window: {} });
            vm.runInContext(source, context);
            return vm.runInContext('GeminiAnalyzer', context);
        };

        const analyzer = loadPage();
        assert.equal(storage.has(legacyKey), false);
        assert.equal(analyzer.getApiKey(), '');
        analyzer.setApiKey('temporary-key');
        assert.equal(analyzer.getApiKey(), 'temporary-key');
        assert.equal(storage.has(legacyKey), false);
        assert.equal(loadPage().getApiKey(), '');
    });
}
