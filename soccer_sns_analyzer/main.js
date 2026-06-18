document.addEventListener('DOMContentLoaded', () => {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const fileList = document.getElementById('fileList');
    const uploadSection = document.getElementById('uploadSection');
    const analysisSection = document.getElementById('analysisSection');
    const progressContainer = document.getElementById('progressContainer');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const matchDateInput = document.getElementById('matchDate');
    const kickoffTimeInput = document.getElementById('kickoffTime');
    const matchTitleInput = document.getElementById('matchTitle');
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const closeModal = document.getElementById('closeModal');
    const apiKeyInput = document.getElementById('apiKey');
    const saveSettingsBtn = document.getElementById('saveSettings');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const phaseLegend = document.getElementById('phaseLegend');
    const htGuidance = document.getElementById('htGuidance');
    const endGuidance = document.getElementById('endGuidance');
    const broadcastContent = document.getElementById('broadcastContent');
    const conversionLog = document.getElementById('conversionLog');
    const dataTableBody = document.getElementById('dataTableBody');
    const dataCount = document.getElementById('dataCount');
    const phaseStats = document.getElementById('phaseStats');
    const exportBtn = document.getElementById('exportBtn');
    const exportHtmlBtn = document.getElementById('exportHtmlBtn');
    const saveResultBtn = document.getElementById('saveResultBtn');
    const saveModal = document.getElementById('saveModal');
    const closeSaveModal = document.getElementById('closeSaveModal');
    const analysisNameInput = document.getElementById('analysisName');
    const saveToFileCheckbox = document.getElementById('saveToFile');
    const confirmSaveBtn = document.getElementById('confirmSave');
    const historyBtn = document.getElementById('historyBtn');
    const historyModal = document.getElementById('historyModal');
    const closeHistoryModal = document.getElementById('closeHistoryModal');
    const historyList = document.getElementById('historyList');
    const clearAllHistory = document.getElementById('clearAllHistory');
    const textDetailModal = document.getElementById('textDetailModal');
    const closeTextModal = document.getElementById('closeTextModal');
    let analyzedData = [];
    let phases = {};
    let selectedFiles = [];
    let stackedBarChart = null;
    let lineChart = null;
    let opinionStackedChart = null;
    let opinionLineChart = null;
    let cachedAllPosts = []; 
    const HistoryDB = {
        dbName: 'soccer_analysis_db',
        storeName: 'history',
        version: 1,
        async open() {
            return new Promise((resolve, reject) => {
                const request = indexedDB.open(this.dbName, this.version);
                request.onupgradeneeded = (e) => {
                    const db = e.target.result;
                    if (!db.objectStoreNames.contains(this.storeName)) {
                        db.createObjectStore(this.storeName, { keyPath: 'id' });
                    }
                };
                request.onsuccess = (e) => resolve(e.target.result);
                request.onerror = (e) => reject(e.target.error);
            });
        },
        async getAll() {
            const db = await this.open();
            return new Promise((resolve, reject) => {
                const tx = db.transaction(this.storeName, 'readonly');
                const store = tx.objectStore(this.storeName);
                const request = store.getAll();
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        },
        async get(id) {
            const db = await this.open();
            return new Promise((resolve, reject) => {
                const tx = db.transaction(this.storeName, 'readonly');
                const store = tx.objectStore(this.storeName);
                const request = store.get(id);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        },
        async save(item) {
            const db = await this.open();
            return new Promise((resolve, reject) => {
                const tx = db.transaction(this.storeName, 'readwrite');
                const store = tx.objectStore(this.storeName);
                const request = store.put(item);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        },
        async delete(id) {
            const db = await this.open();
            return new Promise((resolve, reject) => {
                const tx = db.transaction(this.storeName, 'readwrite');
                const store = tx.objectStore(this.storeName);
                const request = store.delete(id);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        },
        async clear() {
            const db = await this.open();
            return new Promise((resolve, reject) => {
                const tx = db.transaction(this.storeName, 'readwrite');
                const store = tx.objectStore(this.storeName);
                const request = store.clear();
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        }
    };
    apiKeyInput.value = GeminiAnalyzer.getApiKey();
    matchDateInput.value = new Date().toISOString().split('T')[0];
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    fileInput.addEventListener('change', handleFileSelect);
    settingsBtn.addEventListener('click', () => settingsModal.classList.remove('hidden'));
    closeModal.addEventListener('click', () => settingsModal.classList.add('hidden'));
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) settingsModal.classList.add('hidden');
    });
    saveSettingsBtn.addEventListener('click', saveSettings);
    tabBtns.forEach(btn => btn.addEventListener('click', handleTabClick));
    if (exportBtn) exportBtn.addEventListener('click', exportData);
    if (exportHtmlBtn) exportHtmlBtn.addEventListener('click', exportHtmlReport);
    saveResultBtn.addEventListener('click', () => {
        if (analyzedData.length === 0) {
            alert('保存する分析結果がありません。');
            return;
        }
        analysisNameInput.value = matchTitleInput.value || `サッカー分析_${new Date().toLocaleDateString('ja-JP')}`;
        saveModal.classList.remove('hidden');
    });
    closeSaveModal.addEventListener('click', () => saveModal.classList.add('hidden'));
    saveModal.addEventListener('click', (e) => {
        if (e.target === saveModal) saveModal.classList.add('hidden');
    });
    confirmSaveBtn.addEventListener('click', confirmSaveAnalysis);
    historyBtn.addEventListener('click', openHistoryModal);
    closeHistoryModal.addEventListener('click', () => historyModal.classList.add('hidden'));
    historyModal.addEventListener('click', (e) => {
        if (e.target === historyModal) historyModal.classList.add('hidden');
    });
    clearAllHistory.addEventListener('click', async () => {
        if (confirm('すべての履歴を削除しますか？')) {
            await HistoryDB.clear();
            renderHistoryList();
        }
    });
    if (closeTextModal) closeTextModal.addEventListener('click', () => textDetailModal.classList.add('hidden'));
    if (textDetailModal) textDetailModal.addEventListener('click', (e) => {
        if (e.target === textDetailModal) textDetailModal.classList.add('hidden');
    });
    function handleDragOver(e) {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    }
    function handleDragLeave(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
    }
    function handleDrop(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const files = Array.from(e.dataTransfer.files).filter(f => f.name.endsWith('.csv'));
        if (files.length > 0) {
            selectedFiles = files;
            updateFileList();
            processFiles(files);
        } else {
            alert('CSVファイルをアップロードしてください。');
        }
    }
    function handleFileSelect(e) {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            selectedFiles = files;
            updateFileList();
            processFiles(files);
        }
    }
    function updateFileList() {
        fileList.innerHTML = selectedFiles.map(file => `
            <div class="file-list-item">
                <span class="file-name">📄 ${file.name}</span>
                <span class="file-size">${formatFileSize(file.size)}</span>
            </div>
        `).join('');
    }
    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
    async function parseCSVFile(file) {
        return new Promise((resolve, reject) => {
            Papa.parse(file, {
                complete: (results) => {
                    const posts = [];
                    const rows = results.data;
                    for (let i = 1; i < rows.length; i++) {
                        const row = rows[i];
                        if (row.length < 3) continue;
                        const datetime = row[1];
                        const text = row[2];
                        if (!datetime || !text) continue;
                        if (text.length < 3) continue;
                        posts.push({
                            datetime: datetime,
                            text: text.trim(),
                            sourceFile: file.name
                        });
                    }
                    resolve(posts);
                },
                error: reject
            });
        });
    }
    async function processFiles(files) {
        showProgress();
        updateProgress(5, 'CSVファイルを読み込み中...');
        try {
            const allPosts = [];
            for (let i = 0; i < files.length; i++) {
                updateProgress(5 + (i / files.length) * 10, `ファイル ${i + 1}/${files.length} を読み込み中...`);
                const posts = await parseCSVFile(files[i]);
                allPosts.push(...posts);
            }
            if (allPosts.length === 0) {
                alert('有効なデータが見つかりませんでした。');
                hideProgress();
                return;
            }
            cachedAllPosts = [...allPosts];
            if (cachedAllPosts.length > 0) {
                try {
                    const firstDate = new Date(cachedAllPosts[0].datetime);
                    if (!isNaN(firstDate.getTime())) {
                        matchDateInput.value = firstDate.toISOString().split('T')[0];
                        const hours = String(firstDate.getHours()).padStart(2, '0');
                        kickoffTimeInput.value = `${hours}:00`;
                    }
                } catch (e) {
                }
            }
            updateProgress(15, `${allPosts.length}件の投稿を検出 (日時: ${matchDateInput.value} ${kickoffTimeInput.value})...`);
            const apiKey = GeminiAnalyzer.getApiKey();
            if (!apiKey) {
                alert('Gemini APIキーが設定されていません。');
                hideProgress();
                settingsModal.classList.remove('hidden');
                return;
            }
            analyzedData = await GeminiAnalyzer.analyzeEmotions(allPosts, updateProgress);
            updateProgress(75, '時間区分に分割中...');
            const matchDate = matchDateInput.value;
            const kickoffTime = kickoffTimeInput.value;
            const kickoffDatetime = new Date(`${matchDate}T${kickoffTime}:00`);
            phases = GeminiAnalyzer.splitIntoSixPhases(analyzedData, kickoffDatetime);
            Object.entries(phases).forEach(([key, phase]) => {
                phase.posts.forEach(post => {
                    post.phase = phase.name;
                    post.phaseKey = key;
                });
            });
            updateProgress(80, 'グラフを生成中...');
            showResults();
            renderCharts();
            renderPhaseLegend();
            renderPhaseStats();
            const totalPosts = analyzedData.length;
            const dataCountEl = document.getElementById('dataCount');
            if (dataCountEl) {
                dataCountEl.textContent = `${totalPosts}件`;
            }
            updateProgress(85, '行動方針を生成中...');
            const broadcastResult = await GeminiAnalyzer.generateBroadcastScript(phases, apiKey);
            formatBroadcastContent(broadcastResult);
            displayGuidance(broadcastResult);
            updateProgress(100, '完了！');
            setTimeout(() => {
                hideProgress();
            }, 500);
        } catch (error) {
            alert(`エラー: ${error.message}`);
            hideProgress();
        }
    }
    const regenerateGuidanceBtn = document.getElementById('regenerateGuidanceBtn');
    if (regenerateGuidanceBtn) {
        regenerateGuidanceBtn.addEventListener('click', async () => {
            if (Object.keys(phases).length === 0) {
                alert('データがありません。\nページをリロードした場合は分析データが消去されています。\nもう一度CSVファイルをアップロードして分析を行ってください。');
                return;
            }
            if (!confirm('行動方針を作り直しますか？\n※AIが新しい提案を生成します')) {
                return;
            }
            try {
                const apiKey = apiKeyInput.value.trim();
                if (!apiKey) {
                    alert('APIキーが設定されていません。');
                    return;
                }
                showProgress();
                updateProgress(30, '行動方針を再生成中...');
                const guidanceResult = await GeminiAnalyzer.generateActionGuidelinesOnly(phases, apiKey);
                updateProgress(80, '表示を更新中...');
                displayGuidance(guidanceResult);
                updateProgress(100, '行動方針の再生成完了！');
                setTimeout(hideProgress, 500);
            } catch (error) {
                alert(`再生成エラー: ${error.message}`);
                hideProgress();
            }
        });
    }
    const regenerateBroadcastBtn = document.getElementById('regenerateBroadcastBtn');
    if (regenerateBroadcastBtn) {
        regenerateBroadcastBtn.addEventListener('click', async () => {
            if (Object.keys(phases).length === 0) {
                alert('データがありません。\nページをリロードした場合は分析データが消去されています。\nもう一度CSVファイルをアップロードして分析を行ってください。');
                return;
            }
            if (!confirm('放送原稿を作り直しますか？\n※AIが新しい表現を提案します')) {
                return;
            }
            try {
                const apiKey = apiKeyInput.value.trim();
                if (!apiKey) {
                    alert('APIキーが設定されていません。');
                    return;
                }
                showProgress();
                updateProgress(10, '放送原稿を再生成中...');
                const broadcastResult = await GeminiAnalyzer.generateBroadcastScriptOnly(phases, apiKey);
                formatBroadcastContent(broadcastResult);
                updateProgress(100, '放送原稿の再生成完了！');
                setTimeout(hideProgress, 500);
            } catch (error) {
                alert(`再生成エラー: ${error.message}`);
                hideProgress();
            }
        });
    }
    const regenerateAnalysisBtn = document.getElementById('regenerateAnalysisBtn');
    if (regenerateAnalysisBtn) {
        regenerateAnalysisBtn.addEventListener('click', async () => {
            let targetPosts = (cachedAllPosts.length > 0) ? cachedAllPosts : analyzedData;
            if (!targetPosts || targetPosts.length === 0) {
                alert('再分析するデータがありません。\nCSVファイルをアップロードしてください。');
                return;
            }
            const mode = confirm('【重要】分析モードを選択してください。\n\n[OK] = 意見カテゴリのみ再分析（既存の感情分析は維持・高速）\n[キャンセル] = すべて再分析（感情も含めて最初からやり直す）') ? 'OPINION_ONLY' : 'FULL';
            if (mode === 'FULL' && !confirm('本当にすべての分析をやり直しますか？\n現在の結果は上書きされます。')) {
                return;
            }
            try {
                const apiKey = apiKeyInput.value.trim();
                if (!apiKey) {
                    alert('APIキーが設定されていません。');
                    return;
                }
                const currentMatchDate = matchDateInput.value;
                const currentKickoffTime = kickoffTimeInput.value;
                const userInput = prompt("試合日時を設定してください (YYYY-MM-DD HH:MM)", `2025-10-14 19:30`);
                if (userInput === null) return; 
                const [newDate, newTime] = userInput.trim().split(/\s+/);
                if (!newDate || !newTime) {
                    alert("正しい形式で入力してください (例: 2025-10-14 14:00)");
                    return;
                }
                matchDateInput.value = newDate;
                kickoffTimeInput.value = newTime;
                showProgress();
                if (mode === 'OPINION_ONLY') {
                    updateProgress(10, '意見カテゴリのみ再分析を開始...');
                    analyzedData = await GeminiAnalyzer.analyzeOpinionsOnly(targetPosts, updateProgress);
                } else {
                    updateProgress(10, 'すべての分析を再実行中...');
                    analyzedData = await GeminiAnalyzer.analyzeEmotions(targetPosts, updateProgress);
                }
                updateProgress(75, '時間区分に再分割中...');
                const matchDate = matchDateInput.value;
                const kickoffTime = kickoffTimeInput.value;
                const kickoffDatetime = new Date(`${matchDate}T${kickoffTime}:00`);
                phases = GeminiAnalyzer.splitIntoSixPhases(analyzedData, kickoffDatetime);
                Object.entries(phases).forEach(([key, phase]) => {
                    phase.posts.forEach(post => {
                        post.phase = phase.name;
                        post.phaseKey = key;
                    });
                });
                updateProgress(80, 'グラフを再生成中...');
                showResults();
                renderCharts();
                renderPhaseLegend();
                renderPhaseStats();
                renderDataTable(); 
                const totalPosts = analyzedData.length;
                const dataCountEl = document.getElementById('dataCount');
                if (dataCountEl) {
                    dataCountEl.textContent = `${totalPosts}件`;
                }
                updateProgress(85, '行動方針・放送原稿を再生成中...');
                const broadcastResult = await GeminiAnalyzer.generateBroadcastScript(phases, apiKey);
                updateProgress(95, '表示を更新中...');
                formatBroadcastContent(broadcastResult);
                displayGuidance(broadcastResult);
                updateProgress(100, mode === 'OPINION_ONLY' ? '意見カテゴリと原稿の更新完了！' : '全分析と原稿の再実行完了！');
                setTimeout(hideProgress, 500);
            } catch (error) {
                alert(`再分析エラー: ${error.message}`);
                hideProgress();
            }
        });
    }
    function formatGuidance(text) {
        let html = text
            .replace(/^### (.+)$/gm, '<h3>$1</h3>')
            .replace(/^## (.+)$/gm, '<h2>$1</h2>')
            .replace(/^# (.+)$/gm, '<h1>$1</h1>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/^[・\-\*] (.+)$/gm, '<li>$1</li>')
            .replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>')
            .split('\n')
            .map(line => line.trim())
            .filter(line => line)
            .join('\n');
        html = html.replace(/(<li>.+<\/li>\n?)+/g, '<ul>$&</ul>');
        return html;
    }
    function displayGuidance(content) {
        const container = document.getElementById('guidanceContainer');
        if (!container) return;
        let data;
        try {
            let jsonStr = content;
            const mdMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
            if (mdMatch) {
                jsonStr = mdMatch[1];
            } else {
                const firstBrace = jsonStr.indexOf('{');
                const lastBrace = jsonStr.lastIndexOf('}');
                if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                    jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
                }
            }
            let sanitized = jsonStr
                .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, "")
                .replace(/(?<!\\)\\n/g, '\\n'); 
            data = JSON.parse(sanitized);
        } catch (e) {
            const extractField = (fieldName, nextKeys) => {
                let regex = new RegExp(`"${fieldName}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`, 's');
                let match = content.match(regex);
                if (match) return match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
                const nextKeyPattern = nextKeys.length > 0 ? `(?:"${nextKeys.join('"|"')}")` : "$";
                regex = new RegExp(`"${fieldName}"\\s*:\\s*"(.*?)"\\s*(?:,|})\\s*(?=${nextKeyPattern}|"actionGuidelines"|})`, 's');
                match = content.match(regex);
                if (match) return match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
                return null;
            };
            const commentators = extractField('commentators', ['director', 'reporter', 'digital']);
            const director = extractField('director', ['reporter', 'digital']);
            const reporter = extractField('reporter', ['digital']);
            const digital = extractField('digital', []);
            if (commentators || director || reporter || digital) {
                data = {
                    actionGuidelines: {
                        commentators: commentators || '',
                        director: director || '',
                        reporter: reporter || '',
                        digital: digital || ''
                    }
                };
            } else {
                container.innerHTML = '<div class="placeholder">行動方針の解析に失敗しました。</div>';
                return;
            }
        }
        if (!data.actionGuidelines) {
            container.innerHTML = '<div class="placeholder">行動方針データがありません。</div>';
            return;
        }
        const ag = data.actionGuidelines;
        const roles = [
            { icon: '🎙️', name: '実況・解説者', subtitle: '解説ポイント', content: ag.commentators || '' },
            { icon: '🎬', name: 'ディレクター', subtitle: '撮影・演出', content: ag.director || '' },
            { icon: '🎤', name: 'リポーター', subtitle: 'インタビュー', content: ag.reporter || '' },
            { icon: '📱', name: 'デジタル', subtitle: 'SNS/動画', content: ag.digital || '' }
        ];
        const formatContent = (text) => {
            if (!text) return '<p class="no-data">指示なし</p>';
            let html = text
                .replace(/\\n/g, '\n')
                .replace(/^##\s+(\d+)\.\s*(.+)$/gm, '<h3 class="guide-main-header"><span class="header-num">$1.</span> $2</h3>')
                .replace(/【アクション】(.+?)(?=\\n|$)/g, '<div class="guide-action-box"><strong>【アクション】</strong>$1</div>')
                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                .replace(/^\s*>\s*(.+)$/gm, '<blockquote class="guide-quote-block">$1</blockquote>')
                .replace(/^▶\s*(.+)$/gm, '<div class="guide-section-header">▶ $1</div>')
                .replace(/^[•・]\s*(.+)$/gm, '<li class="guide-bullet">$1</li>')
                .replace(/^\s*-\s+(.+)$/gm, '<li class="guide-sub-bullet">$1</li>')
                .replace(/^(\d+)\.\s*【(.+?)】(.*)$/gm, '<div class="guide-numbered-item"><span class="num-badge">$1</span><strong>【$2】</strong>$3</div>')
                .replace(/《(.+?)》/g, '<span class="highlight-title">《$1》</span>')
                .replace(/'([^']+)'/g, '<span class="sns-quote">\'$1\'</span>')
                .replace(/\n+/g, '<br>');
            html = html.replace(/(<li class="guide-bullet">.*?<\/li>)+/g, '<ul class="guide-list">$&</ul>');
            html = html.replace(/(<li class="guide-sub-bullet">.*?<\/li>)+/g, '<ul class="guide-sub-list">$&</ul>');
            return '<div class="guide-paragraph">' + html + '</div>';
        };
        const cardsHtml = roles.map((role, i) => `
            <div class="guideline-card-compact">
                <div class="guideline-header-compact">
                    <span class="header-icon">${role.icon}</span>
                    <span class="header-name">${role.name}</span>
                    <span class="header-subtitle">${role.subtitle}</span>
                </div>
                <div class="guideline-body-compact">
                    ${formatContent(role.content)}
                </div>
            </div>
        `).join('');
        container.innerHTML = `<div class="guideline-grid-container">${cardsHtml}</div>`;
    }
    function formatBroadcastContent(content) {
        if (!content) return '';
        const broadcastContent = document.getElementById('broadcastContent');
        const logContainer = document.getElementById('conversionLog');
        let data;
        let jsonStr = content;
        try {
            const mdMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
            if (mdMatch) {
                jsonStr = mdMatch[1];
            } else {
                const firstBrace = jsonStr.indexOf('{');
                const lastBrace = jsonStr.lastIndexOf('}');
                if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                    jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
                }
            }
            let sanitized = jsonStr
                .replace(/「"([^"]+)"」/g, "「'$1'」")
                .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, "")
                .replace(/(?<!\\)\\n/g, '\\n');
            data = JSON.parse(sanitized);
        } catch (e) {
            let recovered = false;
            try {
                const extractField = (fieldName, nextKeys) => {
                    let regex = new RegExp(`"${fieldName}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`, 's');
                    let match = content.match(regex);
                    if (match) return match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
                    const nextKeyPattern = nextKeys.length > 0 ? `(?:"${nextKeys.join('"|"')}")` : "$";
                    regex = new RegExp(`"${fieldName}"\\s*:\\s*"(.*?)"\\s*(?:,|})\\s*(?=${nextKeyPattern}|"actionGuidelines"|})`, 's');
                    match = content.match(regex);
                    if (match) return match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
                    return null;
                };
                const commentators = extractField('commentators', ['director', 'reporter', 'digital']);
                const director = extractField('director', ['reporter', 'digital']);
                const reporter = extractField('reporter', ['digital']);
                const digital = extractField('digital', []);
                if (commentators || director || reporter || digital) {
                    data = {
                        actionGuidelines: {
                            commentators: commentators || '',
                            director: director || '',
                            reporter: reporter || '',
                            digital: digital || ''
                        }
                    };
                    const scriptMatch = content.match(/"script"\s*:\s*"((?:[^"\\]|\\.)*)"/s);
                    if (scriptMatch) {
                        data.script = scriptMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
                    }
                    const conversionsMatch = content.match(/"conversions"\s*:\s*\[([\s\S]*?)\](?=\s*,?\s*"actionGuidelines"|$)/);
                    if (conversionsMatch) {
                        try {
                            const conversionsStr = '[' + conversionsMatch[1] + ']';
                            data.conversions = JSON.parse(conversionsStr);
                        } catch (convErr) {
                            try {
                                const objMatches = [...content.matchAll(/\{\s*"original"\s*:\s*"([^"]*)"\s*,\s*"converted"\s*:\s*"([^"]*)"\s*,\s*"reason"\s*:\s*"([^"]*)"\s*,\s*"source"\s*:\s*"([^"]*)"\s*\}/g)];
                                if (objMatches.length > 0) {
                                    data.conversions = objMatches.map(m => ({
                                        original: m[1],
                                        converted: m[2],
                                        reason: m[3],
                                        source: m[4]
                                    }));
                                } else {
                                    data.conversions = [];
                                }
                            } catch (e2) {
                                data.conversions = [];
                            }
                        }
                    } else {
                        data.conversions = [];
                    }
                    recovered = true;
                }
            } catch (err) {
            }
            if (!recovered) {
                const safeText = (content || '')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/\\n/g, '<br>')
                    .replace(/\n/g, '<br>');
                if (broadcastContent) {
                    broadcastContent.innerHTML = `<div class="broadcast-text">${safeText}</div>`;
                }
                return;
            }
        }
        if (data.script) {
            if (broadcastContent) broadcastContent.innerHTML = `<div class="broadcast-text">${data.script.replace(/\n/g, '<br>')}</div>`;
        }
        if (data.conversions && Array.isArray(data.conversions) && logContainer) {
            const logHtml = data.conversions.map(item => `
                <div class="conversion-item">
                    <div class="conversion-content">
                        <div class="conversion-box sns-box">
                            <div class="box-label"><span class="icon">×</span> SNS表現</div>
                            <div class="box-text">${item.original}</div>
                        </div>
                        <div class="conversion-arrow">→</div>
                        <div class="conversion-box broadcast-box">
                            <div class="box-label"><span class="icon">✅</span> 放送表現</div>
                            <div class="box-text">${item.transformed || item.converted}</div>
                        </div>
                    </div>
                    ${item.reason ? (() => {
                    let badgeClass = 'reason-badge';
                    let badgeLabel = item.source || '放送基準';
                    if (item.source && (item.source.includes('資料A') || item.source.includes('放送倫理'))) {
                        badgeClass += ' badge-type-a';
                    } else if (item.source && (item.source.includes('資料B') || item.source.includes('民放連') || item.source.includes('報道指針') || item.source.includes('放送基準'))) {
                        badgeClass += ' badge-type-b';
                    }
                    return `<div class="conversion-reason"><span class="${badgeClass}">${badgeLabel}</span><span class="reason-text">${item.reason}</span></div>`;
                })() : ''}
                </div>
            `).join('');
            logContainer.innerHTML = logHtml;
        } else if (logContainer) {
            logContainer.innerHTML = '<div class="placeholder">変換ログはありません</div>';
        }
        const guidelinesContainer = document.getElementById('actionGuidelines');
        if (data.actionGuidelines && guidelinesContainer) {
            const ag = data.actionGuidelines;
            const roles = [
                { icon: '🎙️', name: '実況・解説者', subtitle: '解説ポイント', content: ag.commentators || '' },
                { icon: '🎬', name: 'ディレクター', subtitle: '撮影・演出', content: ag.director || '' },
                { icon: '🎤', name: 'リポーター', subtitle: 'インタビュー', content: ag.reporter || '' },
                { icon: '📱', name: 'デジタル', subtitle: 'SNS/動画', content: ag.digital || '' }
            ];
            const formatContent = (text) => {
                if (!text) return '<p class="no-data">指示なし</p>';
                let html = text
                    .replace(/\\n/g, '\n')
                    .replace(/^"(.+)"$/gm, '<div class="guide-quote">"$1"</div>')
                    .replace(/^▶\s*(.+)$/gm, '<div class="guide-subheader">▶ $1</div>')
                    .replace(/^■\s*(.+?)：?$/gm, '<div class="guide-item-header">■ $1</div>')
                    .replace(/^[•・]\s*(.+?)：$/gm, '<li class="guide-bullet"><strong>$1：</strong></li>')
                    .replace(/^[•・]\s*(.+)$/gm, '<li class="guide-bullet">$1</li>')
                    .replace(/^[○◯]\s*(.+)$/gm, '<li class="guide-sub-bullet">$1</li>')
                    .replace(/^(\d+)\.\s*【(.+?)】$/gm, '<div class="guide-numbered"><span class="num">$1.</span><strong>$2</strong></div>')
                    .replace(/^(\d+)\.\s*(.+)$/gm, '<div class="guide-numbered"><span class="num">$1.</span>$2</div>')
                    .replace(/《(.+?)》/g, '<strong class="highlight-title">《$1》</strong>')
                    .replace(/「(.+?)」/g, '<span class="guide-inline-quote">「$1」</span>')
                    .replace(/\n(?=<div|<li)/g, '')
                    .replace(/(<\/div>|<\/li>)\n/g, '$1')
                    .replace(/\n+/g, '<br>');
                html = html.replace(/(<li class="guide-bullet">.*?<\/li>)+/g, '<ul class="guide-list">$&</ul>');
                html = html.replace(/(<li class="guide-sub-bullet">.*?<\/li>)+/g, '<ul class="guide-sub-list">$&</ul>');
                return '<div class="guide-paragraph">' + html + '</div>';
            };
            const cardsHtml = roles.map((role, i) => `
                <div class="guideline-card-compact">
                    <div class="guideline-header-compact">
                        <span class="header-icon">${role.icon}</span>
                        <span class="header-name">${role.name}</span>
                        <span class="header-subtitle">${role.subtitle}</span>
                    </div>
                    <div class="guideline-body-compact">
                        ${formatContent(role.content)}
                    </div>
                </div>
            `).join('');
            guidelinesContainer.innerHTML = `<div class="guideline-grid-container">${cardsHtml}</div>`;
        }
    }
    function renderCharts() {
        const stack1 = document.getElementById('emotionStackedChart');
        const stack2 = document.getElementById('opinionStackedChart');
        if (stack1) stack1.parentElement.style.display = 'none';
        if (stack2) stack2.parentElement.style.display = 'none';
        renderLineChart();
        renderOpinionLineChart();
    }
    function renderStackedBarChart() {
    }
    function renderLineChart() {
        const ctx = document.getElementById('emotionLineChart').getContext('2d');
        document.getElementById('emotionLineChart').parentElement.style.display = 'block';
        if (lineChart) {
            lineChart.destroy();
        }
        const phaseKeys = ['PRE_MATCH', 'FIRST_HALF_1', 'FIRST_HALF_2', 'SECOND_HALF_1', 'SECOND_HALF_2', 'POST_MATCH'];
        const phaseLabels = phaseKeys.map(key => GeminiAnalyzer.PHASES[key].name);
        const topEmotions = ['EXCITEMENT', 'DISAPPOINTMENT', 'CRITICISM'];
        const datasets = topEmotions.map(emotionKey => {
            const emotionData = GeminiAnalyzer.EMOTIONS[emotionKey];
            const data = phaseKeys.map(phaseKey => {
                const phasePosts = phases[phaseKey]?.posts || [];
                const count = phasePosts.filter(p => p.emotion === emotionKey).length;
                const total = phasePosts.length || 1;
                return Math.round(count / total * 100);
            });
            return {
                label: emotionData.name,
                data: data,
                borderColor: emotionData.color,
                backgroundColor: emotionData.color + '33',
                tension: 0, // Straight lines
                fill: false,
                borderWidth: 3 // Thicker lines for visibility
            };
        });
        lineChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: phaseLabels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#1e293b',
                            padding: 15
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: '#64748b' },
                        grid: { color: 'rgba(0,0,0,0.05)' }
                    },
                    y: {
                        ticks: {
                            color: '#64748b',
                            callback: val => val + '%'
                        },
                        grid: { color: 'rgba(0,0,0,0.05)' }
                    }
                }
            }
        });
    }
    function renderPhaseLegend() {
        phaseLegend.innerHTML = Object.entries(GeminiAnalyzer.PHASES).map(([key, data]) => {
            const count = phases[key]?.posts?.length || 0;
            return `
    < div class="phase-legend-item" >
                    <span class="phase-color" style="background: ${data.color}"></span>
                    <span>${data.name} (${count}件)</span>
                </div >
    `;
        }).join('');
    }
    function renderPhaseStats() {
        phaseStats.innerHTML = Object.entries(GeminiAnalyzer.PHASES).map(([key, data]) => {
            const phasePosts = phases[key]?.posts || [];
            const topEmotion = getTopEmotion(phasePosts);
            return `
    < div class="phase-stat-card" style = "border-left: 4px solid ${data.color}" >
                    <h4>${data.name}</h4>
                    <div class="count">${phasePosts.length}件</div>
                    <div style="font-size: 0.75rem; color: #94a3b8; margin-top: 0.5rem;">
                        最多: ${topEmotion}
                    </div>
                </div >
    `;
        }).join('');
    }
    function getTopEmotion(posts) {
        if (posts.length === 0) return '-';
        const counts = {};
        posts.forEach(p => {
            counts[p.emotion] = (counts[p.emotion] || 0) + 1;
        });
        const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
        if (!top) return '-';
        const emotionData = GeminiAnalyzer.EMOTIONS[top[0]];
        return emotionData ? `${emotionData.emoji} ${emotionData.name} ` : '-';
    }
    function renderOpinionStackedChart() {
        const ctx = document.getElementById('opinionStackedChart').getContext('2d');
        if (opinionStackedChart) {
            opinionStackedChart.destroy();
        }
        const phaseKeys = ['PRE_MATCH', 'FIRST_HALF_1', 'FIRST_HALF_2', 'SECOND_HALF_1', 'SECOND_HALF_2', 'POST_MATCH'];
        const phaseLabels = phaseKeys.map(key => GeminiAnalyzer.PHASES[key]?.name || key);
        const topCategories = ['TACTICS', 'PLAYER', 'MATCH_FLOW', 'REFEREE', 'SUPPORT', 'RESULT', 'OTHER'];
        const datasets = topCategories.map(catKey => {
            const catData = GeminiAnalyzer.OPINIONS[catKey];
            const data = phaseKeys.map(phaseKey => {
                const phasePosts = phases[phaseKey]?.posts || [];
                const count = phasePosts.filter(p => p.category === catKey).length;
                const total = phasePosts.length || 1;
                return Math.round(count / total * 100);
            });
            return {
                label: catData.name,
                data: data,
                backgroundColor: catData.color,
                stack: 'Stack 0'
            };
        });
        opinionStackedChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: phaseLabels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: '#1e293b', padding: 15 }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const label = context.dataset.label || '';
                                const value = context.parsed.y;
                                return `${label}: ${value}%`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        stacked: true,
                        ticks: { color: '#64748b' },
                        grid: { color: 'rgba(0,0,0,0.05)' }
                    },
                    y: {
                        stacked: true,
                        max: 100,
                        ticks: { color: '#64748b', callback: val => val + '%' },
                        grid: { color: 'rgba(0,0,0,0.05)' }
                    }
                }
            }
        });
    }
    function renderOpinionLineChart() {
        const ctx = document.getElementById('opinionLineChart').getContext('2d');
        document.getElementById('opinionLineChart').parentElement.style.display = 'block';
        if (opinionLineChart) {
            opinionLineChart.destroy();
        }
        const phaseKeys = ['PRE_MATCH', 'FIRST_HALF_1', 'FIRST_HALF_2', 'SECOND_HALF_1', 'SECOND_HALF_2', 'POST_MATCH'];
        const phaseLabels = phaseKeys.map(key => GeminiAnalyzer.PHASES[key]?.name || key);
        const topCategories = ['SUPPORT', 'RESULT', 'MATCH_FLOW']; // Specified 3 categories
        const datasets = topCategories.map(catKey => {
            const catData = GeminiAnalyzer.OPINIONS[catKey];
            const data = phaseKeys.map(phaseKey => {
                const phasePosts = phases[phaseKey]?.posts || [];
                const count = phasePosts.filter(p => p.category === catKey).length;
                const total = phasePosts.length || 1;
                return Math.round(count / total * 100);
            });
            return {
                label: catData.name,
                data: data,
                borderColor: catData.color,
                backgroundColor: catData.color + '33',
                tension: 0, // Straight lines
                fill: false,
                borderWidth: 3 // Thicker lines for visibility
            };
        });
        opinionLineChart = new Chart(ctx, {
            type: 'line',
            data: { labels: phaseLabels, datasets: datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { color: '#1e293b', padding: 15 } }
                },
                scales: {
                    x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(0,0,0,0.05)' } },
                    y: {
                        ticks: { color: '#64748b', callback: val => val + '%' },
                        grid: { color: 'rgba(0,0,0,0.05)' }
                    }
                }
            }
        });
    }
    function renderDataTable() {
        if (dataCount) {
            dataCount.textContent = `${analyzedData.length} 件`;
        }
        if (!dataTableBody) return;
        dataTableBody.innerHTML = analyzedData.slice(0, 3000).map((post, index) => {
            const emotionData = GeminiAnalyzer.EMOTIONS[post.emotion] || {};
            const phaseColor = GeminiAnalyzer.PHASES[post.phaseKey]?.color || '#fff';
            return `
                <tr onclick="showPostDetail(${index})" style="cursor: pointer">
                    <td>${post.datetime || '-'}</td>
                    <td><span style="color: ${phaseColor}">${post.phase || '-'}</span></td>
                    <td><span style="color: ${emotionData.color || '#fff'}">${emotionData.emoji || ''} ${emotionData.name || '-'}</span></td>
                    <td>${(post.text || '').substring(0, 80)}${(post.text || '').length > 80 ? '...' : ''}</td>
                </tr>
            `;
        }).join('');
    }
    window.showPostDetail = function (index) {
        const post = analyzedData[index];
        if (!post) return;
        document.getElementById('detailDatetime').textContent = post.datetime;
        document.getElementById('detailPhase').textContent = post.phase || '-';
        document.getElementById('detailEmotion').textContent = `${post.emotionEmoji || ''} ${post.emotionName || '-'} `;
        document.getElementById('detailText').textContent = post.text;
        document.getElementById('detailScores').textContent = `確信度: ${post.confidence || 0}% `;
        textDetailModal.classList.remove('hidden');
    };
    function handleTabClick(e) {
        const tab = e.target.dataset.tab;
        if (!tab) return;
        tabBtns.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
        document.getElementById(`${tab}Tab`).classList.add('active');
    }
    function saveSettings() {
        GeminiAnalyzer.setApiKey(apiKeyInput.value.trim());
        settingsModal.classList.add('hidden');
        alert('設定を保存しました。');
    }
    function exportData() {
        if (analyzedData.length === 0) {
            alert('エクスポートするデータがありません。');
            return;
        }
        const csvContent = [
            ['投稿日時', '区分', '感情', 'テキスト'].join(','),
            ...analyzedData.map(p => [
                p.datetime,
                p.phase || '',
                p.emotionName || '',
                `"${(p.text || '').replace(/"/g, '""')}"`
            ].join(','))
        ].join('\n');
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `soccer_analysis_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }
    function exportHtmlReport() {
        const html = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>サッカー放送支援レポート</title>
    <style>
        body { font-family: sans-serif; max-width: 800px; margin: 2rem auto; padding: 1rem; }
        h1 { color: #059669; }
        h2 { color: #0ea5e9; margin-top: 2rem; }
        .section { background: #f8fafc; padding: 1rem; border-radius: 8px; margin: 1rem 0; }
    </style>
</head>
<body>
    <h1>⚽ サッカー放送支援レポート</h1>
    <p>試合: ${matchTitleInput.value || '未設定'}</p>
    <p>生成日時: ${new Date().toLocaleString('ja-JP')}</p>
    <h2>📋 行動方針</h2>
    <div class="section">${document.getElementById('guidanceContainer')?.innerHTML || ''}</div>
    <h2>📝 放送原稿</h2>
    <div class="section">${broadcastContent ? broadcastContent.innerHTML : ''}</div>
</body>
</html>`;
        const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `soccer_report_${new Date().toISOString().slice(0, 10)}.html`;
        a.click();
        URL.revokeObjectURL(url);
    }
    async function confirmSaveAnalysis() {
        try {
            const name = analysisNameInput.value.trim() || `サッカー分析_${new Date().toISOString()}`;
            const saveToFile = saveToFileCheckbox.checked;
            const newEntry = {
                id: Date.now().toString(),
                name: name,
                matchTitle: matchTitleInput.value,
                count: analyzedData.length,
                savedAt: new Date().toISOString(),
                analyzedData: analyzedData,
                phases: phases,
                guidanceContent: document.getElementById('guidanceContainer')?.innerHTML || '',
                broadcastContent: broadcastContent ? broadcastContent.innerHTML : ''
            };
            await HistoryDB.save(newEntry);
            if (saveToFile) {
                const blob = new Blob([JSON.stringify(newEntry, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${name.replace(/[\/:*?"<>|]/g, '_')}.json`;
                a.click();
                URL.revokeObjectURL(url);
            }
            saveModal.classList.add('hidden');
            alert(`「${name}」として保存しました！`);
        } catch (error) {
            alert('保存中にエラーが発生しました。');
        }
    }
    function openHistoryModal() {
        renderHistoryList();
        historyModal.classList.remove('hidden');
    }
    async function renderHistoryList() {
        try {
            const history = await HistoryDB.getAll();
            history.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
            historyList.innerHTML = '';
            if (history.length === 0) {
                historyList.innerHTML = '<div class="placeholder">履歴がありません</div>';
                return;
            }
            history.forEach(item => {
                const div = document.createElement('div');
                div.className = 'history-item';
                div.innerHTML = `
                    <div class="history-info">
                        <div class="history-name">${item.name}</div>
                        <div class="history-meta">
                            ${item.count}件 | ${new Date(item.savedAt).toLocaleString('ja-JP')}
                        </div>
                    </div>
                    <div class="history-buttons">
                        <button class="history-btn-load" data-id="${item.id}">読み込み</button>
                        <button class="history-btn-delete" data-id="${item.id}">🗑️</button>
                    </div>
                `;
                historyList.appendChild(div);
            });
            document.querySelectorAll('.history-btn-load').forEach(btn => {
                btn.addEventListener('click', () => loadHistoryItem(btn.dataset.id));
            });
            document.querySelectorAll('.history-btn-delete').forEach(btn => {
                btn.addEventListener('click', () => deleteHistoryItem(btn.dataset.id));
            });
        } catch (e) {
            historyList.innerHTML = '<div class="placeholder">履歴の読み込みに失敗しました。</div>';
        }
    }
    async function loadHistoryItem(id) {
        try {
            const item = await HistoryDB.get(id);
            if (!item) {
                alert('履歴が見つかりません。');
                return;
            }
            analyzedData = item.analyzedData || [];
            phases = item.phases || {};
            showResults();
            renderCharts();
            renderDataTable();
            renderPhaseLegend();
            renderPhaseStats();
            const guidanceContainer = document.getElementById('guidanceContainer');
            if (guidanceContainer) {
                guidanceContainer.innerHTML = item.guidanceContent || item.htGuidance || '<div class="placeholder">データなし</div>';
            }
            if (broadcastContent) {
                broadcastContent.innerHTML = item.broadcastContent || '<div class="placeholder">データなし</div>';
            }
            matchTitleInput.value = item.matchTitle || '';
            historyModal.classList.add('hidden');
            alert(`「${item.name}」を読み込みました！\n各タブの「再生成ボタン」が使用可能です。`);
        } catch (e) {
            alert(`読み込みに失敗しました: ${e.message}`);
        }
    }
    async function deleteHistoryItem(id) {
        if (confirm('この履歴を削除しますか？')) {
            await HistoryDB.delete(id);
            renderHistoryList();
        }
    }
    function showProgress() {
        uploadSection.classList.add('hidden');
        analysisSection.classList.remove('hidden');
        progressContainer.classList.remove('hidden');
    }
    function hideProgress() {
        progressContainer.classList.add('hidden');
    }
    function updateProgress(percent, text) {
        progressFill.style.width = percent + '%';
        progressText.textContent = text;
    }
    function showResults() {
        uploadSection.classList.add('hidden');
        analysisSection.classList.remove('hidden');
    }
});