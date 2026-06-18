const GeminiAnalyzer = {
    EMOTIONS: {
        POSITIVE: { name: 'ポジティブ評価', emoji: '😊', color: '#22c55e', keywords: ['最高', 'すごい', 'ナイス', '良い', '素晴らしい'] },
        EXCITEMENT: { name: '興奮・喜び', emoji: '🔥', color: '#f59e0b', keywords: ['きた', '熱い', 'やった', '勝った', 'ゴール'] },
        DISAPPOINTMENT: { name: '落胆・不満', emoji: '😞', color: '#6b7280', keywords: ['残念', 'ダメ', '弱い', '負け', 'つまらない'] },
        CRITICISM: { name: '批判・怒り', emoji: '😠', color: '#ef4444', keywords: ['審判', 'おかしい', 'ふざけんな', '最悪', 'クソ'] },
        OBJECTIVE: { name: '客観・情報', emoji: '🧐', color: '#3b82f6', keywords: ['戦術', '交代', 'フォーメーション', '情報', '速報'] }
    },
    OPINIONS: {
        TACTICS: { name: '戦術・采配', color: '#6366f1' },
        PLAYER: { name: '選手評価', color: '#ec4899' },
        MATCH_FLOW: { name: '試合展開', color: '#f59e0b' },
        REFEREE: { name: '審判・VAR', color: '#64748b' },
        SUPPORT: { name: '応援・期待', color: '#f97316' },
        RESULT: { name: '結果・総括', color: '#10b981' },
        OTHER: { name: 'その他', color: '#94a3b8' }
    },
    PHASES: {
        PRE_MATCH: { name: '試合前', color: '#8b5cf6', order: 1 },
        FIRST_HALF_1: { name: '前半①', color: '#3b82f6', order: 2 },
        FIRST_HALF_2: { name: '前半②', color: '#06b6d4', order: 3 },
        SECOND_HALF_1: { name: '後半①', color: '#10b981', order: 4 },
        SECOND_HALF_2: { name: '後半②', color: '#84cc16', order: 5 },
        POST_MATCH: { name: '試合終了後', color: '#f59e0b', order: 6 }
    },
    get BROADCAST_STANDARDS() {
        if (typeof window !== 'undefined' && window.BROADCAST_STANDARDS_FULL) {
            return window.BROADCAST_STANDARDS_FULL;
        }
        return this._DEFAULT_STANDARDS;
    },
    _DEFAULT_STANDARDS: `
【資料A：放送倫理基本綱領 / 放送倫理手帳2025】
1. 放送の社会的責任
   - 放送は、民主主義の精神に則り、基本的人権を尊重する。
   - 放送は、国民の知る権利に応えるとともに、言論・表現の自由を守る。
39: 2. 放送の品位
   - 放送は、適正な言葉と映像を用いると同時に、品位ある表現を心掛ける。
   - 視聴者に不快感を与えないよう配慮する。
【資料B：日本民間放送連盟 放送基準（民放連放送基準 / 民放連報道指針）】
第1章 人権
  (2) 個人・団体の名誉を傷つけるような取り扱いはしない。
  (5) 人種・性別・職業・境遇・信条などによって取り扱いを差別しない。
第2章 法と政治
  (10) 人種・民族・国民に関することを取り扱う時は、その感情を尊重しなければならない。
第8章 表現上の配慮
  (56) 放送内容によっては、SNS等において出演者に対する想定外の誹謗中傷等を誘引することがあり得ることに留意する。また、出演者の精神的な健康状態にも配慮する。
  (58) 暴力行為は、その目的のいかんを問わず、否定的に取り扱う。
  (60) 視聴者に過度な不安・不快・恐怖を与える恐れのある表現は避ける。
【スポーツ中継・ハイライト番組としての追加指針】
・敗者やそのサポーターを侮蔑するような表現は、上記「人権(2)」および「表現上の配慮(56)」に基づき厳禁とする。
・審判や選手への個人の特定可能な攻撃は、上記「人権(2)」に基づき排除する。
・スラング・汚い言葉は「放送倫理基本綱領 2.放送の品位」に基づき、適切な表現に変換する。
`,
    MODELS: ['gemini-2.0-flash', 'gemini-1.5-flash'],
    currentModelIndex: 0,
    getApiKey() {
        return localStorage.getItem('soccer_gemini_api_key') || '';
    },
    setApiKey(key) {
        localStorage.setItem('soccer_gemini_api_key', key);
    },
    getCurrentModel() {
        return this.MODELS[this.currentModelIndex];
    },
    resetModel() {
        this.currentModelIndex = 0;
    },
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    splitIntoSixPhases(posts, kickoffTime) {
        const kickoff = new Date(kickoffTime);
        const htStart = new Date(kickoff.getTime() + 45 * 60 * 1000);
        const secondHalfStart = new Date(kickoff.getTime() + 60 * 60 * 1000);
        const matchEnd = new Date(kickoff.getTime() + 110 * 60 * 1000);
        const phases = {
            PRE_MATCH: { name: '試合前', posts: [], color: '#8b5cf6' },
            FIRST_HALF_1: { name: '前半①', posts: [], color: '#3b82f6' },
            FIRST_HALF_2: { name: '前半②', posts: [], color: '#06b6d4' },
            SECOND_HALF_1: { name: '後半①', posts: [], color: '#10b981' },
            SECOND_HALF_2: { name: '後半②', posts: [], color: '#84cc16' },
            POST_MATCH: { name: '試合終了後', posts: [], color: '#f59e0b' }
        };
        posts.forEach(post => {
            const postTime = new Date(post.datetime);
            if (postTime < kickoff) {
                phases.PRE_MATCH.posts.push(post);
            } else if (postTime < new Date(kickoff.getTime() + 22 * 60 * 1000)) {
                phases.FIRST_HALF_1.posts.push(post);
            } else if (postTime < htStart) {
                phases.FIRST_HALF_2.posts.push(post);
            } else if (postTime < new Date(secondHalfStart.getTime() + 22 * 60 * 1000)) {
                phases.SECOND_HALF_1.posts.push(post);
            } else if (postTime < matchEnd) {
                phases.SECOND_HALF_2.posts.push(post);
            } else {
                phases.POST_MATCH.posts.push(post);
            }
        });
        return phases;
    },
    detectPhaseFromFilename(filename) {
        const lower = filename.toLowerCase();
        if (lower.includes('試合前') || lower.includes('pre')) return 'PRE_MATCH';
        if (lower.includes('前半1') || lower.includes('前半①') || lower.includes('first1')) return 'FIRST_HALF_1';
        if (lower.includes('前半2') || lower.includes('前半②') || lower.includes('first2')) return 'FIRST_HALF_2';
        if (lower.includes('後半1') || lower.includes('後半①') || lower.includes('second1')) return 'SECOND_HALF_1';
        if (lower.includes('後半2') || lower.includes('後半②') || lower.includes('second2')) return 'SECOND_HALF_2';
        if (lower.includes('終了') || lower.includes('post')) return 'POST_MATCH';
        return null;
    },
    async analyzeEmotions(posts, onProgress) {
        this.resetModel();
        const apiKey = this.getApiKey();
        if (!apiKey) throw new Error('APIキーが設定されていません');
        onProgress(15, 'サッカー試合の文脈（感情・意見）を分析中...');
        const results = [];
        const batchSize = 25;
        const batches = [];
        for (let i = 0; i < posts.length; i += batchSize) {
            batches.push(posts.slice(i, i + batchSize));
        }
        const concurrency = 3;
        for (let i = 0; i < batches.length; i += concurrency) {
            const chunk = batches.slice(i, i + concurrency);
            const progress = 15 + (i / batches.length) * 60;
            onProgress(progress, `分析中... (${Math.min(i + concurrency, batches.length)}/${batches.length}バッチ)`);
            const chunkResults = await Promise.all(
                chunk.map(batch => this.analyzeBatch(batch, apiKey))
            );
            chunkResults.forEach(res => results.push(...res));
            await this.delay(1000);
        }
        return results;
    },
    async analyzeBatch(posts, apiKey) {
        const prompt = this.buildAnalysisPrompt(posts);
        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${this.getCurrentModel()}:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: {
                            temperature: 0,
                            maxOutputTokens: 8192,
                            responseMimeType: "application/json"
                        }
                    })
                }
            );
            if (!response.ok) throw new Error(`API Error: ${response.status}`);
            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            return this.parseAnalysisResult(text, posts);
        } catch (error) {
            return posts.map(post => ({
                ...post,
                emotion: 'OBJECTIVE',
                emotionName: '客観・情報',
                category: 'OTHER',
                categoryName: 'その他',
                scores: { OBJECTIVE: 100 }
            }));
        }
    },
    buildAnalysisPrompt(posts) {
        return `あなたはサッカーファンのSNS投稿を分析するAIです。
以下の投稿リスト（ID付き）について、最も当てはまる「感情」と「意見内容カテゴリ」を分析し、指定されたJSON形式のみで出力してください。
【感情定義 (emotion)】
- POSITIVE: ポジティブ評価
- EXCITEMENT: 興奮・喜び
- DISAPPOINTMENT: 落胆・不満
- CRITICISM: 批判・怒り
- OBJECTIVE: 客観・情報
【意見カテゴリ定義 (category)】
- TACTICS: 戦術・采配・チーム全体
- PLAYER: 選手個人への評価・言及
- MATCH_FLOW: 試合展開・ゴール・決定機・ポジティブ/ネガティブな流れ
- REFEREE: 審判・判定・VAR
- SUPPORT: 応援・激励・期待・会場の雰囲気
- RESULT: 試合結果・総括
- OTHER: その他・雑談・無関係・上記に当てはまらないもの
【重要: カテゴリ分類の指針】
- 「うまい」「ナイス」等の選手個人への言及はすべて PLAYER
- 「点入った」「ピンチ」「攻めろ」等の展開に関する言及は MATCH_FLOW
- 「勝った」「負けた」「お疲れ様」等の結果言及は RESULT
- 「頑張れ」「楽しみ」等の応援・期待は SUPPORT
【投稿リスト】
${posts.map(p => `ID:${p.index} "${p.text.substring(0, 140).replace(/"/g, "'")}"`).join('\n')}
【出力形式】
JSON配列のみを出力してください。
[{"index":0,"emotion":"POSITIVE","category":"PLAYER"},...]`;
    },
    parseAnalysisResult(text, posts) {
        let parsed = [];
        try {
            let jsonText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            try {
                parsed = JSON.parse(jsonText);
            } catch (e) {
                const firstBracket = jsonText.indexOf('[');
                const lastBracket = jsonText.lastIndexOf(']');
                if (firstBracket !== -1 && lastBracket !== -1) {
                    jsonText = jsonText.substring(firstBracket, lastBracket + 1);
                    parsed = JSON.parse(jsonText);
                } else {
                    throw e;
                }
            }
            if (!Array.isArray(parsed)) throw new Error('Response is not an array');
            const CATEGORY_MAP = {
                '戦術': 'TACTICS', '戦術・采配': 'TACTICS', '采配': 'TACTICS', 'チーム': 'TACTICS', 'TACTICS': 'TACTICS',
                '選手': 'PLAYER', '選手評価': 'PLAYER', '個人': 'PLAYER', 'プレイ': 'PLAYER', 'PLAYER': 'PLAYER',
                '試合展開': 'MATCH_FLOW', '流れ': 'MATCH_FLOW', 'ゴール': 'MATCH_FLOW', '決定機': 'MATCH_FLOW', 'MATCH_FLOW': 'MATCH_FLOW',
                '審判': 'REFEREE', '審判・VAR': 'REFEREE', '判定': 'REFEREE', 'VAR': 'REFEREE', 'REFEREE': 'REFEREE',
                '応援': 'SUPPORT', '応援・期待': 'SUPPORT', 'サポーター': 'SUPPORT', '会場': 'SUPPORT', 'SUPPORT': 'SUPPORT',
                '結果': 'RESULT', '結果・総括': 'RESULT', '勝敗': 'RESULT', 'RESULT': 'RESULT',
                'その他': 'OTHER', '雑談': 'OTHER', 'OTHER': 'OTHER'
            };
            return posts.map((post, idx) => {
                let result = parsed.find(r => r.index === post.index);
                if (!result && parsed[idx]) {
                    result = parsed[idx]; // Use array position as fallback
                }
                if (idx < 3) {
                }
                const emotion = result?.emotion || post.emotion || 'OBJECTIVE';
                const emotionData = this.EMOTIONS[emotion] || this.EMOTIONS.OBJECTIVE;
                let categoryRaw = result?.category || result?.opinion || 'OTHER';
                if (typeof categoryRaw === 'string') {
                    categoryRaw = categoryRaw.trim();
                } else {
                    categoryRaw = 'OTHER';
                }
                let category = categoryRaw.toUpperCase();
                if (!this.OPINIONS[category]) {
                    let mapped = false;
                    for (const [key, target] of Object.entries(CATEGORY_MAP)) {
                        if (categoryRaw.includes(key) || category === key) {
                            category = target;
                            mapped = true;
                            break;
                        }
                    }
                    if (!mapped) category = 'OTHER';
                }
                const categoryData = this.OPINIONS[category] || this.OPINIONS.OTHER;
                return {
                    ...post,
                    emotion: emotion,
                    emotionName: emotionData.name,
                    emotionEmoji: emotionData.emoji,
                    emotionColor: emotionData.color,
                    category: category,
                    categoryName: categoryData.name,
                    categoryColor: categoryData.color,
                    confidence: 70,
                    scores: { [emotion]: 70 }
                };
            });
        } catch (error) {
            return posts.map(post => this.fallbackAnalysis(post));
        }
    },
    async analyzeOpinionsOnly(posts, onProgress) {
        this.resetModel();
        const apiKey = this.getApiKey();
        if (!apiKey) throw new Error('APIキーが設定されていません');
        onProgress(10, '意見カテゴリのみ再分析中...');
        const indexedPosts = posts.map((post, i) => ({
            ...post,
            index: post.index !== undefined ? post.index : i
        }));
        const results = [];
        const batchSize = 30;
        const batches = [];
        for (let i = 0; i < indexedPosts.length; i += batchSize) {
            batches.push(indexedPosts.slice(i, i + batchSize));
        }
        const concurrency = 3;
        for (let i = 0; i < batches.length; i += concurrency) {
            const chunk = batches.slice(i, i + concurrency);
            const progress = 10 + (i / batches.length) * 80;
            onProgress(progress, `意見分析中... (${Math.min(i + concurrency, batches.length)}/${batches.length}バッチ)`);
            const chunkResults = await Promise.all(
                chunk.map(batch => this.analyzeOpinionBatch(batch, apiKey))
            );
            chunkResults.forEach(res => results.push(...res));
            await this.delay(800);
        }
        return results;
    },
    async analyzeOpinionBatch(posts, apiKey) {
        const prompt = this.buildOpinionPrompt(posts);
        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${this.getCurrentModel()}:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: {
                            temperature: 0,
                            maxOutputTokens: 8192,
                            responseMimeType: "application/json"
                        }
                    })
                }
            );
            if (!response.ok) throw new Error(`API Error: ${response.status}`);
            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            return this.parseAnalysisResult(text, posts);
        } catch (error) {
            return posts.map(post => {
                const fb = this.fallbackAnalysis(post); // Get category from fallback
                return {
                    ...post, // Keep existing emotion if in post, or fallback
                    category: fb.category,
                    categoryName: fb.categoryName,
                    categoryColor: fb.categoryColor
                };
            });
        }
    },
    buildOpinionPrompt(posts) {
        return `あなたはサッカーファンのSNS投稿を分析するAIです。
