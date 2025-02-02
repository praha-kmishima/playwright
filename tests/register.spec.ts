import { test, expect } from '@playwright/test';

// テストで使用する共通の値
const TEST_USER = {
  email: `test${Date.now()}@example.com`,
  password: 'testtest',
  name: 'テストユーザー'
};

test.describe('会員登録機能のテスト', () => {
  test.beforeEach(async ({ page }) => {
    // 各テストの前にホームページに移動し、ページが完全に読み込まれるまで待機
    await page.goto('https://hotel-example-site.takeyaqa.dev/ja/');
    await page.waitForLoadState('networkidle');
  });

  test('必須項目のみで会員登録ができ、その後マイページで登録内容を確認できる', async ({ page }) => {
    // ログインページから会員登録ページへ移動
    await page.getByRole('link', { name: '会員登録' }).click();

    // 必須項目の入力
    await page.getByRole('textbox', { name: 'メールアドレス 必須' }).fill(TEST_USER.email);
    await page.getByRole('textbox', { name: 'パスワード 必須' }).fill(TEST_USER.password);
    await page.getByRole('textbox', { name: 'パスワード（確認） 必須' }).fill(TEST_USER.password);
    await page.getByRole('textbox', { name: '氏名 必須' }).fill(TEST_USER.name);
    await page.getByText('一般会員').click();

    // 登録実行
    await page.getByRole('button', { name: '登録' }).click();

    // マイページで登録内容を確認
    await expect(page.getByRole('heading', { name: 'マイページ' })).toBeVisible();
    
    // 登録した情報の確認
    await expect(page.getByRole('listitem').filter({ hasText: `メールアドレス ${TEST_USER.email}` })).toBeVisible();
    await expect(page.getByRole('listitem').filter({ hasText: `氏名 ${TEST_USER.name}` })).toBeVisible();
    await expect(page.getByRole('listitem').filter({ hasText: '会員ランク 一般会員' })).toBeVisible();
    
    // 未登録項目の確認
    await expect(page.getByRole('listitem').filter({ hasText: '住所 未登録' })).toBeVisible();
    await expect(page.getByRole('listitem').filter({ hasText: '電話番号 未登録' })).toBeVisible();
    await expect(page.getByRole('listitem').filter({ hasText: '性別 未登録' })).toBeVisible();
    await expect(page.getByRole('listitem').filter({ hasText: '生年月日 未登録' })).toBeVisible();
    await expect(page.getByRole('listitem').filter({ hasText: 'お知らせ 受け取らない' })).toBeVisible();

    // 追加の機能が存在することを確認
    await expect(page.getByText('アイコン設定')).toBeVisible();
    await expect(page.getByText('退会する')).toBeVisible();
  });
});
