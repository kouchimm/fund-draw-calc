/**
 * 投資信託取り崩し金額計算アプリのメインスクリプト
 */

// 計算タイマー用の変数
let calculationTimer = null;

/**
 * 取り崩し金額を計算する関数
 */
function calculateSaleAmount() {
    // 入力値の取得
    const requiredCash = parseFloat(document.getElementById('requiredCash').value) || 0;
    const currentValue = parseFloat(document.getElementById('currentValue').value) || 0;
    const profitLoss = parseFloat(document.getElementById('profitLoss').value) || 0;
    const accountType = document.getElementById('accountType').value;

    // フォームの入力チェック
    if (!requiredCash || !currentValue || isNaN(profitLoss)) {
        return; // 必須項目が入力されていない場合は処理を中断
    }

    // 預り区分に基づいて税率を設定
    let taxRate = 0;
    if (accountType === 'tokutei') { // 特定・一般
        taxRate = 0.20315;
    } else if (accountType === 'nisa') { // NISA
        taxRate = 0;
    }

    // バリデーション
    if (requiredCash <= 0 || currentValue <= 0) {
        alert('必要な現金額と保有金額は正の値を入力してください');
        return;
    }

    // 計算ロジック
    let saleAmount, taxAmount, netAmount, saleRatio;

    if (profitLoss <= 0 || taxRate === 0) {
        // 損失または損益なし、あるいはNISA（非課税）の場合、税金はかからない
        saleAmount = requiredCash;
        taxAmount = 0;
    } else {
        // 利益がある場合の計算
        // 売却額を計算: 必要現金額 = 売却額 - 税金
        // 税金 = 利益部分 × 税率
        // 利益部分 = 売却額 × (評価損益 / 現在評価額)
        const profitRatio = profitLoss / currentValue;
        saleAmount = requiredCash / (1 - (profitRatio * taxRate));
        taxAmount = saleAmount * profitRatio * taxRate;
    }

    netAmount = saleAmount - taxAmount;
    saleRatio = (saleAmount / currentValue) * 100;

    // 最大値を超えないよう調整
    if (saleAmount > currentValue) {
        saleAmount = currentValue;
        saleRatio = 100;

        // 損益に応じた税金を再計算
        if (profitLoss > 0 && taxRate > 0) {
            taxAmount = profitLoss * taxRate;
        } else {
            taxAmount = 0;
        }

        netAmount = saleAmount - taxAmount;
    }

    // 結果の表示
    document.getElementById('saleAmount').textContent = Math.round(saleAmount).toLocaleString() + '円';
    document.getElementById('taxAmount').textContent = Math.round(taxAmount).toLocaleString() + '円';
    document.getElementById('netAmount').textContent = Math.round(netAmount).toLocaleString() + '円';
    document.getElementById('saleRatio').textContent = saleRatio.toFixed(2) + '%';

    // 結果カードを表示
    const resultCard = document.getElementById('resultCard');
    resultCard.classList.add('show');

    // スムーズスクロール
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * 遅延計算を実行する関数
 * 入力後1000ms待ってから計算を実行する
 */
function delayedCalculate() {
    // 既存のタイマーをクリア
    if (calculationTimer) {
        clearTimeout(calculationTimer);
    }

    // 1000ms後に計算を実行するタイマーを設定
    calculationTimer = setTimeout(function () {
        calculateSaleAmount();
        calculationTimer = null;
    }, 1000);
}

/**
 * フォームのイベントリスナーを設定
 */
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('calculationForm');
    const requiredCashInput = document.getElementById('requiredCash');
    const currentValueInput = document.getElementById('currentValue');
    const profitLossInput = document.getElementById('profitLoss');
    const accountTypeSelect = document.getElementById('accountType');

    // フォーム内でEnterキーが押されたときの処理
    form.addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();

            // タイマーをクリアして即時計算
            if (calculationTimer) {
                clearTimeout(calculationTimer);
                calculationTimer = null;
            }

            calculateSaleAmount();
        }
    });

    // 各入力フィールドに入力イベントリスナーを設定
    requiredCashInput.addEventListener('input', delayedCalculate);
    currentValueInput.addEventListener('input', delayedCalculate);
    profitLossInput.addEventListener('input', delayedCalculate);
    accountTypeSelect.addEventListener('change', delayedCalculate);
});