以下の投稿リスト（ID付き）について、最も当てはまる「意見内容カテゴリ」のみを再分類してください。
※感情(emotion)の出力は不要ですが、JSONの構造上含める場合は "IGNORE" としてください。
【意見カテゴリ定義 (category)】
- TACTICS: 戦術・采配・チーム全体・フォーメーション・監督への言及
- PLAYER: 選手個人への評価・言及（名前、プレー、技術、活躍、ミス）
- MATCH_FLOW: 試合展開・ゴール・決定機・ポジティブ/ネガティブな流れ・点数・スコア
- REFEREE: 審判・判定・VAR・ファウル・PK
- SUPPORT: 応援・激励・期待・会場の雰囲気・サポーター
- RESULT: 試合結果・総括・勝敗・終了後の感想
- OTHER: 上記のどれにも当てはまらない雑談・無関係な話題のみ
【重要: カテゴリ分類の指針】
- 「うまい」「ナイス」「すごい」等の選手個人への言及はすべて PLAYER
- 「点入った」「ピンチ」「攻めろ」「チャンス」等の展開に関する言及は MATCH_FLOW
- 「勝った」「負けた」「お疲れ様」「終了」等の結果言及は RESULT
- 「頑張れ」「楽しみ」「期待」等の応援・期待は SUPPORT
- **OTHERは最終手段です。迷った場合は最も近いカテゴリを選んでください。**
【投稿リスト】
${posts.map((p, i) => `ID:${i} "${p.text.substring(0, 140).replace(/"/g, "'")}"`).join('\n')}
【出力形式】
JSON配列のみを出力してください。indexは上記のID番号（0から開始）を使用してください。
[{"index":0,"category":"PLAYER"},{"index":1,"category":"MATCH_FLOW"},...]`;
    },
    fallbackAnalysis(post) {
        const text = post.text || '';
        let detectedEmotion = 'OBJECTIVE';
        let detectedCategory = 'OTHER';
        for (const [key, emotionData] of Object.entries(this.EMOTIONS)) {
            for (const keyword of emotionData.keywords) {
                if (text.includes(keyword)) {
                    detectedEmotion = key;
                    break;
                }
            }
        }
        if (text.includes('采配') || text.includes('戦術') || text.includes('守備') || text.includes('攻撃') || text.includes('代表')) detectedCategory = 'TACTICS';
        else if (text.includes('選手') || text.includes('ゴール') || text.includes('ミス') || text.includes('うまい')) detectedCategory = 'PLAYER';
        else if (text.includes('点') || text.includes('決定機') || text.includes('ピンチ') || text.includes('チャンス') || text.includes('流れ')) detectedCategory = 'MATCH_FLOW';
        else if (text.includes('審判') || text.includes('ファウル') || text.includes('PK') || text.includes('VAR')) detectedCategory = 'REFEREE';
        else if (text.includes('応援') || text.includes('サポーター') || text.includes('頑張れ') || text.includes('期待')) detectedCategory = 'SUPPORT';
        else if (text.includes('勝った') || text.includes('負けた') || text.includes('終わり') || text.includes('結果')) detectedCategory = 'RESULT';
        else if (text.includes('実況') || text.includes('解説') || text.includes('カメラ')) detectedCategory = 'BROADCAST'; // Maps to "Broadast/Other" or just Other depending on OPINIONS definition. Since BROADCAST key removed from OPINIONS used in fallback? No, it's defined in OPINIONS in analyzer, just not in chart?
        if (detectedCategory === 'BROADCAST') detectedCategory = 'OTHER';
        const emotionData = this.EMOTIONS[detectedEmotion];
        const categoryData = this.OPINIONS[detectedCategory] || this.OPINIONS.OTHER;
        return {
            ...post,
            emotion: detectedEmotion,
            emotionName: emotionData.name,
            emotionEmoji: emotionData.emoji,
            emotionColor: emotionData.color,
            category: detectedCategory,
            categoryName: categoryData.name,
            categoryColor: categoryData.color,
            confidence: 50,
            scores: { [detectedEmotion]: 50 }
        };
    },
    async generateHTGuidance(phases, apiKey) {
        const relevantPhases = ['PRE_MATCH', 'FIRST_HALF_1', 'FIRST_HALF_2'];
        const phaseData = relevantPhases.map(key => ({
            name: this.PHASES[key].name,
            posts: (phases[key]?.posts || []).slice(0, 10),
            emotionSummary: this.summarizeEmotions(phases[key]?.posts || [])
        }));
        const prompt = `あなたはサッカー中継の総合ディレクターです。ハーフタイム中の各役割への指針を提案してください。
