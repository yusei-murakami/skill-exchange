// サンプルスキルデータ
const sampleSkills = [
    {
        id: 1,
        name: '英語',
        description: '簡単な英会話が交わせるレベルです。',
        experience: '3年',
        level: 2,
        maxLevel: 5
    },
    {
        id: 2,
        name: 'Python',
        description: 'Webアプリケーション開発の経験があります。',
        experience: '5年',
        level: 4,
        maxLevel: 5
    },
    {
        id: 3,
        name: 'デザイン',
        description: 'UI/UXデザインの基本を理解しています。',
        experience: '2年',
        level: 3,
        maxLevel: 5
    },
    {
        id: 4,
        name: 'マーケティング',
        description: 'ソーシャルメディアマーケティングの経験があります。',
        experience: '4年',
        level: 3,
        maxLevel: 5
    },
    {
        id: 5,
        name: 'プレゼンテーション',
        description: '企業向けプレゼンテーションスキルを持っています。',
        experience: '6年',
        level: 4,
        maxLevel: 5
    }
];

/**
 * 星評価をHTMLで生成
 * @param {number} level - 現在のレベル
 * @param {number} maxLevel - 最大レベル
 * @returns {string} 星のHTML
 */
function generateStarRating(level, maxLevel) {
    let starsHTML = '<div class="star-rating">';
    
    for (let i = 0; i < maxLevel; i++) {
        if (i < level) {
            starsHTML += '<span class="star">★</span>';
        } else {
            starsHTML += '<span class="star empty">☆</span>';
        }
    }
    
    starsHTML += '</div>';
    return starsHTML;
}

/**
 * スキルカードHTMLを生成
 * @param {object} skill - スキルオブジェクト
 * @returns {string} スキルカードのHTML
 */
function generateSkillCard(skill) {
    const starsHTML = generateStarRating(skill.level, skill.maxLevel);
    
    return `
        <div class="skill-card" data-skill-id="${skill.id}">
            <div>
                <h2 class="skill-name">${skill.name}</h2>
                <div class="skill-name-divider"></div>
            </div>
            <p class="skill-description">${skill.description}</p>
            <div class="skill-details">
                <div class="skill-detail-item">
                    <span class="skill-detail-label">経験年数：</span>
                    <span class="skill-detail-value">${skill.experience}</span>
                </div>
                <div class="skill-detail-item">
                    <span class="skill-detail-label">レベル：</span>
                    ${starsHTML}
                </div>
            </div>
        </div>
    `;
}

/**
 * スキル一覧を表示
 * @param {array} skills - スキルのリスト
 */
function renderSkillList(skills) {
    const container = document.getElementById('skillCardsContainer');
    container.innerHTML = '';
    
    skills.forEach(skill => {
        const cardHTML = generateSkillCard(skill);
        container.insertAdjacentHTML('beforeend', cardHTML);
    });
    
    // スキルカードのクリックイベント
    document.querySelectorAll('.skill-card').forEach(card => {
        card.addEventListener('click', function() {
            const skillId = this.getAttribute('data-skill-id');
            console.log(`スキルID ${skillId} がクリックされました`);
            // ここで詳細ページへの遷移などを実装
        });
    });
}

// ページ読み込み時に実行
document.addEventListener('DOMContentLoaded', function() {
    renderSkillList(sampleSkills);
});
