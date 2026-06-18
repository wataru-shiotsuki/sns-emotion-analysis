const GeminiAnalyzer = {
    EMOTIONS: {
        FEAR: { name: '恐怖', emoji: '🌪️', color: '#dc2626', keywords: ['怖い', '恐ろしい', '逃げ', 'パニック', '死ぬ', '揺れてる'] },
        SHOCK: { name: '衝撃', emoji: '😲', color: '#eab308', keywords: ['まさか', '想像以上', '信じられない', '驚', 'びっくり', 'とな', 'えっ'] },
        ANXIETY: { name: '不安', emoji: '😰', color: '#f97316', keywords: ['不安', 'どうなる', '余震', 'これから', '先が見えない'] },
        WORRY: { name: '心配', emoji: '😟', color: '#9333ea', keywords: ['大丈夫', '無事', 'お大事に', '気をつけて', '祈', '安否', '心配'] },
        SADNESS: { name: '悲しみ', emoji: '💧', color: '#3b82f6', keywords: ['悲しい', '辛い', '残念', '泣', '切ない', '亡くなった'] },
        ANGER: { name: '怒り', emoji: '🔥', color: '#ef4444', keywords: ['怒', '許せない', '腹立', 'ふざけ', '対応が遅い', '何してる'] },
        DISGUST: { name: '嫌悪', emoji: '🤢', color: '#84cc16', keywords: ['最悪', 'ひどい', '嫌', 'うんざり', '不快', '酷い'] },
        SOLIDARITY: { name: '連帯', emoji: '💪', color: '#ec4899', keywords: ['頑張', '応援', '支援', '助け', '寄付', '力になりたい', '共に'] },
        RELIEF: { name: '安堵', emoji: '😌', color: '#22c55e', keywords: ['良かった', 'ほっと', '安心', '無事で', '助かった', '生きてた'] },
        FACTUAL: { name: '冷静', emoji: '📊', color: '#64748b', keywords: ['震度', 'マグニチュード', '死者', '負傷者', '避難', '発生', '速報'] }
    },
    BROADCAST_STANDARDS: `
【放送倫理基本綱領】
・放送は、民主主義の精神に則り、基本的人権を尊重し、言論・表現の自由を守る
・報道は、事実を客観的かつ正確、公平に伝え、真実に迫るために最善の努力を傾ける
・適正な言葉と映像を用い、品位ある表現を心掛ける
【第1章 人権】
(1) 人命を軽視するような取り扱いはしない
(2) 個人・団体の名誉を傷つけるような取り扱いはしない
(3) 個人情報の取り扱いには十分注意し、プライバシーを侵すような取り扱いはしない
(5) 人種・民族、性、職業、境遇、信条などによって、差別的な取り扱いをしない
【第6章 報道の責任】
(31) 報道活動は市民の知る権利へ奉仕するものであり、事実に基づき、公正でなければならない
(32) ニュース報道にあたっては、個人のプライバシーや自由を不当に侵したり、名誉を傷つけたりしないように注意する
(33) 取材・編集にあたっては、一方に偏るなど、視聴者に誤解を与えないように注意する
(34) ニュースの中で意見を取り扱う時は、その出所を明らかにする
(35) 事実の報道であっても、陰惨な場面の細かい表現は避けなければならない
(36) ニュースは不当な目的や宣伝に利用されないように注意する
【第8章 表現上の配慮】
(42) 放送内容は視聴者の生活状態を考慮し、不快な感じを与えないようにする
(43) わかりやすく適正な言葉と文字を用いるように努める
(44) 地域の文化や風習、言葉を尊重し、不快感を与えないように注意する
(45) 人心に動揺や不安を与えるおそれのある内容は慎重に取り扱う
(46) 社会・公共の問題で意見が対立しているものについては、できるだけ多くの角度から論じる
(47) 不快な感じを与えるような下品、卑わいな表現は避ける
(55) 障害や病気に触れる時は、同じ障害や病気に悩む人々の感情に配慮する
(56) SNS等において出演者に対する誹謗中傷を誘引することがあり得ることに留意する
【民放連報道指針】
・予断を排し、事実をありのまま伝える。未確認の情報は未確認であることを明示する
・取材対象となった人の痛み、苦悩に心を配る
・事件・事故・災害の被害者、家族に対し、節度をもった姿勢で接する
・名誉、プライバシー、肖像権を尊重する
・人種・性別・職業・境遇などによるあらゆる差別を排除する
【表現の言い換え基準】
俗語・スラング → 標準語:
・「マジで」→「本当に」「実際に」
・「ヤバい」→「深刻な」「大変な」「厳しい状況」
・「ガチで」→「本格的に」
・「怖い」→「不安」「懸念」
・「草」「www」→ 削除
・「〇〇って感じ」→「〇〇という声があります」
・「キモい」→「不快感」「違和感」
過激・感情的な表現 → 穏当・客観的な表現:
・「めっちゃ怖い」→「強い不安を感じている」「不安が広がっている」
・「最悪」→「厳しい状況」「深刻な状態」
・「ふざけるな」「許せない」→「批判の声」「反発の声」
・「死ぬほど〇〇」→「非常に〇〇」「大変〇〇」
・「終わってる」→「深刻な問題」
個人を特定する表現 → 匿名化:
・具体的な個人名 → 「関係者」「当事者」「投稿者」
・SNSアカウント名 → 削除または「ある投稿者」
・具体的な住所 → 「○○地域」「現地」
放送禁止表現:
・差別表現（人種、民族、性、職業、境遇、障害）
・個人攻撃、誹謗中傷
・断定的な表現（推定・可能性を示す表現に変換）
・煽り表現、過度にセンセーショナルな表現
・未確認情報を確定のように伝える表現
`,
    MODELS: [
        'gemini-2.5-flash',
        'gemini-2.0-flash',
        'gemini-1.5-flash-001'
    ],
    currentModelIndex: 0,
    resetModel() {
        this.currentModelIndex = 0;
    },
    getApiKey() {
        return localStorage.getItem('gemini_api_key') || '';
    },
    setApiKey(key) {
        localStorage.setItem('gemini_api_key', key);
    },
    getPhaseThreshold() {
        return parseInt(localStorage.getItem('phase_threshold') || '6', 10);
    },
    setPhaseThreshold(hours) {
        localStorage.setItem('phase_threshold', hours.toString());
    },
    getCurrentModel() {
        return this.MODELS[this.currentModelIndex];
    },
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    detectPhases(posts) {
        if (!posts || posts.length === 0) return [];
        const thresholdMs = this.getPhaseThreshold() * 60 * 60 * 1000;
        const phases = [];
        let currentPhase = { posts: [], startTime: null, endTime: null };
        const sortedPosts = [...posts].sort((a, b) =>
            new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
        );
        sortedPosts.forEach((post, index) => {
            const postTime = new Date(post.datetime).getTime();
            if (index === 0) {
                currentPhase.startTime = postTime;
                currentPhase.posts.push(post);
            } else {
                const prevTime = new Date(sortedPosts[index - 1].datetime).getTime();
                const gap = postTime - prevTime;
                if (gap > thresholdMs) {
                    currentPhase.endTime = prevTime;
                    phases.push({ ...currentPhase });
                    currentPhase = {
                        posts: [post],
                        startTime: postTime,
                        endTime: null
                    };
                } else {
                    currentPhase.posts.push(post);
                }
            }
        });
        if (currentPhase.posts.length > 0) {
            currentPhase.endTime = new Date(currentPhase.posts[currentPhase.posts.length - 1].datetime).getTime();
            phases.push(currentPhase);
        }
        const phaseNames = ['初期', '中期', '後期', '第4期', '第5期', '第6期', '第7期', '第8期'];
        return phases.map((phase, index) => ({
            ...phase,
            name: phaseNames[index] || `第${index + 1}期`,
            index: index
        }));
    },
    async detectTopicAndGenerateRules(posts, apiKey) {
        const samplePosts = posts.slice(0, 50).map(p => p.text).join('\n');
        const prompt = `あなたは災害時SNS分析の専門家です。以下のSNSデータを分析し、JSON形式で出力してください。
【タスク】
1. **災害トピック特定**: このデータの災害種別（地震/火災/豪雨など）と具体的な事象を特定してください。
2. **感情定義**: 固定された10個の災害特化感情について、このトピック特有の定義を作成してください。
【投稿サンプル】
${samplePosts}
【災害特化10感情カテゴリ】
- FEAR (恐怖): 直接体験している恐怖。「怖い」「逃げなきゃ」「揺れてる」
- SHOCK (衝撃): 驚き・予想外・信じられない。「まさか」「想像以上」「〜とな」「えっ」
- ANXIETY (不安): 自分の今後への不安。「どうなるの」「これからが心配」「余震が怖い」
- WORRY (心配): 他者への心配・安否確認。「大丈夫？」「無事を祈る」「気をつけて」
- SADNESS (悲しみ): 悲しみ・喪失感。「悲しい」「辛い」「亡くなった」
- ANGER (怒り): 対応への批判・怒り。「許せない」「対応が遅い」「何やってる」
- DISGUST (嫌悪): 状況への嫌悪。「ひどい」「最悪」「酷い」
- SOLIDARITY (連帯): 支援・応援・団結。「頑張れ」「支援したい」「力になりたい」
- RELIEF (安堵): 安心・感謝。「無事でよかった」「ほっとした」「助かった」
- FACTUAL (冷静): 純粋な事実のみ（感情表現なし）。「震度5」「死者○人」「避難指示」
【出力形式】**厳格なJSON形式**（必ずダブルクォート " を使用。末尾のカンマ禁止）
{
  "topic": "災害種別と具体的な事象",
  "rules": {
    "FEAR": "...."
  }
}
`;
        try {
            const result = await this.callApiWithRetry(prompt, apiKey);
            let rawJson = '';
            const codeBlockMatch = result.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
            if (codeBlockMatch) {
                rawJson = codeBlockMatch[1];
            } else {
                const jsonMatch = result.match(/\{[\s\S]*\}/);
                if (jsonMatch) rawJson = jsonMatch[0];
            }
            if (!rawJson) throw new Error('No JSON found in response');
            let parsed;
            try {
                const sanitized = rawJson.replace(/[\u0000-\u0019]+/g, '');
                parsed = JSON.parse(sanitized);
            } catch (e) {
                try {
                    parsed = new Function('return ' + rawJson)();
                } catch (e2) {
                    throw e2;
                }
            }
            let rulesText = '';
            if (parsed.rules && typeof parsed.rules === 'object') {
                rulesText = Object.entries(parsed.rules)
                    .map(([emotion, rule]) => `- **${emotion}**: ${rule}`)
                    .join('\n');
            }
            return {
                topic: parsed.topic || 'その他',
                rules: rulesText || ''
            };
        } catch (error) {
            return { topic: '分析対象（自動検出失敗）', rules: '' };
        }
    },
    async analyzeEmotions(posts, onProgress) {
        const apiKey = this.getApiKey();
        if (!apiKey) {
            throw new Error('Gemini APIキーが設定されていません。設定画面からAPIキーを入力してください。');
        }
        this.resetModel();
        this._promptLogged = false;
        this._responseLogged = false;
        if (onProgress) {
            onProgress(5, 'トピックを検出・ルールを生成中...');
        }
        const topicData = await this.detectTopicAndGenerateRules(posts, apiKey);
        this.currentTopicData = topicData;
        const batchSize = 20;
        const parallelBatches = 3;
        const delayBetweenGroups = 300;
        const batches = [];
        for (let i = 0; i < posts.length; i += batchSize) {
            batches.push({
                index: batches.length,
                posts: posts.slice(i, Math.min(i + batchSize, posts.length)),
                startIdx: i
            });
        }
        const results = new Array(posts.length);
        let processed = 0;
        for (let g = 0; g < batches.length; g += parallelBatches) {
            const group = batches.slice(g, g + parallelBatches);
            if (g > 0) {
                await this.delay(delayBetweenGroups);
            }
            const groupResults = await Promise.all(
                group.map(batch => this.analyzeBatchWithRetry(batch.posts, apiKey, topicData))
            );
            group.forEach((batch, idx) => {
                groupResults[idx].forEach((result, postIdx) => {
                    results[batch.startIdx + postIdx] = result;
                });
                processed += batch.posts.length;
            });
            if (onProgress) {
                const progress = Math.min(80, 10 + Math.round((processed / posts.length) * 70));
                onProgress(progress, `分析中... ${processed}/${posts.length}件`);
            }
        }
        return results;
    },
    async analyzeBatchWithRetry(posts, apiKey, topicData, retryCount = 0) {
        const maxRetries = 3;
        try {
            return await this.analyzeBatch(posts, apiKey, topicData);
        } catch (error) {
            if (error.message.includes('429') || error.message.includes('quota')) {
                if (retryCount < maxRetries) {
                    const waitTime = Math.pow(2, retryCount + 1) * 1000;
                    await this.delay(waitTime);
                    this.currentModelIndex = (this.currentModelIndex + 1) % this.MODELS.length;
                    return this.analyzeBatchWithRetry(posts, apiKey, topicData, retryCount + 1);
                }
            }
            return posts.map(post => this.fallbackAnalysis(post));
        }
    },
    async analyzeBatch(posts, apiKey, topicData) {
        const prompt = this.buildAnalysisPrompt(posts, topicData);
        if (!this._promptLogged) {
            this._promptLogged = true;
        }
        const model = this.getCurrentModel();
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
                    generationConfig: {
                        temperature: 0,
                        topP: 1,
                        topK: 1,
                        maxOutputTokens: 8192
                    }
                })
            }
        );
        if (!response.ok) {
            const errorData = await response.json();
            const errorMessage = errorData.error?.message || `HTTP ${response.status}`;
            throw new Error(errorMessage);
        }
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        if (!this._responseLogged) {
            this._responseLogged = true;
        }
        return this.parseAnalysisResult(text, posts);
    },
    getTopicRules(topic) {
        const rules = {
            DISASTER: `【災害・緊急事態トピック専用ルール - 最重要】
🚨 CALMは絶対に使いすぎないこと！以下はCALM禁止：
❌「気をつけてね」「大丈夫？」「無事でいて」→ これはWORRY
❌「怖い」「やばい」「ガチで」→ これはANXIETY
❌「皆さん」への呼びかけ → これはWORRY
❌ 感嘆符(！)や疑問符(？)が多い → 感情がある = CALM以外
❌「身の安全確保して」「十分に気を付けて」→ これはWORRY
✅ CALMにしていいのは「震度5でした」「〇〇で地震発生」のような感情ゼロの事実報告のみ
【具体的な分類例】
「大丈夫ですか」「無事ですか」「気をつけて」→ WORRY
「怖い」「やばい」「どうしよう」「マジで」→ ANXIETY  
「ひどい」「酷い」「最悪」→ DISGUST
「頑張れ」「応援」「祈ってる」→ LOVE
「？？」「どうなるの」「わからない」→ CONFUSION`,
            ENTERTAINMENT: `【エンタメトピック専用ルール】
⚠️ CALMは「完全に感情がない感想」に限定
- 「楽しい」「面白い」「笑」→ FUN
- 「好き」「推し」「ファン」→ LOVE
- 「嬉しい」「最高」→ JOY
- 「残念」「悲しい」→ SADNESS`,
            SPORTS: `【スポーツトピック専用ルール】
⚠️ CALMは「スコア報告のみ」に限定
- 「応援」「頑張れ」「ファン」→ LOVE
- 「勝った」「嬉しい」→ JOY
- 「負けた」「残念」→ SADNESS
- 「すごい」「やばい（良い意味）」→ JOY`,
            POLITICS: `【政治・社会問題トピック専用ルール】
- 「許せない」「おかしい」→ ANGER
- 「心配」「不安」→ WORRY
- 「どうなる」「わからない」→ CONFUSION`,
            CELEBRATION: `【祝い事トピック専用ルール】
⚠️ ポジティブ感情を積極的に分類
- 「おめでとう」「嬉しい」→ JOY
- 「好き」「大好き」→ LOVE
- 「楽しい」「盛り上がる」→ FUN`,
            GENERAL: `【一般ルール】
- 各感情の定義に従って分類
- CALMは純粋な情報提供・事実確認のみ
- 感嘆符や疑問符があれば感情がある可能性が高い`
        };
        return rules[topic] || rules.GENERAL;
    },
    buildAnalysisPrompt(posts, topicData = { topic: 'その他', rules: '' }) {
        const postsText = posts.map((post, i) =>
            `[${i}] ${post.text}`
        ).join('\n');
        return `あなたは災害時SNS感情分析の専門家です。以下の【AI策定ルール】に**厳密に従って**、各投稿を分析してください。
【検出されたトピック】
${topicData.topic}
【AI策定ルール - これに厳密に従うこと】
${topicData.rules}
【災害特化10感情カテゴリ】
🌪️ **FEAR（恐怖）** - 直接体験している恐怖
例: 「怖い」「揺れてる」「逃げなきゃ」「死ぬかと思った」
😲 **SHOCK（衝撃）** - 驚き・予想外・信じられない ★新カテゴリ
例: 「まさか」「想像以上」「〜とな」「信じられない」「えっ」
※ 恐怖には至らない驚きや衝撃はここに分類
😰 **ANXIETY（不安）** - 自分の将来・今後への不安
例: 「どうなるの」「これからが心配」「余震が怖い」
😟 **WORRY（心配）** - 他者・地域への心配
例: 「大丈夫？」「無事を祈る」「気をつけて」
💧 **SADNESS（悲しみ）** - 悲しみ・喪失感
例: 「悲しい」「泣ける」「辛い」「残念」
🔥 **ANGER（怒り）** - 怒り・批判・不満
例: 「許せない」「対応が遅い」「ふざけるな」
🤢 **DISGUST（嫌悪）** - 嫌悪・不快感
例: 「ひどい」「最悪」「酷すぎる」
💪 **SOLIDARITY（連帯）** - 支援・応援・団結
例: 「頑張れ」「支援したい」「力になりたい」
😌 **RELIEF（安堵）** - 安心・感謝
例: 「良かった」「ほっとした」「無事で安心」
📊 **FACTUAL（冷静）** - 純粋な事実のみ（感情表現なし）
例: 「震度5」「死者○人」「○時発生」「避難指示」
※ 少しでも感情表現があれば他カテゴリへ
【投稿】
${postsText}
【出力形式】JSON配列で以下を出力：
- index: 投稿番号
- emotion: 主要感情（10カテゴリから1つ）
- intensity: 感情の強度（1-5、5が最も強い）
- secondary: 二次感情（あれば。なければnull）
例:
[
  {"index":0,"emotion":"WORRY","intensity":4,"secondary":"SADNESS"},
  {"index":1,"emotion":"SHOCK","intensity":3,"secondary":null},
  {"index":2,"emotion":"FACTUAL","intensity":1,"secondary":null}
]
JSON配列のみを出力してください。`;
    },
    parseAnalysisResult(text, posts) {
        try {
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (!jsonMatch) {
                return posts.map(post => this.fallbackAnalysis(post));
            }
            const results = JSON.parse(jsonMatch[0]);
            const validEmotions = Object.keys(this.EMOTIONS);
            const emotionCounts = {};
            const parsedResults = posts.map((post, index) => {
                const result = results.find(r => r.index === index);
                if (result) {
                    let emotion = result.emotion;
                    const emotionMapping = {
                        'CALM': 'FACTUAL',
                        'NEUTRAL': 'FACTUAL',
                        'JOY': 'RELIEF',
                        'FUN': 'RELIEF',
                        'LOVE': 'SOLIDARITY',
                        'CONFUSION': 'ANXIETY'
                    };
                    if (emotionMapping[emotion]) {
                        emotion = emotionMapping[emotion];
                    }
                    if (!validEmotions.includes(emotion)) {
                        emotion = 'FACTUAL';
                    }
                    let secondary = result.secondary;
                    if (secondary && !validEmotions.includes(secondary)) {
                        secondary = null;
                    }
                    let intensity = result.intensity || 3;
                    intensity = Math.max(1, Math.min(5, intensity));
                    emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
                    return {
                        ...post,
                        emotion: emotion,
                        intensity: intensity,
                        secondary: secondary || null,
                        scores: result.scores || { [emotion]: intensity / 5 }
                    };
                }
                const fallback = this.fallbackAnalysis(post);
                emotionCounts[fallback.emotion] = (emotionCounts[fallback.emotion] || 0) + 1;
                return fallback;
            });
            return parsedResults;
        } catch (error) {
            return posts.map(post => this.fallbackAnalysis(post));
        }
    },
    fallbackAnalysis(post) {
        const text = post.text.toLowerCase();
        const scores = {};
        let maxEmotion = 'FACTUAL';
        let maxScore = 0;
        Object.entries(this.EMOTIONS).forEach(([key, val]) => {
            let score = 0;
            val.keywords.forEach(keyword => {
                if (text.includes(keyword.toLowerCase())) {
                    score += 0.3;
                }
            });
            score = Math.min(score, 1.0);
            if (score > 0) {
                scores[key] = score;
            }
            if (score > maxScore) {
                maxScore = score;
                maxEmotion = key;
            }
        });
        if (Object.keys(scores).length === 0) {
            scores.FACTUAL = 1.0;
        }
        const total = Object.values(scores).reduce((a, b) => a + b, 0);
        Object.keys(scores).forEach(key => {
            scores[key] = scores[key] / total;
        });
        return {
            ...post,
            emotion: maxEmotion,
            scores: scores
        };
    },
    async generatePastAnalysisReport(phases, apiKey) {
        if (!apiKey) {
            return '※ APIキーが設定されていないため、レポートを生成できません。';
        }
        const phasesDetail = phases.map(phase => {
            const emotionCounts = {};
            phase.posts.forEach(post => {
                emotionCounts[post.emotion] = (emotionCounts[post.emotion] || 0) + 1;
            });
            const total = phase.posts.length || 1;
            const emotionData = Object.entries(emotionCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([emotion, count]) => `${this.EMOTIONS[emotion]?.name || emotion}: ${count}件(${((count / total) * 100).toFixed(0)}%)`)
                .join(', ');
            const samples = phase.posts.slice(0, 15).map((p, i) => {
                const emotionInfo = this.EMOTIONS[p.emotion] || {};
                return `${i + 1}. [${emotionInfo.name || p.emotion}] 「${p.text.substring(0, 80)}${p.text.length > 80 ? '...' : ''}」`;
            }).join('\n');
            return `【${phase.name}】\n投稿数: ${phase.posts.length}件\n感情分布: ${emotionData}\n\n代表的な投稿（感情ラベル付き）:\n${samples}`;
        }).join('\n\n---\n\n');
        const prompt = `SNS感情分析の期間別レポートを作成。
【データ】
${phasesDetail}
【出力形式】各期間（初期・中期・後期）で以下の完全に同じ構造を使用（マインドマップ用）：
# 初期
## WHY分析（詳細）
- 心理的背景: この感情が発生した深層心理を詳細に分析。地域特有の事情があれば言及。
- トリガー: 何がきっかけで感情が変化したか（余震、報道、デマ等）。
- 社会的・地域的要因: 南海トラフや原発など、その地域特有の文脈がどう影響したか。
【重要ルール】
- HTMLタグ禁止
- 各期間で完全に同じ見出し・項目名を使用
- **各期間1000〜1200字程度**で記述すること。
- 「感情分布」や「まとめ」は一切不要。Why分析（要因特定）のみを出力すること。`;
        return await this.callApiWithRetry(prompt, apiKey);
    },
    async callApiWithRetry(prompt, apiKey, retryCount = 0, config = {}) {
        const maxRetries = 5;
        const model = this.getCurrentModel();
        const generationConfig = {
            temperature: config.temperature !== undefined ? config.temperature : 0,
            topP: 1,
            topK: 1,
            maxOutputTokens: 8192,
            ...config
        };
        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: generationConfig
                    })
                }
            );
            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData.error?.message || `HTTP ${response.status}`;
                if (response.status === 429 && retryCount < maxRetries) {
                    const waitTime = Math.pow(2, retryCount + 1) * 1000;
                    await this.delay(waitTime);
                    this.currentModelIndex = (this.currentModelIndex + 1) % this.MODELS.length;
                    return this.callApiWithRetry(prompt, apiKey, retryCount + 1);
                }
                throw new Error(errorMessage);
            }
            const data = await response.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text || '分析結果を取得できませんでした。';
        } catch (error) {
            if (retryCount < maxRetries && (error.message.includes('429') || error.message.includes('quota'))) {
                const waitTime = Math.pow(2, retryCount + 1) * 1000;
                await this.delay(waitTime);
                this.currentModelIndex = (this.currentModelIndex + 1) % this.MODELS.length;
                return this.callApiWithRetry(prompt, apiKey, retryCount + 1);
            }
            return `※ API制限のためレポートを生成できませんでした。しばらく待ってから再度お試しください。\n\n辞書ベース分析の結果は上記グラフで確認できます。`;
        }
    },
    aggregateEmotionsByPhase(phases) {
        return phases.map(phase => {
            const emotionCounts = {};
            Object.keys(this.EMOTIONS).forEach(key => {
                emotionCounts[key] = 0;
            });
            const posts = (phase.posts && Array.isArray(phase.posts)) ? phase.posts : [];
            posts.forEach(post => {
                if (post.emotion && emotionCounts.hasOwnProperty(post.emotion)) {
                    emotionCounts[post.emotion]++;
                }
            });
            const total = posts.length || 1;
            const emotionPercentages = {};
            Object.keys(emotionCounts).forEach(key => {
                emotionPercentages[key] = (emotionCounts[key] / total) * 100;
            });
            return {
                phaseName: phase.name,
                counts: emotionCounts,
                percentages: emotionPercentages,
                total: posts.length
            };
        });
    },
    splitIntoThreePhases(posts) {
        if (!posts || posts.length < 10) {
            return [{ name: '全期間', posts: posts, startTime: null, endTime: null }];
        }
        const sortedPosts = [...posts].sort((a, b) =>
            new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
        );
        const total = sortedPosts.length;
        const timestamps = sortedPosts.map(p => new Date(p.datetime).getTime());
        const idx20 = Math.floor(total * 0.20);
        const idx40 = Math.floor(total * 0.40);
        const idx60 = Math.floor(total * 0.60);
        const idx80 = Math.floor(total * 0.80);
        let maxGap1 = 0;
        let splitIdx1 = Math.floor(total * 0.33);
        for (let i = idx20; i < idx60; i++) {
            const gap = timestamps[i + 1] - timestamps[i];
            if (gap > maxGap1) {
                maxGap1 = gap;
                splitIdx1 = i + 1;
            }
        }
        let startIdx2 = splitIdx1 + Math.floor(total * 0.20);
        if (startIdx2 >= idx80) startIdx2 = Math.floor(total * 0.60);
        let maxGap2 = 0;
        let splitIdx2 = Math.floor(total * 0.66);
        for (let i = startIdx2; i < idx80 && i < total - 1; i++) {
            const gap = timestamps[i + 1] - timestamps[i];
            if (gap > maxGap2) {
                maxGap2 = gap;
                splitIdx2 = i + 1;
            }
        }
        const phase1Posts = sortedPosts.slice(0, splitIdx1);
        const phase2Posts = sortedPosts.slice(splitIdx1, splitIdx2);
        const phase3Posts = sortedPosts.slice(splitIdx2);
        const phases = [
            {
                name: '初期フェーズ',
                posts: phase1Posts,
                startTime: phase1Posts.length > 0 ? new Date(phase1Posts[0].datetime).getTime() : null,
                endTime: phase1Posts.length > 0 ? new Date(phase1Posts[phase1Posts.length - 1].datetime).getTime() : null
            },
            {
                name: '中期フェーズ',
                posts: phase2Posts,
                startTime: phase2Posts.length > 0 ? new Date(phase2Posts[0].datetime).getTime() : null,
                endTime: phase2Posts.length > 0 ? new Date(phase2Posts[phase2Posts.length - 1].datetime).getTime() : null
            },
            {
                name: '後期フェーズ',
                posts: phase3Posts,
                startTime: phase3Posts.length > 0 ? new Date(phase3Posts[0].datetime).getTime() : null,
                endTime: phase3Posts.length > 0 ? new Date(phase3Posts[phase3Posts.length - 1].datetime).getTime() : null
            }
        ].filter(phase => phase.posts.length > 0);
        return phases;
    },
    async generateBroadcastScript(phases, apiKey) {
        if (!apiKey) {
            return '※ APIキーが設定されていないため、放送原稿を生成できません。';
        }
        const phasesSummary = phases.map(phase => {
            const emotionCounts = {};
            phase.posts.forEach(post => {
                emotionCounts[post.emotion] = (emotionCounts[post.emotion] || 0) + 1;
            });
            const topEmotions = Object.entries(emotionCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([emotion, count]) => `${this.EMOTIONS[emotion]?.name || emotion}: ${count}件`)
                .join(', ');
            return `【${phase.name}】投稿数: ${phase.posts.length}件, 主要感情: ${topEmotions}`;
        }).join('\n');
        const samplePosts = phases.flatMap(phase =>
            phase.posts.slice(0, 5).map(p => p.text)
        ).slice(0, 15).join('\n');
        const prompt = `あなたは放送局の報道記者です。以下のSNS感情分析結果に基づいて、**放送用ニュース原稿**を作成してください。
【分析データ】
${phasesSummary}
【SNS投稿サンプル】
${samplePosts}
【要求】
1. **90秒で読める約400字**の原稿を作成
2. **放送倫理に配慮**：個人攻撃、差別表現、過度な煽りを避ける
3. **客観的な事実**と**世論の傾向**を報じるスタイル
4. 冒頭でトピックを明確にし、感情の推移を時系列で説明
5. 最後に今後の見通しや提言を簡潔に
【重要】
- 「〜という声が上がっています」のような客観的表現を使用
- 断定的な表現を避け、「〜とみられます」などを使用
- 視聴者が理解しやすい平易な言葉を使用
原稿のみを出力してください。`;
        return await this.callApiWithRetry(prompt, apiKey);
    },
    async generateConversionLog(phases, apiKey) {
        if (!apiKey) {
            return [];
        }
        const samplePosts = phases.flatMap(phase =>
            phase.posts.slice(0, 10).map(p => p.text)
        ).slice(0, 20).join('\n');
        const prompt = `あなたは放送倫理の専門家です。以下のSNS投稿から、**放送用に変換が必要な表現**を3つ選び、変換例を示してください。
【SNS投稿】
${samplePosts}
【要求】
以下のJSON形式のみを出力してください。
[
  {"before": "SNSの生の表現", "after": "放送用に変換した表現", "reason": "変換理由"},
  {"before": "...", "after": "...", "reason": "..."},
  {"before": "...", "after": "...", "reason": "..."}
]
【変換の基準】
- 過激な表現 → 穏当な表現
- 俗語・スラング → 標準語
- 感情的な表現 → 客観的な表現
- 個人を特定する表現 → 匿名化`;
        try {
            const model = this.getCurrentModel();
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: {
                            temperature: 0,
                            topP: 1,
                            topK: 1,
                            maxOutputTokens: 8192
                        }
                    })
                }
            );
            if (!response.ok) {
                return [];
            }
            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            return [];
        } catch (error) {
            return [];
        }
    },
    async generateBroadcastScriptForPhase(phase, phaseIndex, apiKey) {
        if (!apiKey) {
            return '※ APIキーが設定されていないため、放送原稿を生成できません。';
        }
        const emotionCounts = {};
        phase.posts.forEach(post => {
            emotionCounts[post.emotion] = (emotionCounts[post.emotion] || 0) + 1;
        });
        const topEmotions = Object.entries(emotionCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([emotion]) => this.EMOTIONS[emotion]?.name || emotion);
        const samplePosts = phase.posts.slice(0, 20).map(p => p.text).join('\n');
        const prompt = `あなたは放送局のニュースキャスターです。以下のSNS投稿データを基に、**テレビでそのまま読める放送用ニュース原稿**を作成してください。
【${phase.name}のSNS投稿サンプル】
${samplePosts}
【主要な世論の傾向】
${topEmotions.join('、')}の声が広がっています
---
${this.BROADCAST_STANDARDS}
---
## 原稿作成の指示
【重要ルール】
1. SNSの生の声をそのまま使わない - 必ず上記の「表現の言い換え基準」に従って変換する
2. 数値・パーセンテージは一切使わない（「多くの」「一部の」等で表現）
3. 約400字の原稿を作成
4. 断定を避け「〜とみられます」「〜の可能性があります」を使用
【原稿の構成】
1. リード（状況説明）: 何についての話題か
2. SNSの反応: 「SNS上では〜という声が多数寄せられています」の形式で紹介
3. 背景・詳細: 状況の補足
4. 締めくくり: 注意喚起や今後の展望
【参考例】
「〇〇が発生しました。△△では□□が確認されています。
SNS上では□□を心配する声が多数寄せられています。また、〜という声も上がっています。
〇〇については、△△の状況にあり、□□が懸念されています。
引き続き、最新の情報を確認し、〇〇を心がけてください。」
原稿のみを出力してください。`;
        return await this.callApiWithRetry(prompt, apiKey);
    },
    async generateConversionLogForPhase(phase, script, apiKey) {
        if (!apiKey) {
            return [];
        }
        const samplePosts = phase.posts.slice(0, 20).map(p => p.text).join('\n');
        const prompt = `あなたは放送倫理の専門家です。以下のSNS投稿を基に作成された【放送原稿】があります。
この放送原稿で言及されている内容（世論や感情）の**根拠となったSNSの具体的な表現**を特定し、それが放送基準に照らしてどのように変換・要約されたかを示すログを作成してください。
※ 原稿で取り上げられていない話題の投稿は除外しますが、原稿内の「～という声」の元になった具体的な投稿は積極的に取り上げてください。
※ **【必須】必ず1つ以上の変換ログを出力してください。**もし明確な倫理違反がない場合でも、SNSの口語的表現（「〜だし」「やばい」など）が、放送原稿の丁寧な表現（「〜状況にあり」「深刻な」）に変わった箇所を必ず見つけて記載してください。
【${phase.name}のSNS投稿（ソース）】
${samplePosts}
【作成された放送原稿】
${script}
---
${this.BROADCAST_STANDARDS}
---
【タスク】
上記の放送基準に従って、SNS投稿内の変換が必要な表現を抽出し、放送用に変換してください。
【重要：放送基準の具体的な条項を引用すること】
変換理由には、以下のいずれかを必ず明記してください：
■ 放送倫理手帳2025からの引用例：
- 「放送倫理手帳2025 第1章 人権(1)」
- 「放送倫理手帳2025 第6章 報道の責任(35)」
- 「放送倫理手帳2025 第8章 表現上の配慮(45)」
■ 民放連放送基準解説書2024からの引用例：
- 「民放連放送基準 第42条」
- 「民放連報道指針」
■ 言い換え基準からの引用例：
- 「俗語・スラング→標準語の言い換え基準」
- 「過激表現→穏当表現の言い換え基準」
- 「個人特定表現→匿名化の基準」
【重要：出力の絶対条件】
1. **"after"の不一致禁止**: "after" の内容は、提供された【作成された放送原稿】の中に**一字一句完全に一致する文字列**でなければなりません。
2. 原稿内に存在しない言葉を "after" に設定しないでください。要約や言い換えで多少文言が変わっている場合は、原稿内で実際に使われている文言を "after" に指定してください。
【出力形式】
以下のJSON形式のみを出力してください：
[
  {
    "before": "SNSの生の表現（実際の投稿から抜粋）",
    "after": "放送原稿内で実際に使われている表現（完全一致）",
    "reason": "【放送倫理手帳2025 第8章(47)】下品・卑わいな表現を避けるため、『ヤバい』を『深刻な状況』に変換",
    "standardType": "ethics"
  }
]
※ standardTypeは以下のいずれか：
- "ethics": 放送倫理手帳2025からの引用
- "minporen": 民放連放送基準解説書2024からの引用
- "conversion": 言い換え基準からの引用`;
        try {
            const model = this.getCurrentModel();
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: {
                            temperature: 0,
                            topP: 1,
                            topK: 1,
                            maxOutputTokens: 4096
                        }
                    })
                }
            );
            if (!response.ok) {
                return [];
            }
            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            return [];
        } catch (error) {
            return [];
        }
    },
    async generateSummaryReport(phases, apiKey) {
        if (!apiKey) {
            return '※ APIキーが設定されていないため、総括レポートを生成できません。';
        }
        const phasesDetail = phases.map((phase, idx) => {
            const emotionCounts = {};
            phase.posts.forEach(post => {
                emotionCounts[post.emotion] = (emotionCounts[post.emotion] || 0) + 1;
            });
            const total = phase.posts.length || 1;
            const emotionData = Object.entries(emotionCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([emotion, count]) => `${this.EMOTIONS[emotion]?.name || emotion}: ${((count / total) * 100).toFixed(0)}%`)
                .join(', ');
            const timeInfo = phase.startTime ? new Date(phase.startTime).toLocaleString('ja-JP') : '';
            return `【${phase.name}】(${timeInfo})\n投稿数: ${phase.posts.length}件\n感情分布: ${emotionData}`;
        }).join('\n\n');
        const prompt = `あなたは社会心理学の専門家です。以下のSNS感情分析の全期間データに基づいて、**感情推移の総括レポート**を作成してください。
【分析データ】
${phasesDetail}
---
## 1. 感情変化の要因と背景 (Deep Factor Analysis)
全体的な傾向を把握し、以下を分析してください：
### 主要な感情の変化パターン
投稿内容から話題の性質を判断し、適切な分析を行う：
**ネガティブな話題の場合:**
- ANXIETY（不安）: 未知の脅威や不確実性に対する漠然とした恐れ
- WORRY（心配）: 特定の対象への懸念、他者への気遣い
- この2つの比率変化が何を意味するか
**ポジティブな話題の場合:**
- JOY（喜び）: 達成感、成功への祝福
- FUN（楽しさ）: エンターテイメント性、盛り上がり
- LOVE（愛情）: 愛着、応援の気持ち
- ポジティブ感情の盛り上がりと変化
**複合的な話題の場合:**
- 賛否両論の展開
- 感情の分化と対立
### 時間経過による感情変化の理由
- 各期間での感情がなぜそうなったか
- 外部要因（ニュース、発表、イベントなど）の影響
---
## 2. 社会心理学的考察と今後の展望
### 人々が最終的にどのような心理状態に着地したか
- 安堵、満足、諦め、期待、怒り、悲しみなど
### 今後予想される感情の変化
- 話題の性質に応じて、今後どのような感情変化が予想されるか
- 注意すべきリスクや期待できるポジティブな展開
---
【重要】
- 投稿内容から話題を自動判別し、適切な分析を行う
- 各フェーズ間の変化を比較分析
- 論理的な因果関係を説明
- 1500文字程度で詳細に分析
総括レポートのみを出力してください。`;
        return await this.callApiWithRetry(prompt, apiKey);
    },
    async validateEmotionLabels(phases, apiKey) {
        if (!apiKey) throw new Error('APIキーが未設定です');
        const SAMPLES_PER_PHASE = 10;
        let allDetails = [];
        let totalCorrect = 0;
        let totalProcessed = 0;
        let totalConfidence = 0;
        for (const phase of phases) {
            const sampledPosts = phase.posts
                .sort(() => 0.5 - Math.random())
                .slice(0, SAMPLES_PER_PHASE);
            if (sampledPosts.length === 0) continue;
            const postsText = sampledPosts.map((p, i) => {
                const emotionName = this.EMOTIONS[p.emotion]?.name || p.emotion;
                return `[${i}] ラベル:「${emotionName}」 投稿:「${p.text}」`;
            }).join('\n');
            const prompt = `あなたは厳格な感情分析の外部監査人です。AIが自動分類した結果を**第三者の立場で公正に審査**してください。
- あなたはこの分類を行ったAIとは別の評価者です。**忖度は不要**です。
- 感情分析の難しさを考慮しつつ、**もっとも妥当と思われる感情**を選択してください。
- 文脈から明らかに読み取れない場合のみ false にしてください。
- 特に以下のケースに注意して審査してください：
  ① 複数の感情が混在する投稿 → 主感情の選択が最適か？
  ② 似た感情カテゴリ間（FEAR↔ANXIETY, WORRY↔ANXIETY, SHOCK↔FEAR, ANGER↔DISGUST）
  ③ FACTUAL判定すべき事実報告に感情ラベルが付いていないか
  ④ 皮肉・反語表現の誤読
【10感情カテゴリの厳密な定義】
FEAR（恐怖）: 自分自身が直接的に危険を感じている。「怖い」「逃げなきゃ」
SHOCK（衝撃）: 予想外の事態への驚き。「まさか」「信じられない」
ANXIETY（不安）: 今後・将来への漠然とした不安。「これからどうなるの」
WORRY（心配）: 他者や地域を気遣う。「大丈夫？」「無事を祈る」
SADNESS（悲しみ）: 喪失・悲嘆。「悲しい」「泣ける」
ANGER（怒り）: 怒り・批判・不満。「許せない」「対応が遅い」
DISGUST（嫌悪）: 嫌悪・不快・軽蔑。「ひどい」「最悪」
SOLIDARITY（連帯）: 支援・応援・団結。「頑張れ」「支援したい」
RELIEF（安堵）: 安心・感謝。「良かった」「ほっとした」
FACTUAL（冷静）: 感情を含まない事実記述。「震度5」「○時に発生」
【審査対象（フェーズ: ${phase.name}）】
${postsText}
【出力形式】JSON配列のみ出力:
[
  {"index":0, "correct":true, "confidence":5, "reason":"..."},
  {"index":1, "correct":false, "confidence":3, "reason":"...", "suggestedEmotion":"ANXIETY"}
]
JSON配列のみを出力してください。`;
            const text = await this.callApiWithRetry(prompt, apiKey, 0, { temperature: 0.8 });
            let reviews = [];
            try {
                const jsonMatch = text.match(/\[[\s\S]*\]/);
                if (jsonMatch) {
                    reviews = JSON.parse(jsonMatch[0]);
                }
            } catch (e) {
            }
            sampledPosts.forEach((post, i) => {
                const review = reviews.find(r =>
                    r.index == i || r.id == i || r.id == (i + 1) || r.no == (i + 1)
                );
                const isCorrect = review ? review.correct : false;
                const confidence = review ? review.confidence : 0;
                if (isCorrect) totalCorrect++;
                totalProcessed++;
                totalConfidence += confidence;
                allDetails.push({
                    text: post.text.substring(0, 50) + (post.text.length > 50 ? '...' : ''),
                    original: this.EMOTIONS[post.emotion]?.name || post.emotion,
                    match: isCorrect,
                    confidence: confidence,
                    reason: review?.reason || 'AI応答エラー: 判定結果取得失敗',
                    reClassified: review?.suggestedEmotion ? (this.EMOTIONS[review.suggestedEmotion]?.name || review.suggestedEmotion) : null
                });
            });
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        return {
            accuracy: totalProcessed > 0 ? Math.round((totalCorrect / totalProcessed) * 100) : 0,
            avgConfidence: totalProcessed > 0 ? (totalConfidence / totalProcessed).toFixed(1) : 0,
            total: totalProcessed,
            matches: totalCorrect,
            details: allDetails
        };
    },
    async validateFactorConsistency(phases, apiKey) {
        if (!apiKey) throw new Error('APIキーが未設定です');
        const phaseStats = this.aggregateEmotionsByPhase(phases);
        const statsText = phaseStats.map(ps => {
            const emotionList = Object.entries(ps.percentages)
                .sort((a, b) => b[1] - a[1])
                .filter(([_, v]) => v > 0)
                .map(([key, val]) => `${this.EMOTIONS[key]?.name || key}: ${val.toFixed(1)}%`)
                .join(', ');
            return `【${ps.phaseName}】(${ps.total}件)\n${emotionList}`;
        }).join('\n\n');
        const inferPrompt = `あなたは災害時SNS感情分析の専門家です。
以下は、ある災害に関するSNS投稿の感情分布データです（数値のみ、投稿原文は非公開）。
${statsText}
【タスク】
この数値パターンから推測される「感情が生じた要因」を、各期間ごとに3つずつ箇条書きで列挙してください。
数値の変化（増減）に注目し、論理的に推測してください。
【出力形式】
初期の要因:
- 要因1
- 要因2
- 要因3
中期の要因:
- 要因1
...
後期の要因:
- 要因1
...
推測要因のみを出力してください。`;
        const inferredText = await this.callApiWithRetry(inferPrompt, apiKey, 0, { temperature: 1.0 });
        const samplePosts = phases.map(phase => {
            const samples = phase.posts.slice(0, 10)
                .map(p => p.text.substring(0, 80))
                .join('\n');
            return `【${phase.name}】\n${samples}`;
        }).join('\n\n');
        const actualPrompt = `以下のSNS投稿から、感情が生じた「実際の要因」を各期間ごとに3つずつ箇条書きで列挙してください。
${samplePosts}
【出力形式】
初期の要因:
- 要因1
- 要因2
- 要因3
中期の要因:
...
後期の要因:
...
要因のみを出力してください。`;
        const actualText = await this.callApiWithRetry(actualPrompt, apiKey, 0, { temperature: 1.0 });
        const comparePrompt = `あなたは学術論文の査読者です。以下の2つの要因リストを比較し、整合性を評価してください。
【リストA: 数値パターンのみから推測した要因】
${inferredText}
【リストB: 投稿原文から抽出した実際の要因】
${actualText}
【タスク】
1. 各期間について、リストAとリストBの要因がどの程度一致しているか評価
2. 全体の整合性スコアを0〜100%で算出
3. 一致している点と相違点を簡潔に説明
【出力形式】以下のJSON形式のみ出力:
{
  "consistencyScore": 85,
  "summary": "全体的に高い整合性が確認された。初期の衝撃要因...",
  "periodResults": [
    {"period": "初期", "score": 90, "note": "共通: ..."},
    {"period": "中期", "score": 80, "note": "..."},
    {"period": "後期", "score": 85, "note": "..."}
  ]
}
JSON形式のみを出力してください。`;
        const compareText = await this.callApiWithRetry(comparePrompt, apiKey, 0, { temperature: 1.0 });
        let result = { consistencyScore: 0, summary: '', periodResults: [] };
        try {
            const jsonMatch = compareText.match(/\{[\s\S]*\}/);
            if (jsonMatch) result = JSON.parse(jsonMatch[0]);
        } catch (e) {
        }
        return {
            consistency: result.consistencyScore || 0,
            summary: result.summary || '解析できませんでした',
            periodResults: result.periodResults || [],
            inferredFactors: inferredText,
            actualFactors: actualText
        };
    }
};
window.GeminiAnalyzer = GeminiAnalyzer;