${this.BROADCAST_STANDARDS}
【分析データ】
${phaseData.map(p => `■ ${p.name}\n分布: ${JSON.stringify(p.emotionSummary)}`).join('\n')}
【出力形式】
テキストで、実況・ディレクター・リポーター・SNS担当それぞれの指針を記述してください。`;
        return await this.callApi(prompt, apiKey);
    },
    async generateEndGuidance(phases, apiKey) {
        const allPhaseKeys = ['PRE_MATCH', 'FIRST_HALF_1', 'FIRST_HALF_2', 'SECOND_HALF_1', 'SECOND_HALF_2', 'POST_MATCH'];
        const phaseData = allPhaseKeys.map(key => ({
            name: this.PHASES[key].name,
            emotionSummary: this.summarizeEmotions(phases[key]?.posts || [])
        }));
        const prompt = `あなたはサッカー中継の総合ディレクターです。試合終了後の指針を提案してください。
${this.BROADCAST_STANDARDS}
【分析データ】
${phaseData.map(p => `■ ${p.name}\n分布: ${JSON.stringify(p.emotionSummary)}`).join('\n')}
【出力形式】
テキストで、各役割への指針を記述してください。`;
        return await this.callApi(prompt, apiKey);
    },
    buildBroadcastPrompt(phases) {
        let emotionSummary = 'N/A';
        let opinionSummary = 'N/A';
        const phaseSummaries = Object.values(phases).map(p => {
            const emCounts = p.posts.reduce((acc, post) => { acc[post.emotion] = (acc[post.emotion] || 0) + 1; return acc; }, {});
            const topEm = Object.entries(emCounts).sort((a, b) => b[1] - a[1])[0];
            emotionSummary = topEm ? `${this.EMOTIONS[topEm[0]].name}中心` : 'データ不足';
            const opCounts = p.posts.reduce((acc, post) => { acc[post.category] = (acc[post.category] || 0) + 1; return acc; }, {});
            const topOp = Object.entries(opCounts).sort((a, b) => b[1] - a[1])[0];
            opinionSummary = topOp ? `${this.OPINIONS[topOp[0]].name}が話題` : '特になし';
            return `【${p.name}】(${p.posts.length}件)\n感情: ${emotionSummary}\n意見: ${opinionSummary}`;
        }).join('\n\n');
        return `あなたはプロのサッカー放送作家兼データアナリストです。
SNSの分析結果を基に、放送で使用する行動方針と変換ログを作成してください。
【分析データ】
${phaseSummaries}
【出力形式】
以下のJSON形式のみを出力してください。Markdown記法は不要です。
**重要: ダブルクォーテーション(")は使わず、シングルクォーテーション(')に置き換えてください。**
{
  "conversions": [
    { "original": "やばすぎ", "converted": "素晴らしい", "reason": "スラング回避", "source": "放送基準" },
    { "original": "神!", "converted": "見事なプレー", "reason": "宗教的表現回避", "source": "放送基準" },
    { "original": "クソ審判", "converted": "厳しい判定", "reason": "侮辱表現回避", "source": "放送基準" }
  ],
  "actionGuidelines": {
    "commentators": "実況解説者への指示（50文字以内）",
    "director": "ディレクターへの指示（50文字以内）",
    "reporter": "リポーターへの指示（50文字以内）",
    "digital": "デジタル班への指示（50文字以内）"
  }
}
**conversionsは必ず3件以上、actionGuidelinesの各項目は50文字以内で簡潔に記述してください。**`;
    },
    summarizeEmotions(posts) {
        const counts = {};
        posts.forEach(post => {
            const emotion = post.emotion || 'OBJECTIVE';
            counts[emotion] = (counts[emotion] || 0) + 1;
        });
        const total = posts.length || 1;
        const summary = {};
        Object.entries(counts).forEach(([key, count]) => {
            const emotionData = this.EMOTIONS[key];
            if (emotionData) {
                summary[emotionData.name] = `${Math.round(count / total * 100)}%`;
            }
        });
        return summary;
    },
    async generateAnalysisSummary(phases, apiKey) {
        const prompt = `サッカー試合の感情変化サマリーを作成してください。`;
        return await this.callApi(prompt, apiKey);
    },
    async generateActionGuidance(phases, analysisSummary, apiKey) {
        const prompt = `感情分析サマリーに基づき行動指針を作成してください。`;
        return await this.callApi(prompt, apiKey);
    },
    async generateBroadcastScriptOnly(phases, apiKey) {
        const allPosts = Object.values(phases).flatMap(p => p.posts || []);
        const snsMemo = allPosts.map(p => "- " + p.text).join('\n');
        const modelScript = `今夜、東京スタジアム（味の素スタジアム）で開催されたキリンチャレンジカップ2025。サッカー日本代表は、サッカー王国ブラジル代表と対戦し、激戦の末、見事な逆転勝利を飾りました。
試合は、日本が2点を先行される苦しい展開。しかし、後半に入ると日本代表は攻撃陣の奮起により3点を奪取し、3対2でブラジルを破るという劇的な勝利を収めました。日本代表がA代表としてブラジルに勝利するのは、史上初の快挙となります。
試合は、前半26分にパウロ・エンリケ選手、31分にはガブリエル・マルティネッリ選手がゴールを決め、ブラジルが2点のリードを奪う展開。しかし、後半7分、南野拓実選手が相手のミスを逃さずゴールを決め、反撃の狼煙を上げます。その後、後半17分には中村敬斗選手が、そして26分には上田綺世選手がゴールを奪い、見事逆転。スタジアムは興奮と熱気に包まれました。
SNS上では、試合開始前から日本の勝利を信じる声援とともに、試合展開に感情を揺さぶられる様子が多数投稿されました。特に、後半の逆転劇には、「鳥肌が立った」「信じられない」といった興奮を伝えるコメントや、選手たちの活躍を称賛する声が相次ぎ、日本の勝利を祝福する投稿がSNSを埋め尽くしました。その一方で、チケット価格の高騰に対する不満の声や、審判の判定に対する意見も見られました。
歴史的な勝利を収めたサッカー日本代表。この勢いを胸に、来年のワールドカップでの更なる飛躍が期待されます。視聴者の皆様も、引き続きサッカー日本代表へ熱い声援を送りましょう。`;
        const scriptPrompt = `あなたは夜の全国ニュース番組のメインキャスターです。
熟練のアナウンサーとして、**「正確・沈着・公式」なニュース原稿**を作成してください。
${this.BROADCAST_STANDARDS}
【SNS上の反応（取材メモ）】
${snsMemo}
【原稿作成の重要指針】
- **文体**: 「〜ました」「〜です」の丁寧語ですが、アナウンサーらしい硬めの表現を使ってください（例：「逆転勝利を収めました」「SNS上では〜といった声が聞かれました」）。
- **トーン**: 感情的になりすぎず、事実を淡々と、しかし力強く伝える報道スタイル。（実況のような絶叫・興奮調はNG）。
- **構成**: 「冒頭のリード（結果）」→「試合展開の事実経過」→「SNS等での世論の反応」→「結び」の順序で構成してください。
【見本原稿（トーンの参考）】
${modelScript}
【出力形式】
JSON形式で出力してください。
{ "script": "ここに放送原稿を作成" }`;
        const step1Json = await this.callApi(scriptPrompt, apiKey, 8192);
        let scriptData = {};
        try {
            const match = step1Json.match(/```(?:json)?\s*([\s\S]*?)```/);
            scriptData = JSON.parse(match ? match[1] : step1Json);
        } catch (e) {
            return step1Json; 
        }
        if (!scriptData.script) {
            return step1Json;
        }
        const generatedScript = scriptData.script;
        const conversionPrompt = `あなたは放送倫理の専門家です。
以下の「放送原稿」は、SNSの過激な投稿を元に、放送倫理規定（放送倫理手帳・民放連放送基準）に配慮して作成されたものです。
【作成された放送原稿】
${generatedScript}
【指示】
この原稿の中で、**実際に使用されている表現**の中から、「元のSNSの過激な表現」を「穏当な放送表現」に言い換えた箇所を特定し、変換ログを作成してください。
【出力形式】
JSON形式のみ。
{
  "conversions": [
    { 
      "original": "SNSでの元の過激な表現（推測）", 
      "converted": "原稿内の実際の表現（※原稿からコピー＆ペースト必須）", 
      "reason": "【放送倫理手帳2025 第8章(47)】倫理的な理由...", 
      "source": "放送倫理手帳" 
    }
  ]
}
**重要:**
- **converted**は、必ず上記の原稿に含まれるフレーズをそのまま抜き出してください。
- **source**は「放送倫理手帳」「民放連放送基準」「報道指針」のいずれか短い名称。
- **reason**は「【正式名称+章番号】理由」の形式。
- **必ず3件以上**抽出してください。
`;
        const step2Json = await this.callApi(conversionPrompt, apiKey, 8192);
        let conversionData = { conversions: [] };
        try {
            const match = step2Json.match(/```(?:json)?\s*([\s\S]*?)```/);
            conversionData = JSON.parse(match ? match[1] : step2Json);
        } catch (e) {
        }
        const finalResult = {
            script: generatedScript,
            conversions: conversionData.conversions || []
        };
        if (Array.isArray(finalResult.conversions)) {
            const initialCount = finalResult.conversions.length;
            const normalize = s => s.replace(/[、。！？\s　「」『』()（）]/g, '');
            const normalizedScript = normalize(finalResult.script);
            finalResult.conversions = finalResult.conversions.filter(c =>
                normalizedScript.includes(normalize(c.converted))
            );
        }
        return JSON.stringify(finalResult);
    },
    async generateActionGuidelinesOnly(phases, apiKey) {
        const allPosts = Object.values(phases).flatMap(p => p.posts || []);
        const snsMemo = allPosts.map(p => "- " + p.text).join('\n');
        const prompt = `あなたはプロのサッカー放送作家兼データアナリストです。
SNSの分析結果を基に、放送で使用する**具体的で実践的な行動方針**を作成してください。
${this.BROADCAST_STANDARDS}
【SNS上の反応（取材メモ：全件データ）】
${snsMemo}
【行動方針の作成指示】
以下の4つの役割に対して、**具体的で実践的な行動方針**を作成してください。
**「データによると」「分析の結果」といった前置きは一切不要です。**
**何をするべきか、どう撮るべきか、結論から端的に記述してください。**
**太字・線引きなどを活用し、パッと見て重要なポイントが分かるようにしてください。**
【出力例：ディレクター（カメラ）へ】
■ 南野拓実（20:30-20:45 得点シーン）：
・ゴール後の顔のアップ＋両手広げポーズのスロー再生。「SNSで"ミスを逃さない嗅覚"と称賛されたプレー」→ 解説と連動して「これは運じゃない、プレスからの必然だ！」と演出。
■ 中村敬斗（20:45-21:00 同点ゴール）：
・右足ボレーの瞬間を3角度（正面・斜め後方・GK視点）でクロスカット。「SNSで"鮮やかボレー""歴史的ゴール"と爆発的拡散中」→ このシーンはCM明けにも再放送必須。
【出力例：現場リポーターへ】
■ 南野拓実へ：
「"ブラジルDFのミスを見逃さない嗅覚"とSNSで称賛されてます。あのプレスは狙ってましたか？」
■ 中村敬斗へ：
「"輝いてる""切り札の真価"とSNSで話題です。交代前に監督からどんな指示を受けましたか？」
■ "諦めたフリした一般観客"へ（※SNSで「前半でTV消した」と投稿した層の代弁者）：
「SNSでは"前半で消したけど、友達のLINEで逆転知って飛び起きた！"という声が多数。あなたここで戻って応援しましたか？」
【出力形式】
JSON形式のみ。各項目のマークダウン記述を強化すること。
{
  "actionGuidelines": {
    "commentators": "## 1. 実況・解説者へ：ハーフタイム・試合終了後に触れるべき'最も熱い論点'\\n\\n【アクション】ハーフタイムでは「前半0-2の敗因と、後半の逆転シナリオ」を感情的に語り、終了後は「歴史的逆転劇の'感情のジェットコースター'を再現せよ」\\n\\n• **ハーフタイム（20:15-20:30）：**\\n  - SNSで噴出した「批判」「落胆」「選手への懸念」をあえて拾い、**「ファンが今感じている'絶望'を代弁する」**\\n  - その上で、**「でもまだ終わってない！」**と、SNSのネガティブ感情を'反撃の燃料'に変える演出を。\\n\n• **試合終了後（21:45-22:00）：**\\n  - 「SNSは今、'震えた''夢かと思った''歴史を変えた'で埋まっています！この感動を、皆さんと一緒に噛み締めましょう！」と、ファンの投稿言葉をそのまま引用し、共感を最大化。",
    "director": "## 2. ディレクター（カメラ）へ：今、視聴者が最も見たい'SNSで話題の選手やプレー'の撮影指示\\n\\n【アクション】'逆転の立役者3人'（南野・中村敬斗・伊東純也）のリアクションを徹底追跡。特に「中村敬斗の同点ボレー」と「伊東の切り札突破」をスロー＋特写で'神シーン化'せよ\\n\n• **南野拓実（20:30-20:45 得点シーン）：**\\n  - ゴール後の顔のアップ＋両手広げポーズのスロー再生。**「SNSで'ミスを逃さない嗅覚'と称賛されたプレー」**→ 解説と連動して「これは運じゃない、プレスからの必然だ！」と演出。\\n\n• **中村敬斗（20:45-21:00 同点ゴール）：**\\n  - 右足ボレーの瞬間を3角度（正面・斜め後方・GK視点）でクロスカット。**「SNSで'鮮やかボレー''歴史的ゴール'と爆発的拡散中」**→ このシーンはCM明けにも再放送必須。",
    "reporter": "## 3. 現場リポーターへ：試合後、SNSの熱狂を捉えるために'誰に何を聞くべきか'\\n\n【アクション】'SNSで名前が急上昇した3選手＋諦めたフリしたファン'に直撃インタビュー。質問は「あの瞬間、SNSで何が起きてたか知ってますか？」からスタート\\n\n• **中村敬斗へ：**\\n  > 「あなたのボレーが決まった瞬間、SNSは'鳥肌立った''歴史的瞬間'で埋まりました。あの時、ピッチで何を感じてましたか？」\\n\n• **南野拓実へ：**\\n  > 「'ブラジルDFのミスを見逃さない嗅覚'とSNSで称賛されてます。あのプレスは狙ってましたか？」\\n\n• **'諦めたフリした一般観客'へ：**\\n  > 「SNSでは'前半で消したけど、友達のLINEで逆転知って飛び起きた！'という声が多数。あなたはどこで戻って応援しましたか？」",
    "digital": "## 4. デジタル（SNS/Web）チームへ：最も'バズる'動画の切り抜き箇所とWeb記事見出し案\\n\n【アクション】'0-2→3-2 逆転劇'を15秒動画3分割で即公開。見出しは「SNSが震えた瞬間」シリーズで統一\\n\n▶ **Web記事見出し案：**\\n• メイン：\\n  > 「《SNSが震えた90分》0-2から3-2へ…日本代表'歴史的逆転'の瞬間、ネットは'鳥肌''夢かと思った'で埋まった」\\n• サブ（SEO最適化）：\\n  > 「中村敬斗'神ボレー'動画再生100万超｜伊東純也'切り札'でSNS炎上｜森保監督'采配批判→称賛'の軌跡」\\n\n▶ **動画切り抜き（TikTok/Instagram Reels向け）：**\\n1. 【Part 1: 絶望】前半0-2失点シーン＋SNSコメントオーバーレイ（「目を離した隙に…」「雑魚」）→ 最後に「でも、ここで諦めなかった…」テロップ。\\n2. 【Part 2: 奇跡】南野ゴール→中村ボレー→上田決勝点を10秒で高速編集＋SNSコメント爆発（「ニッポンゴール！」「まじか！」「神すぎる！」）"
  }
}
**重要:**
- actionGuidelinesは上記の形式で、時間帯・選手名・SNSの引用を必ず含めること
- **前置き（「分析の結果」「データによると」）は禁止。すぐに行動指針を書くこと。**
`;
        return await this.callApi(prompt, apiKey, 8192);
    },
    async generateBroadcastScript(phases, apiKey) {
        const [scriptResult, guidelinesResult] = await Promise.all([
            this.generateBroadcastScriptOnly(phases, apiKey),
            this.generateActionGuidelinesOnly(phases, apiKey)
        ]);
        const cleanJson = (str) => {
            const match = str.match(/```(?:json)?\s*([\s\S]*?)```/);
            return match ? match[1] : str;
        };
        try {
            const scriptObj = JSON.parse(cleanJson(scriptResult));
            const guideObj = JSON.parse(cleanJson(guidelinesResult));
            return JSON.stringify({
                ...scriptObj,
                ...guideObj
            });
        } catch (e) {
            return scriptResult;
        }
    },
    async callApi(prompt, apiKey, maxTokens = 8192) {
        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${this.getCurrentModel()}:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: {
                            temperature: 0.7,
                            maxOutputTokens: maxTokens,
                            responseMimeType: "application/json"
                        }
                    })
                }
            );
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`API Error: ${response.status} ${errorData.error?.message || ''}`);
            }
            const data = await response.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        } catch (error) {
            return `エラーが発生しました: ${error.message}`;
        }
    }
};